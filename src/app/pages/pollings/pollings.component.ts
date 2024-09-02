import { Component, Input, SimpleChanges, OnInit, OnDestroy, OnChanges, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/userModel';
import { ChangeDetectorRef } from '@angular/core';
import { UserServiceService } from 'src/app/services/user-service.service';
import { ChatService } from 'src/app/services/chat-service.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Poll, PollOption } from 'src/app/interfaces/Ichat';

@Component({
  selector: 'app-pollings',
  templateUrl: './pollings.component.html',
  styleUrls: ['./pollings.component.css']
})
export class PollingsComponent {



  @Input() trainerid!: string;

  polls: any[] = []
  newMessage: string = '';
  senderId: string = '';
  receiverId: string = '';
  roomId: string = '';
  messageSubscription!: Subscription;
  private clientsubscription: Subscription | null = null;
  users!: User[];
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
  }

  ngOnInit(): void {
    console.log('chat page init');
    this.signInUser = this.getSignInUser()
    this.senderId = this.getUserId();
    this.loadClients();
    this.subscribeToMessages();
    this.loadPolls()
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

    this.messageSubscription = this.chatService.receivePolls().subscribe((data: any) => {

      console.log('recienve poll is', data);

      this.polls.push(data);
      this.cdr.detectChanges();
    });
  }


  getSenderName(senderId: string): string {
    const user = this.users.find(u => u.userid === senderId);
    return user ? user.username : 'Unknown User';
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


  // polling details 

  togglePollForm() {
    this.showPollForm = !this.showPollForm;
  }

  addOption() {
    this.pollOptions.push({ option: '' });
  }

  removeOption(index: number) {
    this.pollOptions.splice(index, 1);
  }

  submitPoll() {
    const pollData = {
      roomId: this.roomId,
      senderId: this.senderId,
      question: this.pollQuestion,
      options: this.pollOptions,
    };

    // Emit the poll data to the server via the socket connection
    this.chatService.sendPolls(pollData);

    // Add the poll locally to the current list of polls
    this.polls.push(pollData);
    this.cdr.detectChanges();

    // Reset the form
    this.pollQuestion = '';
    this.pollOptions = [{ option: '' }];
    this.showPollForm = false;
  }



  loadPolls(): void {
    this.chatService.getGroupPolls(this.roomId).subscribe((data: any) => {
      this.polls = data.polls || [];
      console.log('polls are ', this.polls);
      this.cdr.detectChanges();
    });
  }



  onVote(pollId: string, option: string) {
    // Emit the vote to the server
    this.chatService.voteOnPoll(pollId, option, this.getUserId());

    // Update locally (optional, as server can broadcast the update)
    const poll = this.polls.find((p: Poll) => p.id === pollId);
    if (poll) {
      const selectedOption = poll.options.find((o: PollOption) => o.option === option);
      if (selectedOption) {
        selectedOption.votes++;
        selectedOption.voted = true; // Mark as voted
      }
      this.cdr.detectChanges();
    }
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
