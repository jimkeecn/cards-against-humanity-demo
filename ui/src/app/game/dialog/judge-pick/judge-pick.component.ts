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

  pick: PickCompleteDTO;
  userName: string;
  constructor(
    public dialogRef: MatDialogRef<JudgePickComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PickCompleteDTO,
    private sk:SocketService
  ) {
    this.pick = data;
    if (this.pick) {
      let player = this.pick.picks.find(x => { 
        if (x.pickedCard.uniqueId == this.pick.answer.uniqueId) {
          return x;
        } else {
          return null;
        }
      })
      this.userName = player.userName;
    }
  }

  ngOnInit(): void {
    setTimeout(() => { 
      this.dialogRef.close(`裁判选择${this.pick.answer.content},恭喜${this.userName}累计分数+1`);
    },4000)
  }

}
