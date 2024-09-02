import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ChatComponent } from './pages/chat/chat.component';
import { AuthenticateUserGuard } from './guards/authenticate-user.guard'
import { GroupChatComponent } from './pages/group-chat/group-chat.component';
import { PollingsComponent } from './pages/pollings/pollings.component';


const routes: Routes = [
  {path:"",component:LoginComponent},
  {path:"login",component:LoginComponent},
  {path:"signup",component:SignupComponent},
  {path:"chat",component:ChatComponent,canActivate: [AuthenticateUserGuard]},
  {path:"groupchat",component:GroupChatComponent,canActivate: [AuthenticateUserGuard]},
  {path:"pollings",component:PollingsComponent,canActivate: [AuthenticateUserGuard]}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

  

 }
