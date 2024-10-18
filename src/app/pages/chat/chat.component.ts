import { Component, Input, SimpleChanges, OnInit, OnDestroy, OnChanges, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/userModel';
import { ChangeDetectorRef } from '@angular/core';
import { UserServiceService } from 'src/app/services/user-service.service';
import { ChatService } from 'src/app/services/chat-service.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit, OnDestroy, OnChanges {


  @Input() trainerid!: string;

  messages: any[] = [];
  newMessage: string = '';
  senderId: string = '';
  receiverId: string = '';
  roomId: string = '';
  messageSubscription!: Subscription;
  private clientsubscription: Subscription | null = null;
  users!: User[];
  selectedUser!: User;
  unreadMessageCounts: Map<string, { count: number, isRead: boolean }> = new Map();
  unreadMessagesCount: number = 0;
  private typingTimeout: any;
  isTyping: boolean = false;

  constructor(
    private chatService: ChatService,
    private service: UserServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authservice: AuthenticationService
  ) {
    this.messages = [];
  }

  ngOnInit(): void {
    console.log('chat page init');
    this.senderId = this.getUserId();
    this.messages = [];
    this.loadClients();
  }

  
  loadClients(): void {
    this.service.getUsers().subscribe({
      next: (res) => {
        console.log('res is ', res);
  
        if (res && res.users) {
          this.users = res.users
            .map((client: any) => ({
              username: client.username,
              email: client.email,
              password: client.password,
              userid: client._id,
              createdAt: client.createdAt // Assuming this field exists
            }))
  
          if (this.users.length > 0) {
            // Join all rooms
            this.joinAllRooms();
          }
        } else {
          console.error('No users found in response');
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }
  

  joinAllRooms(): void {
    if (this.senderId) {
      this.users.forEach(users => {
        if (users.userid) {
          const roomId = this.generateRoomId(this.senderId!, users.userid);
          this.chatService.joinRoom(roomId);
          console.log('joined room for user and trainer:', roomId);
        } else {
          console.warn('users without id encountered:', users);
        }
      });

    } else {
      console.warn('senderId is not set');
    }
  }

  openGroup() {
    console.log('entered the group');
    this.router.navigate(['/groupchat']);

  }

  selectedUserFunction(userid: any) {
    // Clear the messages array to avoid showing previous user's messages
    this.messages = [];

    this.unreadMessagesCount = this.unreadMessageCounts.get(userid)?.count || 0;
    if (this.unreadMessageCounts.has(userid)) {
      this.unreadMessageCounts.set(userid, { count: 0, isRead: true });
    }
    this.receiverId = userid;
    const selecteduser = this.users.find((user) => user.userid === userid);
    if (selecteduser) {
      this.selectedUser = selecteduser;
    }

    // Set the current room ID
    this.roomId = this.generateRoomId(this.senderId!, this.receiverId);
    console.log('Current room ID:', this.roomId);

    this.subscribeToMessages();

    this.loadMessages();
  }

  private subscribeToMessages() {
    console.log('entered subscribeToMessages');
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  
    this.messageSubscription = this.chatService.receiveMessage().subscribe((message: any) => {
      console.log('received message is', message);
  
      // Show typing indicator
      this.isTyping = true;
      this.cdr.detectChanges(); // Update the view to show typing
  
      // Clear previous timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
  
      // Set timeout to remove typing indicator after a delay (e.g., 2 seconds)
      this.typingTimeout = setTimeout(() => {
        this.isTyping = false;
        this.cdr.detectChanges(); // Update the view to remove typing
  
        const formattedMessage = {
          message: message.message,
          receiverId: message.receiverId,
          senderId: message.senderId,
          timestamp: message.timestamp,
          isRead: message.isRead,
          _id: message._id,
          roomId: message.roomId
        };
  
        // Ensure the message is for the current room
        if (formattedMessage.roomId !== this.roomId) {
          // Increase unread count for the sender if the message is not for the current room
          const currentStatus = this.unreadMessageCounts.get(formattedMessage.senderId) || { count: 0, isRead: false };
          this.unreadMessageCounts.set(formattedMessage.senderId, { count: currentStatus.count + 1, isRead: false });
          return;
        }
  
        // Mark message as read if it is for the current room
        if (formattedMessage.senderId === this.receiverId) {
          formattedMessage.isRead = true;
        }
  
        // Add the message to the list
        this.messages.push(formattedMessage);
  
        this.cdr.detectChanges(); // Manually trigger change detection
      }, 2000);
    });
  }
  

  getUnreadCountForUser(userId: string): number {
    return this.unreadMessageCounts.get(userId)?.count || 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trainerid'] && !changes['trainerid'].firstChange) {
      this.receiverId = this.trainerid;
      this.selectedUserFunction(this.receiverId);
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '' && this.senderId) {
      this.chatService.sendMessage(this.senderId, this.receiverId, this.newMessage);
      const formattedMessage = {
        message: this.newMessage,
        receiverId: this.receiverId,
        senderId: this.senderId,
        timestamp: Date.now(),
        _id: '',
        roomId: this.roomId
      };

      this.newMessage = ''

      if (!Array.isArray(this.messages)) {
        this.messages = []; // Ensure messages is always an array
      }

      this.messages.push(formattedMessage);
      this.newMessage = '';
      this.cdr.detectChanges();
    }
  }

  loadMessages(): void {
    if (this.senderId && this.receiverId) {

      this.chatService.getMessagesUser(this.senderId, this.receiverId).subscribe((data: any) => {

        console.log('messsages fromthe backend is ', data);

        this.messages = data.messages || [];
        this.cdr.detectChanges();
      });
    } else {
      console.log('no sender or receiver id');
    }
  }



  private getUserId(): string {
    const userString = localStorage.getItem('user');

    if (userString) {
      try {
        const user = JSON.parse(userString);

        console.log('the user id is', user._id);

        return user._id;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return "null";
      }
    }
    return "null";
  }


  private generateRoomId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  logout(): void {
    this.authservice.userlogout();
  }


  ngOnDestroy(): void {
    if (this.roomId) {
      this.chatService.leaveRoom(this.roomId);
    }

    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    if (this.clientsubscription) {
      this.clientsubscription.unsubscribe();
    }
  }
}








