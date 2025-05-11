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
  @Output() close = new EventEmitter<void>();
  @Output() proceed = new EventEmitter<{ cinema: Cinema; showtime: Showtime }>();

  @ViewChild('modalContent') modalContent!: ElementRef;

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
  }

  proceedToConfirm(): void {
    if (this.selectedCinemaObj && this.selectedShowtime) {
      this.proceed.emit({ cinema: this.selectedCinemaObj, showtime: this.selectedShowtime });
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
    this.selectedShowtime = null;
    this.selectedCinemaObj = null;
  }
}
