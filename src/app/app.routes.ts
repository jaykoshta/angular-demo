import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { SignupComponent } from './signup/signup';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Sign in' },
  { path: 'signup', component: SignupComponent, title: 'Create an account' },
  { path: 'home', component: HomeComponent, title: 'Home' },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
