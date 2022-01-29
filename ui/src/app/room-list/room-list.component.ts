import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {

  roomList: any = [];
  refreshing: boolean = false;
  constructor(public route:Router) { }

  ngOnInit(): void {
  }

  refresh(): void{
    this.refreshing = true;
    setTimeout(() => { 
      this.refreshing = false;
    },3000)
  }

  createNewRoom(): void{
    this.route.navigate(['new']);
  }

}
