import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-quick-filters',
  templateUrl: './quick-filters.component.html',
  styleUrls: ['./quick-filters.component.scss'],
  standalone: false,
})
export class QuickFiltersComponent {
  @Input() filterType: string = 'nowshowing';
  @Output() setFilter = new EventEmitter<string>();
}
