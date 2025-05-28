import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  standalone: false,
})
export class LoadingSpinnerComponent implements OnChanges {
  @Input() isLoading: boolean = false;
  showLoading: boolean = false;
  private startTime: number = 0;
  private minLoadingTime: number = 1000; // 2 giây
  private timeoutId: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('isLoading changed:', this.isLoading, 'showLoading:', this.showLoading);
    if (changes['isLoading']) {
      if (this.isLoading && !this.showLoading) {
        // Bắt đầu hiển thị loading
        this.showLoading = true;
        this.startTime = Date.now();
        if (this.timeoutId) {
          clearTimeout(this.timeoutId); // Hủy timeout cũ nếu có
        }
      } else if (!this.isLoading && this.showLoading) {
        // Khi isLoading chuyển thành false, đảm bảo chờ đủ 2 giây
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = this.minLoadingTime - elapsedTime;

        if (remainingTime > 0) {
          this.timeoutId = setTimeout(() => {
            this.showLoading = false;
            this.timeoutId = null;
          }, remainingTime);
        } else {
          this.showLoading = false;
          this.timeoutId = null;
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId); // Hủy timeout khi component bị hủy
    }
  }
}
