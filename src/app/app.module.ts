import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './features/home/home.component';
import { HeaderComponent } from './features/header/header.component';
import { FooterComponent } from './features/footer/footer.component';
import { OrderComponent } from './components/order/order.component';
import { DetailProductComponent } from './components/detail-product/detail-product.component';
import { OrderConfirmComponent } from './components/order-confirm/order-confirm.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { FormsModule } from '@angular/forms';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';

import { TokenInterceptor } from './core/interceptors/token.interceptor';

import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './shared/components/error-message/error-message.component';
import { HighlightDirective } from './shared/directives/highlight.directive';
// import { TruncatePipe } from './shared/pipes/truncate.pipe';

export function HttpLoaderFactory(http: HttpClient) {}

@NgModule({
  declarations: [
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    DetailProductComponent,
    OrderComponent,
    OrderConfirmComponent,
    LoginComponent,
    RegisterComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    HighlightDirective,
    // TruncatePipe,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [
    provideHttpClient(withInterceptorsFromDi()), // ✅ khai báo HttpClient ở đây thay vì HttpClientModule
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [
    // HeaderComponent,
    HomeComponent,
    // DetailProductComponent,
    // OrderComponent,
    // OrderConfirmComponent,
    // LoginComponent,
    // RegisterComponent,
  ],
})
export class AppModule {}
