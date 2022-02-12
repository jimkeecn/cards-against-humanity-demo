import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'judge',
  templateUrl: './judge.component.html',
  styleUrls: ['./judge.component.scss']
})
export class JudgeComponent implements OnInit {

  @Input() userName: string;
  constructor() { }

  ngOnInit(): void {
  }

  getInitial() :string {
    if (this.userName && this.userName.length > 0) {
      return this.userName[0];
    }
    return ""
  }
}
