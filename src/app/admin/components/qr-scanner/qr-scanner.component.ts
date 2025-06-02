// src/app/qr-scanner/qr-scanner.component.ts
import { Component, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NgxScannerQrcodeComponent, ScannerQRCodeResult } from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  standalone: false,
})
export class QrScannerComponent implements AfterViewInit {
  @ViewChild('action') scannerComponent!: NgxScannerQrcodeComponent;

  scannedData: ScannerQRCodeResult[] = [];
  private isScanned = false; // Để tránh navigate nhiều lần

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    // Dùng setTimeout để tránh lỗi ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.scannerComponent.start().subscribe(
        () => {
          console.log('Scanner started');
        },
        (error) => {
          console.error('Cannot start scanner', error);
        }
      );

      this.scannerComponent.data.subscribe((results) => {
        if (results && results.length > 0 && !this.isScanned) {
          const value = results[0].value;

          this.ngZone.run(() => {
            this.isScanned = true;
            console.log('Navigating to ticket with value:', value);
            // Gửi value qua state
            this.router.navigate(['/admin/ticket'], {
              state: { bookingCode: value },
            });
          });
        }

        this.scannedData = results;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.scannerComponent) {
      this.scannerComponent.stop();
    }
  }
}
