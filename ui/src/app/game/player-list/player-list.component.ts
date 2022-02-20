import { Component, Input, OnInit } from '@angular/core';
import { HttpService } from 'src/app/http.service';
import { GamePlayer, PlayerDTO } from 'src/app/model';

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
  constructor(private http:HttpService) { }

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
}
