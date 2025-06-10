import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoginCredentials } from '../models/LoginCredentials';
import { KeycloakTokenResponse } from '../models/KeycloakTokenResponse';

@Injectable({
  providedIn: 'root',
})
export class KeycloakAuthService {
  private readonly KEYCLOAK_URL = 'http://localhost:8181/realms/spring-boot/protocol/openid-connect/token';
  private readonly CLIENT_ID = 'spring-app';
  private readonly TOKEN_KEY = 'keycloak_access_token';
  private readonly REFRESH_TOKEN_KEY = 'keycloak_refresh_token';

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<KeycloakTokenResponse> {
    const body = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('grant_type', 'password')
      .set('username', credentials.username)
      .set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http
      .post<KeycloakTokenResponse>(this.KEYCLOAK_URL, body.toString(), { headers })
      .pipe(
        map((tokenData) => {
          localStorage.setItem(this.TOKEN_KEY, tokenData.access_token);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);
          return tokenData;
        }),
        catchError((error) => {
          const errorMsg = error?.error?.error_description || 'Authentication failed';
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  refreshToken(): Observable<KeycloakTokenResponse | null> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) return throwError(() => new Error('No refresh token found'));

    const body = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http
      .post<KeycloakTokenResponse>(this.KEYCLOAK_URL, body.toString(), { headers })
      .pipe(
        map((tokenData) => {
          localStorage.setItem(this.TOKEN_KEY, tokenData.access_token);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);
          return tokenData;
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => new Error('Token refresh failed'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
}