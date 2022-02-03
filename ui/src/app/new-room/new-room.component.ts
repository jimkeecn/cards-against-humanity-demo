import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-new-room',
  templateUrl: './new-room.component.html',
  styleUrls: ['./new-room.component.scss']
})
export class NewRoomComponent implements OnInit,OnDestroy {
  
  roomForm = new FormGroup({
    name: new FormControl('', [Validators.maxLength(10),Validators.required]),
    totalPlayer : new FormControl(5,[Validators.required])
  })

  constructor(public route:Router,private sk:SocketService) { }

  ngOnInit(): void {
  }

  create(): void{
    console.log(this.roomForm.value);
    if (this.roomForm.valid) {
      this.sk.createNewRoom$(this.roomForm.value)
      this.sk.$getRoomId().pipe(take(1)).subscribe(x => { 
        if (x) {
          console.info(`I have created room ${x}`);
          this.route.navigate(['/game',x]);
        }
      })
    }
    
  }

  return(): void{
    this.route.navigate(['roomlist']);
  }

  
  ngOnDestroy(): void {
  }
}
