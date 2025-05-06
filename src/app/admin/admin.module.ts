import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module'; // SharedModule đã được import đúng
import { AdminRoutingModule } from './admin-routing.module'; // AdminRoutingModule quản lý routes
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { BookingsComponent } from './components/bookings/bookings.component';
import { CinemasComponent } from './components/cinemas/cinemas.component';
import { HeaderComponent } from './components/header/header.component';
import { ShowtimesComponent } from './components/showtimes/showtimes.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UsersComponent } from './components/users/users.component';
import { MoviesComponent } from './components/movies/movies.component';
import { NgChartsModule } from 'ng2-charts';

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
  ],
  imports: [
    CommonModule,
    AdminRoutingModule, // AdminRoutingModule đã được import để xử lý các routes của AdminModule
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgChartsModule,
    // Nếu bạn muốn sử dụng NgChartsModule, hãy đảm bảo rằng module này đã được import chính xác
  ],
})
export class AdminModule {}
