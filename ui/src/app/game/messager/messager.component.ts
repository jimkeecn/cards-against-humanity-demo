import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'messager',
  templateUrl: './messager.component.html',
  styleUrls: ['./messager.component.scss']
})
export class MessagerComponent implements OnInit {

  isActive: boolean = false;
  isShaking: boolean = false;
  _messages : any[] = [];
  @Input()
  get messages() {
    return this._messages;
  }
  set messages(messages:any[]) {
    this._messages = messages;
  }
  


  constructor() { }

  ngOnInit(): void {
  }

}
