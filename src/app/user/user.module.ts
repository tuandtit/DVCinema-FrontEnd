import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DetailMovieComponent } from './components/detail-movie/detail-movie.component';
import { OrderComponent } from './components/order/order.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { UserRoutingModule } from './user-routing.module';
import { OrderConfirmComponent } from './components/order-confirm/order-confirm.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { TopicComponent } from './components/topic/topic.component';

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
  ],
  imports: [CommonModule, FormsModule, RouterModule, UserRoutingModule],
})
export class UserModule {}
