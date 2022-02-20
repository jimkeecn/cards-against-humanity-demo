import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take } from 'rxjs';
import { Card, PickCompleteDTO, PlayerDTO, RoomDTO } from '../model';
import { SocketService } from '../socket.service';
import { JudgePickComponent } from './dialog/judge-pick/judge-pick.component';
import { PlayerPickComponent } from './dialog/player-pick/player-pick.component';
import { WinnerComponent } from './dialog/winner/winner.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  sys_messages: any[] = [];
  $sys_messages : Subject<any[]> = new Subject();
  room_id: string = "";
  is_owner: boolean = false;
  is_start: boolean = false;
  room: RoomDTO;
  current_judge: string = null;
  is_judge: boolean = false;
  is_judging: boolean = false;
  current_question: string = null;
  player_deck: Card[] = [];
  pick_deck: Card[] = [];
  roundNumber : number = 0;
  constructor(public route:Router, private sk:SocketService, private activeRoute : ActivatedRoute,public dialog: MatDialog) { }

  ngOnInit(): void {
    
    this.activeRoute.params.subscribe(x => { 
      this.room_id = x['id'];
      this.sk.getRoomDetail$(this.room_id);
    })

    this.sk.$joinRoom().subscribe(x => { 
      let message = [`${x.userName} 加入了游戏`, `${this.getImmediateDate()}`];
      this.sys_messages.push(message);
      this.$sys_messages.next(message);
      this.sk.getRoomDetail$(this.room_id);
    })

    this.sk.$someoneleaveRoom().subscribe(x => { 
      let message = [`${x.userName} 退出了游戏`, `${this.getImmediateDate()}`];
      this.sys_messages.push(message);
      this.$sys_messages.next(message);
      this.sk.getRoomDetail$(this.room_id);
    })

    this.sk.$getRoomDetail().subscribe(x => { 
      console.log('$getRoomDetail |' + JSON.stringify(x));
      this.room = x;
      this.is_start = this.room?.isStart;
      let current_user = this.sk.getLocalUser();
      if (current_user.uniqueId == this.room.owner.uniqueId) {
        this.is_owner = true;
      } else {
        this.is_owner = false;
      }

      if (this.is_start) {
        this.sk.getGameProgress$(this.room.uniqueId);
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
      this.current_judge = x.userName;
      if (x.uniqueId == this.sk.getUser().uniqueId) {
        this.is_judge = true;
      }
    })


    this.sk.$currentQuestion().subscribe(x => { 
      let message = [`当前问题： ${x.content.replace('${}','______')}`, `${this.getImmediateDate()}`];
      this.sys_messages.push(message);
      this.current_question = x.content;
    })

    this.sk.$startRound().subscribe(x => { 
      if (x) {
        this.roundNumber = this.roundNumber + 1;
        let message = [`第${this.roundNumber}局开始了..玩家获取新卡片`,`${this.getImmediateDate()}`];
        this.sys_messages.push(message);
        this.sk.initCards$();
        this.is_start = true;
      }
    })

    this.sk.$initCards().subscribe(x => { 
     
      console.dir(x);
      this.player_deck = x;
    })

    this.sk.$cardPickedByYou().subscribe(x => { 
      this.player_deck.forEach(c => { 
        if (c.uniqueId == x.uniqueId) {
          c.isPicked = true;
        }
      })

      const dialog = this.dialog.open(PlayerPickComponent, {
        data: x,
      });

      dialog.afterClosed().subscribe(msg=> { 
        let message = [msg,`${this.getImmediateDate()}`];
        this.sys_messages.push(message);
      })
    })
    
    this.sk.$cardsForRound().subscribe(x => { 
      console.log(x);
      this.pick_deck = x;
      this.is_judging = true;
    })

    this.sk.$pickComplete().subscribe((x:PickCompleteDTO) => { 
      this.is_judging = false;
      this.is_judge = false;
      this.pick_deck = [];
      console.dir(x);
      const dialog = this.dialog.open(JudgePickComponent, {
        data: x,
      });

      dialog.afterClosed().subscribe(msg => { 
        let message = [];
        if (this.current_question.includes('${}')) {
           message = [`最终答案为：${this.current_question.replace('${}',msg[0])}<br>恭喜${msg[1]}获得一分`,`${this.getImmediateDate()}`];
        } else {
           message = [`最终答案为：${this.current_question},${msg[0]}<br>恭喜${msg[1]}获得一分`,`${this.getImmediateDate()}`];
        }
        
        this.sys_messages.push(message);
      })
    })

    this.sk.$gameOver().pipe(take(1)).subscribe(x => { 
      const dialog = this.dialog.open(WinnerComponent, {
        data: x,
      });

      dialog.afterClosed().subscribe(msg => { 
        let message = [`游戏结束，恭喜${x.userName}成为本场最反人类的玩家!`,`${this.getImmediateDate()}`];
        this.sys_messages.push(message);
      })
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
      alert('你不是房间拥有者。');
    }
    
  }

  private getImmediateDate() {
    let date = new Date();
    let hour = date.getHours();
    let min = date.getMinutes();
    return  `${hour}:${min}`;
  }

  getJudge() {
    let current_round = this.room.rounds[this.room.rounds.length - 1];
    this.current_judge = current_round.judge.userName;
  }

  selectACardByPlayer($event) {
    this.sk.selectACardByPlayer$($event);
  }

  selectACardByJudge($event) {
    if (this.is_judge) {
      this.sk.selectACardByJudge$($event);
    } else {
      alert('你不是裁判.');
    }
    
  }

 
}
