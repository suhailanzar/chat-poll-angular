import { Component, Input, SimpleChanges, OnInit, OnDestroy, OnChanges, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/userModel';
import { ChangeDetectorRef } from '@angular/core';
import { UserServiceService } from 'src/app/services/user-service.service';
import { ChatService } from 'src/app/services/chat-service.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.css']
})


export class GroupChatComponent implements OnInit, OnDestroy {



  messages: any[] = [];
  newMessage: string = '';
  senderId: string = '';
  receiverId: string = '';
  roomId: string = '';
  messageSubscription!: Subscription;
  private clientsubscription: Subscription | null = null;
  users!: User[];
  unreadMessageCounts: Map<string, { count: number, isRead: boolean }> = new Map();
  unreadMessagesCount: number = 0;
  signInUser!: User;
  showPollForm: boolean = false;
  pollQuestion: string = '';
  pollOptions: Array<{ option: string }> = [{ option: '' }];


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
    this.signInUser = this.getSignInUser()
    this.senderId = this.getUserId();
    this.messages = [];
    this.loadClients();
    this.subscribeToMessages();
    this.loadMessages()
  }


  getSignInUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }


  loadClients(): void {

    this.service.getUsers().subscribe({

      next: (res) => {
        console.log('res is ', res);

        if (res && res.users) {
          this.users = res.users.map((client: any) => ({
            username: client.username,
            email: client.email,
            password: client.password,
            userid: client._id,
          }));

          if (this.users.length > 0) {
            // Join all rooms
            this.joinRoomGroup();


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


  joinRoomGroup(): void {
    if (this.senderId) {
      const roomId = "communitygroup123"; // Fixed room ID for the common group
      this.roomId = roomId
      this.chatService.joinRoom(roomId);
      console.log('Joined common group room:', roomId);
    } else {
      console.warn('senderId is not set');
    }
  }





  subscribeToMessages() {
    console.log('entered subscribeToMessages');
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.messageSubscription = this.chatService.receiveMessageGroup().subscribe((message: any) => {

      const formattedMessage = {
        groupId: message.groupId,
        senderId: message.senderId,
        message: message.message,
        polls: message.polls ? {
          question: message.polls.question,
          options: message.polls.options.map((option: any) => ({ option: option.option, votes: option.votes })),
        } : undefined,
        timestamp: message.timestamp,
        isRead: message.isRead,
        _id: message._id,
      };



      this.messages.push(formattedMessage);
      this.cdr.detectChanges(); // Manually trigger change detection
    });
  }

  getUnreadCountForUser(userId: string): number {
    return this.unreadMessageCounts.get(userId)?.count || 0;
  }

 

  sendMessage(): void {
    if (this.newMessage.trim() !== '' && this.senderId) {
      this.chatService.sendMessagetoGroup(this.senderId, this.newMessage);
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


  getSenderName(senderId: string): string {
    const user = this.users.find(u => u.userid === senderId);
    return user ? user.username : 'Unknown User';
  }


  loadMessages(): void {

    this.chatService.getGroupMessagesUser(this.roomId).subscribe((data: any) => {

      this.messages = data.messages || [];
      this.cdr.detectChanges();
    });
  }




  private getUserId(): string {
    const userString = localStorage.getItem('user');

    if (userString) {
      try {
        const user = JSON.parse(userString);
        return user._id;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return "null";
      }
    }
    return "null";
  }



  submitPoll() {
    this.router.navigate(['/pollings']);
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

