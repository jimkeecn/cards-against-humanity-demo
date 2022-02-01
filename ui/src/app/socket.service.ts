import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';  
import { map } from 'rxjs';
import { Player, PlayerDTO, RoomDTO, RoomInput } from './model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  user:Player
  constructor(private socket: Socket, private route: Router) { 
    let user_string = localStorage.getItem('user');
    this.user = JSON.parse(user_string);
  }

  $200 = this.socket.fromEvent<any>('$200');
  $404 = this.socket.fromEvent<any>('$404');
  $createUserName = this.socket.fromEvent<Player>('$createUserName');
  $roomList = this.socket.fromEvent<RoomDTO[]>('$roomList');
  $joinRoom = this.socket.fromEvent<PlayerDTO>('$joinRoom');
  checkMyExist$() {
    if (this.user) {
      this.socket.emit('checkMyExist$', this.user.uniqueId);
    }
    
  }
  createUserName$(userName:string) {
    this.socket.emit('createUserName$',userName)
  }

  createNewRoom$(room: RoomInput) {
    this.socket.emit('createNewRoom$',room)
  }

  refreshRoom$() {
    this.socket.emit('refreshRoom$');
  }

  joinRoom$(roomId:string) {
    this.socket.emit('joinRoom$',roomId)
  }
}
