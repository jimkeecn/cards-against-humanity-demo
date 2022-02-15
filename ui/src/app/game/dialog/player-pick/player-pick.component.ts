import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Card, PickCompleteDTO } from 'src/app/model';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-player-pick',
  templateUrl: './player-pick.component.html',
  styleUrls: ['./player-pick.component.scss']
})
export class PlayerPickComponent implements OnInit {

  pick: Card;
  content: string;
  constructor(
    public dialogRef: MatDialogRef<PlayerPickComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Card,
    private sk:SocketService
  ) {
    this.pick = data;
    this.content = data.content;
  }

  ngOnInit(): void {
    setTimeout(() => { 
      this.dialogRef.close(`您选择了 ${this.pick.content} 作为答案`);
    },2000)
  }

}
