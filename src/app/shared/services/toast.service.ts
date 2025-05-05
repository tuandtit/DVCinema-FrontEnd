import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<{ message: string; type: 'success' | 'error' }>();

  toastState = this.toastSubject.asObservable();

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastSubject.next({ message, type });
  }

  hideToast() {
    this.toastSubject.next({ message: '', type: 'success' });
  }
}
