import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  sys_messages: any[] = [];
  room_id: string = "";
  constructor(public route:Router, private sk:SocketService, private activeRoute : ActivatedRoute) { }

  ngOnInit(): void {
    
    this.activeRoute.params.subscribe(x => { 
      this.room_id = x['id'];
    })
    this.sk.$joinRoom().subscribe(x => { 
      let date = new Date();
      let hour = date.getHours();
      let min = date.getMinutes();
      let message = [`${x.userName} 加入了游戏`, `${hour}:${min}`];
      this.sys_messages.push(message);
    })

    this.sk.$ownerDisconnected().pipe(take(1)).subscribe(x => { 
      console.log('ownerDisconnected' + x);
      if (x == this.room_id) {
        this.route.navigate(['roomlist']);
      }
    })
  }

  return(): void{
    this.sk.leaveRoom$(this.room_id);
    this.route.navigate(['roomlist']);
  }

}
