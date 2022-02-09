import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { RoomDTO } from '../model';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  sys_messages: any[] = [];
  room_id: string = "";
  is_owner: boolean = false;
  room: RoomDTO;
  constructor(public route:Router, private sk:SocketService, private activeRoute : ActivatedRoute) { }

  ngOnInit(): void {
    
    this.activeRoute.params.subscribe(x => { 
      this.room_id = x['id'];
      this.sk.getRoomDetail$(this.room_id);
    })

    this.sk.$joinRoom().subscribe(x => { 
      let message = [`${x.userName} 加入了游戏`, `${this.getImmediateDate()}`];
      this.sys_messages.push(message);
    })

    this.sk.$getRoomDetail().subscribe(x => { 
      console.log('$getRoomDetail |' + JSON.stringify(x));
      this.room = x;
      let current_user = this.sk.getLocalUser();
      if (current_user.uniqueId == this.room.owner.uniqueId) {
        this.is_owner = true;
      } else {
        this.is_owner = false;
      }
    })

    this.sk.$ownerDisconnected().pipe(take(1)).subscribe(x => { 
      console.log('ownerDisconnected' + x);
      if (x == this.room_id) {
        this.route.navigate(['roomlist']);
      }
    })

    this.sk.$pickJudge().subscribe(x => { 
      let message = [`裁判指定为：${x.userName}`, `${this.getImmediateDate()}`];
      this.sys_messages.push(message);
    })


    this.sk.$currentQuestion().subscribe(x => { 
      let message = [`当前问题： ${x.content}`, `${this.getImmediateDate()}`];
      this.sys_messages.push(message);
    })

    this.sk.$startRound().pipe(take(1)).subscribe(x => { 
      if (x) {
        let message = [`比赛开始了`,`${this.getImmediateDate()}`];
        this.sys_messages.push(message);
        this.sk.initCards$();
      }
    })

    this.sk.$initCards().subscribe(x => { 
      console.dir(x);
    })
  }

  return(): void{
    this.sk.leaveRoom$(this.room_id);
    this.route.navigate(['roomlist']);
  }

  start(): void{
    if (this.is_owner) {
      this.sk.startGame$(this.room_id)
    } else {
      alert('you do not have permission to do that.');
    }
    
  }

  private getImmediateDate() {
    let date = new Date();
    let hour = date.getHours();
    let min = date.getMinutes();
    return  `${hour}:${min}`;
  }
}
