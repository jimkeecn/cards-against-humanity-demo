import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-room',
  templateUrl: './new-room.component.html',
  styleUrls: ['./new-room.component.scss']
})
export class NewRoomComponent implements OnInit {
  
  roomForm = new FormGroup({
    name: new FormControl('', [Validators.maxLength(10),Validators.required]),
    number : new FormControl(5,[Validators.required])
  })

  constructor(public route:Router) { }

  ngOnInit(): void {
  }

  create(): void{
    console.log(this.roomForm.value);
  }

  return(): void{
    this.route.navigate(['roomlist']);
  }

}
