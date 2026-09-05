import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({ selector: 'app-login', imports: [FormsModule, RouterLink], templateUrl: './login.html', styleUrl: './login.css' })
export class LoginComponent {
  protected email = '';
  protected password = '';
  protected showPassword = false;
  protected error = signal('');
  protected emailError = signal('');

  // constructor(private readonly router: Router) {}
  constructor(private readonly router: Router, private readonly auth: Auth) {}

  protected signIn(): void {
    const normalizedEmail = this.email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      this.emailError.set('Email address is required.');
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      this.emailError.set('Enter a valid email, for example admin12@gmail.com.');
      return;
    }

    if (!this.password.trim()) {
      this.emailError.set('');
      this.error.set('Please enter your password.');
      return;
    }

    this.emailError.set('');
    this.error.set('');
    // this.router.navigate(['/home'], { state: { email: normalizedEmail } });
    this.auth.login(normalizedEmail, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);

        this.router.navigate(['/home'], {
          state: { email: response.user.email }
        });
      },

      error: (error) => {
        console.log('Login failed:', error);

        this.error.set(
          error.error?.error || 'Invalid email or password.'
        );
      }
    });
  }
}
