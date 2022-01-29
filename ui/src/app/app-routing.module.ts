import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NewRoomComponent } from './new-room/new-room.component';
import { RoomListComponent } from './room-list/room-list.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'roomlist', component: RoomListComponent },
  { path: 'new', component: NewRoomComponent },
  { path: '', redirectTo:'/login' , pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
