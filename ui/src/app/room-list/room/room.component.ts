import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  @Input() name:string = "";
  @Input() id:string = "";
  @Input() number: number = 0;
  constructor() { }

  ngOnInit(): void {
  }

  join():void {
    console.log(`join game ${this.id}`);
  }

}
