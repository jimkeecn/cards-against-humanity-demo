import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    userName: new FormControl("",[Validators.maxLength(10),Validators.required])
  })

  constructor(public route: Router, private sk:SocketService, private http:HttpService) { 
    
  }

  ngOnInit(): void {
  }

  login(): void{
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      let param = this.loginForm.value;
      //this.socketService.createUserName$(param.userName);
      this.http.newUser(param).subscribe(x => { 
        console.log(x);
        /** Start connecting to socket */
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(x));
        this.sk.connect();
        this.route.navigate(['roomlist']);
      });
      
    }
   
  }


}
