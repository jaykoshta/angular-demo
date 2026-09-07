import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  message: string;
  user: {
    email: string;
  };
  token: string;
}

interface SignupResponse {
  message: string;
  user: {
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(
    email: string,
    password: string
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    );
  }

  signup(
    email: string,
    password: string,
    confirmPassword: string
  ): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(
      `${this.apiUrl}/signup`,
      {
        email,
        password,
        confirmPassword
      }
    );
  }
}