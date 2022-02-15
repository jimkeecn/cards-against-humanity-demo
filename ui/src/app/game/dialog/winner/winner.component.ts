import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GamePlayer } from 'src/app/model';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-winner',
  templateUrl: './winner.component.html',
  styleUrls: ['./winner.component.scss']
})
export class WinnerComponent implements OnInit {
  userName: string;
  constructor( public dialogRef: MatDialogRef<WinnerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GamePlayer,
    private sk: SocketService) { 
    this.userName = data.userName;
    }

  ngOnInit(): void {
  }

}
