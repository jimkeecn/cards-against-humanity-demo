import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    userName: new FormControl("",[Validators.maxLength(10),Validators.required])
  })

  constructor(public route: Router, private socketService: SocketService,private socket: Socket) { 
    
  }

  ngOnInit(): void {
  }

  login(): void{
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      let param = this.loginForm.value;
      this.socketService.createUserName$(param.userName);
      this.route.navigate(['roomlist']);
    }
   
  }


}
