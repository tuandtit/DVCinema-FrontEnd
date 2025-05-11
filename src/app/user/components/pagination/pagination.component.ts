import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  standalone: false,
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() isLoading: boolean = false;
  @Output() changePage = new EventEmitter<number>();
  inputPage: number = 1;

  ngOnChanges(): void {
    this.inputPage = this.currentPage;
  }

  goToPage(): void {
    const page = Math.floor(Number(this.inputPage));
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.changePage.emit(page);
    } else {
      this.inputPage = this.currentPage;
    }
  }
}
