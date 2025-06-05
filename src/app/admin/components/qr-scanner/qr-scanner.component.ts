import { AfterViewInit, Component, NgZone, ViewChild } from '@angular/core';
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
  manualBookingCode: string = '';
  private isScanned = false;

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
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
          this.handleNavigation(value);
        }
        this.scannedData = results;
      });
    });
  }

  onManualSubmit() {
    if (this.manualBookingCode && !this.isScanned) {
      this.handleNavigation(this.manualBookingCode);
    }
  }

  private handleNavigation(bookingCode: string) {
    this.ngZone.run(() => {
      this.isScanned = true;
      console.log('Navigating to ticket with value:', bookingCode);
      this.router.navigate(['/admin/ticket'], {
        state: { bookingCode },
      });
    });
  }

  ngOnDestroy(): void {
    if (this.scannerComponent) {
      this.scannerComponent.stop();
    }
  }
}
