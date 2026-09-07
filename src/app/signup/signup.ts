import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected showPassword = false;
  protected error = signal('');

  constructor(private readonly router: Router, private readonly auth: Auth) {}

  protected createAccount(): void {
    const email = this.email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      this.error.set('Enter a valid email address.');
      return;
    }
    if (this.password.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.error.set('');
    this.auth.signup(email, this.password, this.confirmPassword).subscribe({
      next: () => this.router.navigate(['/login'], { state: { email } }),
      error: (error) => this.error.set(error.error?.error || 'Unable to create your account. Please try again.'),
    });
  }
}
