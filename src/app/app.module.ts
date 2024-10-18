import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { jwtHttpInterceptor } from './interceptor/jwtdecode.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ReactiveFormsModule } from '@angular/forms';
import {  HttpClientModule } from '@angular/common/http';
import { ExcludeCurrentUserPipe } from './pipes/exclude-current-user.pipe';
import { GroupChatComponent } from './pages/group-chat/group-chat.component';
import { PollingsComponent } from './pages/pollings/pollings.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ChatComponent,
    ExcludeCurrentUserPipe,
    GroupChatComponent,
    PollingsComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule 
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: jwtHttpInterceptor,
      multi: true // Allows multiple interceptors
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
