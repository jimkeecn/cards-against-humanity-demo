import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

  @Input() question: string;
  constructor() { }

  ngOnInit(): void {
  }

}
