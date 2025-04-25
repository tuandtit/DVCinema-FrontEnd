import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

// App-specific imports
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './shared/components/error-message/error-message.component';
import { HighlightDirective } from './shared/directives/highlight.directive';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { ToastComponent } from './shared/components/toast/toast.component';
import { HomeComponent } from './user/components/home/home.component';
import { HeaderComponent } from './user/components/header/header.component';
import { FooterComponent } from './user/components/footer/footer.component';
import { DetailMovieComponent } from './user/components/detail-movie/detail-movie.component';
import { OrderComponent } from './user/components/order/order.component';
import { OrderConfirmComponent } from './user/components/order-confirm/order-confirm.component';
import { LoginComponent } from './user/components/login/login.component';
import { RegisterComponent } from './user/components/register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    DetailMovieComponent,
    OrderComponent,
    OrderConfirmComponent,
    LoginComponent,
    RegisterComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    HighlightDirective,
    ToastComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterLink, // Thêm để hỗ trợ [routerLink] trong template
    RouterLinkActive, // Thêm để hỗ trợ routerLinkActive="active"
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
