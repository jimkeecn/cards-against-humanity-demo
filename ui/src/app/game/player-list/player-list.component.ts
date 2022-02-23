import { Component, Input, OnInit } from '@angular/core';
import { HttpService } from 'src/app/http.service';
import { GamePlayer, PlayerDTO } from 'src/app/model';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {

  @Input() max: number = 5;
  @Input() number: number = 1;
  @Input() players: GamePlayer[] = [];
  @Input() uniqueId: string = "";
  isActive: boolean = false;
  constructor(private http:HttpService, private sk:SocketService) { }

  ngOnInit(): void {

  }

  getPlayerList() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.http.getPlayerList(this.uniqueId).subscribe(x => { 
        if (x.length > 0) {
          this.players = x;
        }
      })
    }
  }

  getMe(id) {
    let me = this.sk.getUser();
    if (id == me.uniqueId) {
      return true;
    } else {
      return false;
    }
  }
}
