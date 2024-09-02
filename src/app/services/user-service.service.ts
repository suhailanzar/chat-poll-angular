import { Injectable } from '@angular/core';
import { User } from '../models/userModel';
import { Observable } from 'rxjs';
import { getUsers, userLogin } from '../interfaces/Iuser';
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  BASE_URL:string = 'https://chat-poll-socketio-backend.onrender.com'


  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

constructor(
    private http: HttpClient,
) { }

  userLogin(data: User): Observable<userLogin> {
    console.log('data in logunis',data);
    
    return this.http.post<userLogin>(`${this.BASE_URL}login`, data)
  }

userSignup(data: User): Observable<userLogin> {
  return this.http.post<userLogin>(`${this.BASE_URL}signup`, data)
}

getUsers(): Observable<getUsers> {
  return this.http.get<getUsers>(`${this.BASE_URL}getUsers`)
}


}
