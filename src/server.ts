import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const usersFile = join(process.cwd(), 'data', 'users.json');
const scrypt = promisify(scryptCallback);

interface StoredUser {
  email: string;
  passwordHash: string;
  createdAt: string;
}

async function getUsers(): Promise<StoredUser[]> {
  try {
    return JSON.parse(await readFile(usersFile, 'utf8')) as StoredUser[];
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await mkdir(join(process.cwd(), 'data'), { recursive: true });
  await writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function passwordMatches(password: string, storedHash: string): Promise<boolean> {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(derivedKey, Buffer.from(key, 'hex'));
}

function validCredentials(email: unknown, password: unknown): email is string {
  return typeof email === 'string'
    && typeof password === 'string'
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    && password.length >= 8;
}

/**
 * Authentication endpoints use a local persistent user store. Passwords are
 * stored only as salted scrypt hashes, never as plain text.
 */
app.use(express.json());

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email;
    const { password } = req.body;
    if (!validCredentials(email, password)) {
      res.status(400).json({ error: 'Enter a valid email and a password with at least 8 characters.' });
      return;
    }

    const users = await getUsers();
    if (users.some((user) => user.email === email)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    users.push({ email, passwordHash: await hashPassword(password), createdAt: new Date().toISOString() });
    await saveUsers(users);
    res.status(201).json({ message: 'Account created successfully.', user: { email } });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email;
    const { password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = (await getUsers()).find((storedUser) => storedUser.email === email);
    if (!user) {
      res.status(404).json({ error: 'Please sign up first to continue.' });
      return;
    }

    if (!(await passwordMatches(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid password. Please try again.' });
      return;
    }

    res.json({ message: 'Login successful.', user: { email: user.email }, token: 'local-session' });
  } catch (error) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
