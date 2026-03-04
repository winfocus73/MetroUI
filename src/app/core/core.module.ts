import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppInterceptor } from './http/http.interceptor';
import { Oauth2Interceptor } from './http/oauth2.interceptor';
import { NotFoundComponent } from './layouts/not-found/not-found.component';
import { LoadingService } from '../shared/services/spinner.service';
import { CanDeactivateGuard } from './guards/can-deactivate.guard';

@NgModule({
  declarations: [
    NotFoundComponent
  ],
  imports: [
    BrowserAnimationsModule, // For AngularMaterial Components
    HttpClientModule,
  ],
  providers: [
    LoadingService,
    { provide: HTTP_INTERCEPTORS, useClass: Oauth2Interceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true }
  ],
  exports: []
})
export class CoreModule { }
