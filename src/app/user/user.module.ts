import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
import { ActorListComponent } from './components/actor-list/actor-list.component';
import { CinemaShowtimeModalComponent } from './components/cinema-showtime-modal/cinema-showtime-modal.component';
import { ConfirmBookingModalComponent } from './components/confirm-booking-modal/confirm-booking-modal.component';
import { DetailMovieComponent } from './components/detail-movie/detail-movie.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { MovieCarouselComponent } from './components/movie-carousel/movie-carousel.component';
import { MovieInfoComponent } from './components/movie-info/movie-info.component';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { OrderConfirmComponent } from './components/order-confirm/order-confirm.component';
import { OrderComponent } from './components/order/order.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { PaymentComponent } from './components/payment/payment.component';
import { QuickFiltersComponent } from './components/quick-filters/quick-filters.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { SeatSelectionComponent } from './components/seat-selection/seat-selection.component';
import { ShowtimesComponent } from './components/showtimes/showtimes.component';
import { SuccessComponent } from './components/success/success.component';
import { TopicComponent } from './components/topic/topic.component';
import { TrailerModalComponent } from './components/trailer-modal/trailer-modal.component';
import { TrailerComponent } from './components/trailer/trailer.component';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { AccountInfoComponent } from './components/account-info/account-info.component';

@NgModule({
  declarations: [
    UserComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DetailMovieComponent,
    OrderComponent,
    HeaderComponent,
    FooterComponent,
    OrderConfirmComponent,
    SearchPageComponent,
    TopicComponent,
    CinemaShowtimeModalComponent,
    ConfirmBookingModalComponent,
    SeatSelectionComponent,
    MovieListComponent,
    MovieCarouselComponent,
    QuickFiltersComponent,
    PaginationComponent,
    TrailerModalComponent,
    ActorListComponent,
    ShowtimesComponent,
    MovieInfoComponent,
    TrailerComponent,
    PaymentComponent,
    SuccessComponent,
    LoadingSpinnerComponent,
    AccountInfoComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule, UserRoutingModule],
})
export class UserModule {}
