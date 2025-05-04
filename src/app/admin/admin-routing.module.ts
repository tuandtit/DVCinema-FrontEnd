import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { MoviesComponent } from './components/movies/movies.component';
import { CinemasComponent } from './components/cinemas/cinemas.component';
import { ShowtimesComponent } from './components/showtimes/showtimes.component';
import { UsersComponent } from './components/users/users.component';
import { BookingsComponent } from './components/bookings/bookings.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'statistics', component: StatisticsComponent },
      { path: 'movies', component: MoviesComponent },
      { path: 'cinemas', component: CinemasComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'showtimes', component: ShowtimesComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'statistics', pathMatch: 'full' }, // Mặc định vào trang thống kê
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
