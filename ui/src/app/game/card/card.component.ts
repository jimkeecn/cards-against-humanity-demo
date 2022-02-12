import { Component, Input, OnInit } from '@angular/core';
import { Card } from 'src/app/model';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() card: Card;
  constructor() { }

  ngOnInit(): void {
  }

}
