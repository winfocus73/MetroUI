import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CoreModule } from './core/core.module';
import {HashLocationStrategy, LocationStrategy } from '@angular/common'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { TokenService } from './shared/services/token.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SharedModule } from '@shared/shared.module';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { OWL_DATE_TIME_FORMATS, OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';

// todo custom date format globally
 export const DateFormats = {
            parse: {
                dateInput: ['DD-MM-YYYY']
            },
            display: {
                dateInput: 'DD-MM-YYYY',
                monthYearLabel: 'MMM YYYY',
                dateA11yLabel: 'LL',
                monthYearA11yLabel: 'MMMM YYYY',
            },
        };


export const MY_NATIVE_FORMATS = {
          fullPickerInput: {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'},
          datePickerInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
          timePickerInput: {hour: 'numeric', minute: 'numeric'},
          monthYearLabel: {year: 'numeric', month: 'short'},
          dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
          monthYearA11yLabel: {year: 'numeric', month: 'long'},
      };


// const appInitializerFn = (tokenService: TokenService) => {
//   return () => {
//     return tokenService.init();
//   };
// };
@NgModule({
  declarations: [
    AppComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    AppRoutingModule, // Main routes for application
    CoreModule,       // Singleton objects (services, components and resources that are loaded only at app.module level)
    SharedModule,
    NgIdleKeepaliveModule.forRoot(),
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DateFormats },
    {provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS},
    TokenService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


// {
//   provide: APP_INITIALIZER,
//   useFactory: appInitializerFn,
//   multi: true,
//   deps: [TokenService]
// },