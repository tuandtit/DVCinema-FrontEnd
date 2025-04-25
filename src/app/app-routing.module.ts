import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.gard';
import { HomeComponent } from './user/components/home/home.component';
import { LoginComponent } from './user/components/login/login.component';
import { RegisterComponent } from './user/components/register/register.component';
import { DetailMovieComponent } from './user/components/detail-movie/detail-movie.component';
import { OrderComponent } from './user/components/order/order.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'topics', component: HomeComponent },
  {
    path: 'movies',
    component: DetailMovieComponent,
    children: [
      { path: 'single', component: HomeComponent }, // Giả định dùng cùng component, có thể thay đổi
      { path: 'series', component: HomeComponent },
      { path: 'theater', component: HomeComponent },
    ],
  },
  { path: 'cinemas', component: HomeComponent },
  { path: 'ticket-prices', component: HomeComponent },
  { path: 'news', component: HomeComponent },
  { path: 'detail-movie/:id', component: DetailMovieComponent },
  { path: 'showtimes', component: OrderComponent, canActivate: [AuthGuard] },
  // Thêm các route khác nếu cần
];

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled', // cuộn lên đầu khi chuyển route
  anchorScrolling: 'enabled', // hỗ trợ scroll đến anchor nếu có
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
