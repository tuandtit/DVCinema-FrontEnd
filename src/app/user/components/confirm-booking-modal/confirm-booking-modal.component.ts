import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router'; // Thêm Router
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { BookingData } from '../../../core/models/data/booking-data';
import { Movie } from '../../../core/models/movie/movie.model';
import { Showtime } from '../../../core/models/showtime/showtime.model';
import { DataSharingService } from '../../../core/services/data-sharing.service';

@Component({
  selector: 'app-confirm-booking-modal',
  templateUrl: './confirm-booking-modal.component.html',
  styleUrls: ['./confirm-booking-modal.component.scss'],
  standalone: false,
})
export class ConfirmBookingModalComponent {
  @Input() showModal: boolean = false;
  @Input() movie: Movie | null = null;
  @Input() cinema: Cinema | null = null;
  @Input() showtime: Showtime | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ movie: Movie; cinema: Cinema; showtime: Showtime }>();

  @ViewChild('modalContent') modalContent!: ElementRef;

  constructor(
    private router: Router,
    private dataSharingService: DataSharingService
  ) {} // Thêm Router vào constructor

  closeModal(): void {
    this.close.emit();
  }

  confirmBooking(): void {
    if (this.movie && this.cinema && this.showtime) {
      // Chuẩn bị dữ liệu để gửi qua query parameters

      const bookingData: BookingData = {
        movie: { ...this.movie },
        cinema: { ...this.cinema },
        showtime: { ...this.showtime },
      };

      this.dataSharingService.setData('bookingData', bookingData);
      // Chuyển hướng đến trang seat-selection
      this.router.navigate(['/seat-selection'], { state: { bookingData: bookingData } });
      this.closeModal();
    }
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';
    return time.split(':').slice(0, 2).join(':');
  }
}
