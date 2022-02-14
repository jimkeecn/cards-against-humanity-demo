import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from 'src/app/model';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Output() selectCard =  new EventEmitter();
  @Input() card: Card;
  constructor() { }

  ngOnInit(): void {
  }

  selectCardFn() {
    this.selectCard.emit(this.card.uniqueId);
  }

}
