import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({ selector: 'app-home', imports: [RouterLink], templateUrl: './home.html', styleUrl: './home.css' })
export class HomeComponent {
  private readonly router = inject(Router);
  protected readonly email = (this.router.getCurrentNavigation()?.extras.state?.['email'] as string | undefined) ?? 'there';
  protected logout(): void { this.router.navigate(['/login']); }
}
