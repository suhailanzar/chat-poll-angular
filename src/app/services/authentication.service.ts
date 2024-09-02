import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {


  private Authenticateduser = false;


  constructor(private router: Router) {}

  userlogout(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    this.Authenticateduser = false;
    this.router.navigate(['/login']); 
  }


  isAuthenticatedUser(): boolean {
    const userToken = localStorage.getItem('userToken');
    return userToken !== null && userToken.trim() !== '';
  }
}

