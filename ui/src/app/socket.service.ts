import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket, SocketIoConfig } from 'ngx-socket-io';  
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Card, Player, PlayerDTO, Question, RoomDTO, RoomInput } from './model';
import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  user: Player
  user_string = localStorage.getItem('user');
  socket = io(environment.url, { forceNew: true, query: { user : this.user_string}})

  constructor( private route: Router) { 
    this.socket.on('disconnect', () => { 
      // let confirm = window.confirm("you have been disconnected from the server, Please refresh");
      // if (confirm) {
      //   this.connect();
      // }

      this.connect();
    })

    this.socket.on('$200', () => { 
      let href = this.route.url;
      if (href.includes('login')) {
        this.route.navigate(['roomlist'])
      } 
    })

    this.socket.on('$404', () => { 
      localStorage.removeItem('user');
      this.route.navigate(['login'])
    })

    this.socket.on('$goToRoomList', () => { 
      this.route.navigate(['roomlist'])
    })
  }



  getLocalUser(): Player{
    let user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    } else {
      return null;
    }
  }

  connect() :void {
    let user_string = localStorage.getItem('user');
    console.log(user_string);
    this.socket = io(environment.url, { forceNew: true, query: { user : user_string}})
  }

  /**emit */

  checkMyExist$():void {
    this.socket.emit('checkMyExist$');
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

  getRoomDetail$(roomId: string): void{
    this.socket.emit('getRoomDetail$',roomId)
  }

  startGame$(roomId): void{
    this.socket.emit('startGame$',roomId);
  }

  selectACard$(cardId:string): void{
    this.socket.emit('selectACard$',cardId)
  }

  pickACard$(cardId: string): void{
    this.socket.emit('pickACard$',cardId)
  }

  initCards$(): void{
    this.socket.emit('initCards$');
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

  //$getRoomDetail
  $getRoomDetail(): Observable<RoomDTO>{
    return new Observable<RoomDTO>(observer => {
      this.socket.on('$getRoomDetail', (data: RoomDTO) => observer.next(data));
    })
  }

  $pickJudge(): Observable<PlayerDTO>{
    return new Observable<PlayerDTO>(observer => {
      this.socket.on('$pickJudge', (data: PlayerDTO) => observer.next(data));
    })
  }

  $initCards(): Observable<Card[]>{
    return new Observable<Card[]>(observer => {
      this.socket.on('$initCards', (data: Card[]) => observer.next(data));
    })
  }

  $currentQuestion(): Observable<Question>{
    return new Observable<Question>(observer => {
      this.socket.on('$currentQuestion', (data: Question) => observer.next(data));
    })
  }

  $startRound(): Observable<any>{
    return new Observable<any>(observer => {
      this.socket.on('$startRound', (data: any) => observer.next(data));
    })
  }

  $errors(): Observable<any>{
    return new Observable<any>(observer => {
      this.socket.on('$errors', (data: any) => observer.next(data));
    })
  }

}
