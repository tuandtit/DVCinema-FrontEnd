import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Movie } from '../../../core/models/movie/movie.model';
import { Cinema } from '../../../core/models/cinema/cinema.model';
import { Showtime } from '../../../core/models/showtime/showtime.model';

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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.showModal && this.modalContent) {
      const clickedInside = this.modalContent.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.closeModal();
      }
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  confirmBooking(): void {
    if (this.movie && this.cinema && this.showtime) {
      this.confirm.emit({ movie: this.movie, cinema: this.cinema, showtime: this.showtime });
      this.closeModal();
    }
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';
    return time.split(':').slice(0, 2).join(':');
  }
}
