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
import { Showtime } from '../../../core/models/showtime/showtime.model';
import { Cinema } from '../../../core/models/cinema/cinema.model';

@Component({
  selector: 'app-cinema-showtime-modal',
  templateUrl: './cinema-showtime-modal.component.html',
  styleUrls: ['./cinema-showtime-modal.component.scss'],
  standalone: false,
})
export class CinemaShowtimeModalComponent {
  @Input() showModal: boolean = false;
  @Input() movie: Movie | null = null;
  @Input() cinemaId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() proceed = new EventEmitter<{ cinema: Cinema; showtime: Showtime }>();

  @ViewChild('modalContent') modalContent!: ElementRef;

  // Add flag to control confirm modal visibility
  showConfirmModal: boolean = false;

  selectedShowtime: Showtime | null = null;
  selectedCinemaObj: Cinema | null = null;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.showModal && this.modalContent) {
      const clickedInside = this.modalContent.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.closeModal();
      }
    }
  }

  onBookShowtime(event: { showtime: Showtime; cinema: Cinema }): void {
    this.selectedShowtime = event.showtime;
    this.selectedCinemaObj = event.cinema;
    // Open confirm modal instead of emitting immediately
    this.showConfirmModal = true;
  }

  closeModal(): void {
    this.close.emit();
    this.selectedShowtime = null;
    this.selectedCinemaObj = null;
    this.showConfirmModal = false; // Close confirm modal if open
  }

  // Handle confirmation from ConfirmBookingModal
  onConfirmBooking(event: { movie: Movie; cinema: Cinema; showtime: Showtime }): void {
    this.proceed.emit({ cinema: event.cinema, showtime: event.showtime });
    this.closeModal(); // Close both modals
  }

  // Handle closing of confirm modal
  onCloseConfirmModal(): void {
    this.showConfirmModal = false;
  }
}
