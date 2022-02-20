import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../http.service';
import { RoomDTO } from '../model';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {

  roomList: RoomDTO[] = [];
  refreshing: boolean = false;
  constructor(public route: Router, private sk: SocketService, private http: HttpService) { 
    this.refresh();
    sk.$roomList().subscribe(x => { 
      console.log('roomList', x);
      this.roomList = [...x];
    })
  }

  ngOnInit(): void {
  }

  refresh(): void{
    this.refreshing = true;
    this.sk.refreshRoom$();
    setTimeout(() => { 
      this.refreshing = false;
    },3000)
  }

  createNewRoom(): void{
    this.route.navigate(['new']);
  }

  removeUser(): void{
    let user = this.sk.getUser();
    this.http.removeUser(user).subscribe(x => { 
      if (x) {
        this.route.navigate(['login']);
      }
    })
  }

}
