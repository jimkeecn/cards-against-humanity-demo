import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  @Input() name:string = "";
  @Input() id:string = "";
  @Input() number: number = 0;
  @Input() total: number = 5;
  constructor(public route:Router,sk:SocketService) { }

  ngOnInit(): void {
  }

  join(): void {
    
    console.log(`join game ${this.id}`);
    this.route.navigate(['game']);
  }

}
