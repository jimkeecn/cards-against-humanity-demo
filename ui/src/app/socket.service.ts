import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket, SocketIoConfig } from 'ngx-socket-io';  
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Player, PlayerDTO, RoomDTO, RoomInput } from './model';
import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  user: Player
  user_string = localStorage.getItem('user');
  socket = io(environment.url, { forceNew: true, query: { user : this.user_string}})

  constructor( private route: Router) { 
    
  }




  connect() :void {
    let user_string = localStorage.getItem('user');
    this.socket = io(environment.url, { forceNew: true, query: { user : user_string}})
  }

  /**emit */

  checkMyExist$():void {
    if (this.user) {
      this.socket.emit('checkMyExist$');
    }
  }

  createNewRoom$(room: RoomInput) :void{
    this.socket.emit('createNewRoom$',room)
  }

  refreshRoom$():void {
    this.socket.emit('refreshRoom$');
  }

  joinRoom$(roomId:string):void {
    this.socket.emit('joinRoom$',roomId)
  }

  leaveRoom$(roomId: string):void {
    this.socket.emit('leaveRoom$',roomId)
  }


  /**on */
  // $200 = this.socket.fromEvent<any>('$200');
  $200(): Observable<any>{
    return new Observable<any>(observer => {
      this.socket.on('$200', (data: any) => observer.next(data));
    })
  }
  // $404 = this.socket.fromEvent<any>('$404');
  $404(): Observable<any>{
    return new Observable<any>(observer => {
      this.socket.on('$404', (data: any) => observer.next(data));
    })
  }
  // $roomList = this.socket.fromEvent<RoomDTO[]>('$roomList');
  $roomList(): Observable<RoomDTO[]>{
    return new Observable<RoomDTO[]>(observer => {
      this.socket.on('$roomList', (data: RoomDTO[]) => observer.next(data));
    })
  }
  // $joinRoom = this.socket.fromEvent<PlayerDTO>('$joinRoom');
  $joinRoom(): Observable<PlayerDTO>{
    return new Observable<PlayerDTO>(observer => {
      this.socket.on('$joinRoom', (data: PlayerDTO) => observer.next(data));
    })
  }
  // $leaveRoom = this.socket.fromEvent<PlayerDTO>('$leaveRoom');
  $leaveRoom(): Observable<PlayerDTO>{
    return new Observable<PlayerDTO>(observer => {
      this.socket.on('$leaveRoom', (data: PlayerDTO) => observer.next(data));
    })
  }
  // $ownerDisconnected = this.socket.fromEvent<string>('$ownerDisconnected');
  $ownerDisconnected(): Observable<string>{
    return new Observable<string>(observer => {
      this.socket.on('$ownerDisconnected', (data: string) => observer.next(data));
    })
  }
  // $getRoomId = this.socket.fromEvent<string>("$getRoomId");
  $getRoomId(): Observable<string>{
    return new Observable<string>(observer => {
      this.socket.on('$getRoomId', (data: string) => observer.next(data));
    })
  }
  // $forceOut = this.socket.fromEvent<any>("$forceOut");
  $forceOut(): Observable<any>{
    return new Observable<any>(observer => {
      this.socket.on('$forceOut', (data: any) => observer.next(data));
    })
  }


}
