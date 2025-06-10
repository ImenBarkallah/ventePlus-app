import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakAuthService } from '../services/keycloak-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: KeycloakAuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getAccessToken();
    if (token) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
