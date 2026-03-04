import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { DashboarRoutingModule } from './dashboard-routing.module';
import { DashboardLayoutModule } from './layouts/layouts.module';
import { MenuService } from './menu.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppInterceptor } from '../core/http/http.interceptor';
import { CommonService } from '../shared/services/common.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ServiceRequestService } from './service-requests/services/service-request.service';
import { WorkOrderDashboardComponent } from './dashboard/work-order/work-order-dashboard.component';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { LoadingService } from '@shared/services/spinner.service';

@NgModule({
  imports: [
    SharedModule,
    DashboardLayoutModule,
    DashboarRoutingModule,
    NgScrollbarModule
  ],
  declarations: [
    DashboardComponent
  ],
  providers: [LoadingService, MenuService,{ provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true }]
})
export class DashboardModule { }
