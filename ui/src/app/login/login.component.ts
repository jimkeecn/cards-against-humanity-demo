import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    userName: new FormControl("",[Validators.maxLength(10)])
  })

  constructor(public route:Router) { }

  ngOnInit(): void {
  }

  login(): void{
    console.log(this.loginForm.value);
    this.route.navigate(['roomlist']);
  }


}
