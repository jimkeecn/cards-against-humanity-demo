import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {

  roomList: any = [];
  refreshing: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  refresh(): void{
    this.refreshing = true;
    setTimeout(() => { 
      this.refreshing = false;
    },3000)
  }

  createNewRoom(): void{
    
  }

}
