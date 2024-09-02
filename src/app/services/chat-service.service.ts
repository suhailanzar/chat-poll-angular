import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs'; 
import { IPollData } from '../interfaces/Ichat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private _socket: Socket;
  private _baseUrl ='https://chat-poll-socketio-backend.onrender.com'

  constructor(private http: HttpClient) { 
    this._socket = io(this._baseUrl, {});

    this._socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
    });

    this._socket.on('connect', () => {
      console.log('Successfully connected to socket server');
    });
  }

  activateSocket() {
    return this.http.get(`${this._baseUrl}activate`);
  }

  joinRoom(roomId: string) {
    this._socket.emit('joinRoom', roomId);
  }
  
  leaveRoom(roomId: string) {
    this._socket.emit('leaveRoom', roomId);
  }

  sendMessage(senderId: string, receiverId: string, message: string) {
    console.log('sendMessage user is ',senderId,receiverId,message);
    
    this._socket.emit('sendMessage', { senderId, receiverId, message });
  }

  sendMessagetoGroup(senderId: string,  message: string) {
    console.log('sendMessage user is ',senderId,message);
    
    this._socket.emit('sendMessagetoGroup', { senderId, message });
  }

 

  receiveMessage(): Observable<any> {
    return new Observable(observer => {
      this._socket.on('receiveMessage', (data) => {
        observer.next(data);
      });
    });
  }

  receiveMessageGroup(): Observable<any> {
    return new Observable(observer => {
      this._socket.on('receiveMessageGroup', (data) => {        
        observer.next(data);
      });
    });
  }

  

  markMessagesAsRead(senderId: string | null, receiverId: string): Observable<any> {    
    const data = {userid:senderId,trainerid:receiverId}
    return this.http.post(`${this._baseUrl}markMessagesAsRead`, data)
  }
  
// get group messages

  getMessagesUser(senderid:string,receiverid:string): Observable<any> {        
    const data = {userid:senderid,trainerid:receiverid}
    return this.http.post(`${this._baseUrl}getMessagesUser`, data)
  }

  getGroupMessagesUser(roomId:string): Observable<any> {        
    const data = {roomid:roomId}
    return this.http.post(`${this._baseUrl}getGroupMessagesUser`, data)
  }

  // polling details

  
  sendPolls(PollData:IPollData){    
    this._socket.emit('addpollsUser', PollData);
  }

  voteOnPoll(pollId:string, option:string, userId:string){    
    this._socket.emit('voteOnPoll', {pollId,option,userId});
  }


  getGroupPolls(roomId:string){    
    return this.http.post(`${this._baseUrl}getGroupPolls`, roomId)
    
  }

  receivePolls(): Observable<any> {
    return new Observable(observer => {
      this._socket.on('receivePolls', (data) => {        
        observer.next(data);
      });
    });
  }

  

}