import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-trailer-modal',
  templateUrl: './trailer-modal.component.html',
  styleUrls: ['./trailer-modal.component.scss'],
  standalone: false,
})
export class TrailerModalComponent {
  @Input() showModal: boolean = false;
  @Input() movieTitle: string = '';
  @Input() trailerUrl: SafeResourceUrl | null = null;
  @Output() close = new EventEmitter<void>();
  @ViewChild('modalTrailer') modalTrailer!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showModal && this.modalTrailer) {
      const clickedInside = this.modalTrailer.nativeElement.contains(target);
      if (!clickedInside) {
        this.close.emit();
      }
    }
  }
}
