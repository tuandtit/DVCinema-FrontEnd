import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module'; // SharedModule đã được import đúng
import { AdminRoutingModule } from './admin-routing.module'; // AdminRoutingModule quản lý routes
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { BookingsComponent } from './components/bookings/bookings.component';
import { CinemasComponent } from './components/cinemas/cinemas.component';
import { HeaderComponent } from './components/header/header.component';
import { MoviesComponent } from './components/movies/movies.component';
import { QrScannerComponent } from './components/qr-scanner/qr-scanner.component';
import { ShowtimesComponent } from './components/showtimes/showtimes.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UsersComponent } from './components/users/users.component';
import { NgxScannerQrcodeComponent, LOAD_WASM } from 'ngx-scanner-qrcode';
import { TicketDisplayComponent } from './components/ticket-display/ticket-display.component';
import { StatsDashboardComponent } from './components/stats-dashboard/stats-dashboard.component';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card'; // Import CardModule
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe();
@NgModule({
  declarations: [
    AdminComponent,
    HeaderComponent,
    SidebarComponent,
    MoviesComponent,
    CinemasComponent,
    BookingsComponent,
    ShowtimesComponent,
    UsersComponent,
    AdminDashboardComponent,
    QrScannerComponent,
    TicketDisplayComponent,
    StatsDashboardComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule, // AdminRoutingModule đã được import để xử lý các routes của AdminModule
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgChartsModule,
    ChartModule,
    NgxScannerQrcodeComponent,
    CardModule,
    ProgressBarModule,
    DropdownModule,
    ButtonModule
    // Nếu bạn muốn sử dụng NgChartsModule, hãy đảm bảo rằng module này đã được import chính xác
  ],
})
export class AdminModule {}
