import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  sys_messages :any[] = [];
  constructor(public route:Router, private sk:SocketService) { }

  ngOnInit(): void {
    this.sk.$joinRoom.subscribe(x => { 
      let date = new Date();
      let hour = date.getHours();
      let min = date.getMinutes();
      let message = [`${x.userName} 加入了游戏`, `${hour}:${min}`];
      this.sys_messages.push(message);
    })
  }

  return(): void{
    this.route.navigate(['roomlist']);
  }

}
