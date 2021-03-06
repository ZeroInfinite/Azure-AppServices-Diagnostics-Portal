import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.css']
})
export class ToggleButtonComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() selected: boolean;
  @Input() ToggleText: string;
  @Output() selectedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  update(val) {
    if (this.selected != val){
    this.selected = val;
    this.selectedChange.emit(this.selected);
    }
  }
}
