import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from 'src/app/socket.service';
import { RulesComponent } from '../dialog/rules/rules.component';

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
  constructor(private sk : SocketService,public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  start(): void{
    if (this.isOwner) {
      this.sk.startGame$(this.roomId)
    } else {
      alert('你没有权限。');
    }
  }

  openRule(): void{
    const dialog = this.dialog.open(RulesComponent);

    dialog.afterClosed().subscribe(msg=> { 
    })
  }
}
