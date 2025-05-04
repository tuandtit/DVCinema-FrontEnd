import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MoviesComponent } from './components/movies/movies.component';
import { CinemasComponent } from './components/cinemas/cinemas.component';
import { ShowtimesComponent } from './components/showtimes/showtimes.component';
import { UsersComponent } from './components/users/users.component';
import { FormsModule } from '@angular/forms';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { BookingsComponent } from './components/bookings/bookings.component';

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
    StatisticsComponent,
  ],
  imports: [CommonModule, RouterModule, AdminRoutingModule, FormsModule],
})
export class AdminModule {}
