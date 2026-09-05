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

@Injectable({
  providedIn: 'root'
})
export class Auth {

  // private apiUrl = 'http://localhost:3000/api/auth';
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        email: email,
        password: password
      }
    );
  }
}