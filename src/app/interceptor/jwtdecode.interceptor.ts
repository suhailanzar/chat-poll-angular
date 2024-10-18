
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';

@Injectable()
export class jwtHttpInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService, private router: Router) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const userToken = localStorage.getItem('userToken') || undefined;

    console.log('user tokern in interceptor' , userToken);
    
 
    let authReq = this.addTokens(req, userToken);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Interceptor caught an error:', error);
        if (error.status === 401) {
          console.log('401 Unauthorized error detected');
          this.handleUnauthorizedError();
        }
        return throwError(error);
      })
    );
  }

  private addTokens(req: HttpRequest<any>, userToken?: string): HttpRequest<any> {
    let authReq = req;
    if (userToken) {
      authReq = authReq.clone({
        headers: authReq.headers.set('authorization-user', `Bearer ${userToken}`)
      });
    }

    return authReq;
  }

  private handleUnauthorizedError(): void {
    // Clear all tokens
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');

    // Redirect to login page
    this.router.navigate(['/']);


    console.log('Your session has expired. Please log in again.');
  }
}



