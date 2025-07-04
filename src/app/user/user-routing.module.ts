import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.gard';
import { RedirectIfLoggedInGuard } from '../core/guards/redirect-if-logged-in.guard';
import { AccountInfoComponent } from './components/account-info/account-info.component';
import { CancelComponent } from './components/cancel/cancel.component';
import { DetailMovieComponent } from './components/detail-movie/detail-movie.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { OrderComponent } from './components/order/order.component';
import { PaymentComponent } from './components/payment/payment.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { SeatSelectionComponent } from './components/seat-selection/seat-selection.component';
import { SuccessComponent } from './components/success/success.component';
import { TopicComponent } from './components/topic/topic.component';
import { UserComponent } from './user.component';
import { HistoryBookingComponent } from './components/history-booking/history-booking.component';
import { WatchMovieComponent } from './components/watch-movie/watch-movie.component';
import { ScheduleComponent } from './components/schedule/schedule.component';

const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent, canActivate: [RedirectIfLoggedInGuard] },
      { path: 'register', component: RegisterComponent },
      { path: 'account-info', component: AccountInfoComponent },
      { path: 'history-booking', component: HistoryBookingComponent },
      { path: 'topics', component: TopicComponent },
      { path: 'search-page', component: SearchPageComponent },
      { path: 'schedules', component: ScheduleComponent },
      { path: 'watch-movie/:id', component: WatchMovieComponent },
      { path: 'detail-movie/:id', component: DetailMovieComponent },
      { path: 'seat-selection', component: SeatSelectionComponent, canActivate: [AuthGuard] },
      { path: 'payment', component: PaymentComponent },
      { path: 'success', component: SuccessComponent },
      { path: 'cancel', component: CancelComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
