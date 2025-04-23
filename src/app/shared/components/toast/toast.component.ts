import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../../core/service/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
  toast$!: Observable<{ message: string; type: 'success' | 'error' } | null>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toast$ = this.toastService.toast$;
  }
}
