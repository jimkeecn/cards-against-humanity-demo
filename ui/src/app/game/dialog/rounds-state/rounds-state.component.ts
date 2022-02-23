import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { HttpService } from 'src/app/http.service';
import { Round } from 'src/app/model';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-rounds-state',
  templateUrl: './rounds-state.component.html',
  styleUrls: ['./rounds-state.component.scss']
})
export class RoundsStateComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RoundsStateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sk: SocketService, private http: HttpService) {
    this.http.getRoundDetail(data.uniqueId).pipe(take(1)).subscribe(res => { 
      console.log(res);
    })
      
    }

  ngOnInit(): void {
  }

}
