import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DetailMovieComponent } from './components/detail-movie/detail-movie.component';
import { OrderComponent } from './components/order/order.component';
import { AuthGuard } from '../core/guards/auth.gard';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { TopicComponent } from './components/topic/topic.component';
import { SeatSelectionComponent } from './components/seat-selection/seat-selection.component';
import { PaymentComponent } from './components/payment/payment.component';
import { RedirectIfLoggedInGuard } from '../core/guards/redirect-if-logged-in.guard';
import { SuccessComponent } from './components/success/success.component';
import { CancelComponent } from './components/cancel/cancel.component';

const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent, canActivate: [RedirectIfLoggedInGuard] },
      { path: 'register', component: RegisterComponent },
      { path: 'topics', component: TopicComponent },
      { path: 'search-page', component: SearchPageComponent },
      {
        path: 'movies',
        component: DetailMovieComponent,
        children: [
          { path: 'single', component: HomeComponent },
          { path: 'series', component: HomeComponent },
          { path: 'theater', component: HomeComponent },
        ],
      },
      { path: 'cinemas', component: HomeComponent },
      { path: 'ticket-prices', component: HomeComponent },
      { path: 'news', component: HomeComponent },
      { path: 'detail-movie/:id', component: DetailMovieComponent },
      { path: 'showtimes', component: OrderComponent, canActivate: [AuthGuard] },
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
