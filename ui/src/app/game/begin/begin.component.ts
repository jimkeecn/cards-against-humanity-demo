import { Component, Input, OnInit } from '@angular/core';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'begin',
  templateUrl: './begin.component.html',
  styleUrls: ['./begin.component.scss']
})
export class BeginComponent implements OnInit {

  @Input() isOwner: boolean = false;
  @Input() roomId: string;
  @Input() max: number = 5;
  @Input() number: number = 1;
  constructor(private sk : SocketService) { }

  ngOnInit(): void {
  }

  start(): void{
    if (this.isOwner) {
      this.sk.startGame$(this.roomId)
    } else {
      alert('你没有权限。');
    }
  }
}
