import { Component, Input, OnInit } from '@angular/core';
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
  isActive: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
