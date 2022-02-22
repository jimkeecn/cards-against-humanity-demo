import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PickCompleteDTO, PlayerDTO } from 'src/app/model';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-judge-pick',
  templateUrl: './judge-pick.component.html',
  styleUrls: ['./judge-pick.component.scss']
})
export class JudgePickComponent implements OnInit {

  pick: string;
  userName: string;
  constructor(
    public dialogRef: MatDialogRef<JudgePickComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sk:SocketService
  ) {
    this.pick = data?.pick;
    this.userName = data?.userName;
  }

  ngOnInit(): void {
    setTimeout(() => { 
      this.dialogRef.close();
    },4000)
  }

}
