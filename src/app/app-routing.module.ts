import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DetailProductComponent } from './components/detail-product/detail-product.component';
import { OrderComponent } from './components/order/order.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './core/guards/auth.gard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'topics', component: HomeComponent },
  {
    path: 'movies',
    component: DetailProductComponent,
    children: [
      { path: 'single', component: HomeComponent }, // Giả định dùng cùng component, có thể thay đổi
      { path: 'series', component: HomeComponent },
      { path: 'theater', component: HomeComponent },
    ],
  },
  { path: 'cinemas', component: HomeComponent },
  { path: 'ticket-prices', component: HomeComponent },
  { path: 'news', component: DetailProductComponent },
  { path: 'showtimes', component: OrderComponent, canActivate: [AuthGuard] },
  // Thêm các route khác nếu cần
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
