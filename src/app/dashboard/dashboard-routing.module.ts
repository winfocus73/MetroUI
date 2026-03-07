import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from '../core/layouts/not-found/not-found.component';
import { ToasterContainerComponent } from '../shared/utils/dialogs/toaster/toaster-container.component';
import { ServiceRequestDashboardComponent } from './dashboard/service-request/service-request-dashboard.component';
import { WorkOrderDashboardComponent } from './dashboard/work-order/work-order-dashboard.component';
import { PermittoWorkDashboardComponent } from './dashboard/permit-to-work/ptw-dashboard.component';
import { SignalingLayoutComponent } from './asset-registry/components/signaling/signaling.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { PowerbiReportComponent } from '@shared/components/powerbi-report/powerbi-report.component';

export const DashboardRoutes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                // path: 'home',
                // component: HomeComponent,
                // canActivate: [AuthGuard]
                path: 'home',
                loadChildren: () => import('./dashboard/charts.module').then((m) => m.ChartsModule),
                data: { breadcrumb: 'Dashboard' },
                canActivate: [AuthGuard]
            },
          //   {
          //     path: 'signaling',
          //     component: SignalingLayoutComponent,
          //     canActivate: [AuthGuard]
          // },
            // {
            //   path: 'home/Service Requests',
            //     component: ServiceRequestDashboardComponent,
            //     canActivate: [AuthGuard]
            // },
            // {
            //   path:'home/Work Orders',
            //   component: WorkOrderDashboardComponent,
            //   canActivate: [AuthGuard]
            // },
            // {
            //   path:'home/Permit To Works',
            //   component: PermittoWorkDashboardComponent,
            //   canActivate: [AuthGuard]
            // },
            {
                path: 'a-r',
                loadChildren: () => import('./asset-registry/asset-registry.module').then((m) => m.AssetModule),
                data: { breadcrumb: 'Asset Register', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'c-u',
                loadChildren: () => import('./configuration/configuration.module').then((m) => m.ConfigurationModule),
                data: { breadcrumb: 'Config Users', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'c-a',
                loadChildren: () => import('./config-assets/config-assets.module').then((m) => m.ConfigAssetsModule),
                data: { breadcrumb: 'Configuration Asset', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'c-m',
                loadChildren: () => import('./configuration-maintenance/config-maintenance.module').then((m) => m.ConfigMaintenanceModule),
                data: { breadcrumb: 'Configuration Maintenance', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'c-s',
                loadChildren: () => import('./configuration-setup/config-setup.module').then((m) => m.ConfigSetupModule),
                data: { breadcrumb: 'Configuration Setup', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'm-s',
                loadChildren: () => import('./maintenance-shop/maintenance-shop.module').then((m) => m.MaintenanceShopModule),
                data: { breadcrumb: 'Maintenance Shop', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'p-wb',
                loadChildren: () => import('./planning-workbench/planning-workbench.module').then((m) => m.PlanningWorkbenchModule),
                data: { breadcrumb: 'Planning Workbench', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'sc-wb',
                loadChildren: () => import('./schedule-workbench/schedule-workbench.module').then((m) => m.ScheduleWorkbenchModule),
                data: { breadcrumb: 'Schedule Planning Workbench', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'a-m',
                loadChildren: () => import('./audit/audit.module').then((m) => m.AuditModule),
                data: { breadcrumb: 'Audit' },
                canActivate: [AuthGuard]
              },
              {
                path: 'messaging',
                loadChildren: () => import('./messaging/messaging.module').then((m) => m.MessagingModule),
                data: { breadcrumb: 'Messaging' },
                canActivate: [AuthGuard]
              },
              {
                path: 'p-s',
                loadChildren: () => import('./planning-scheduling/planning-and-scheduling.module').then((m) => m.PlanningandSchedulingModule),
                data: { breadcrumb: 'Planning and Scheduling', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'calendar',
                loadChildren: () => import('./calendar/calendar.module').then((m) => m.CalendarModule),
                data: { breadcrumb: 'Calendar' },
                canActivate: [AuthGuard]
              },
              {
                path: 'powerbi-report',
                component: PowerbiReportComponent,
                data: { breadcrumb: 'powerbi-report' },
                canActivate: [AuthGuard]
              },
              {
                path: 's-r',
                loadChildren: () => import('./service-requests/service-request.module').then((m) => m.ServiceRequestModule),
                data: { breadcrumb: 'Service Requests', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'c-p',
                loadChildren: () => import('./config-policies/config-policies.module').then((m) => m.ConfigPoliciesModule),
                data: { breadcrumb: 'Config Policies', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'w-f',
                loadChildren: () => import('./work-flow/work-flow.module').then((m) => m.WorkFlowSummaryModule),
                data: { breadcrumb: 'Workflow', isClickable: true },
                canActivate: [AuthGuard]
              },
              {
                path: 'i-v',
                loadChildren: () =>import('./inventory/inventory.module').then((m)=>m.InventoryModule),
                data: {breadcrumb:'inventory', isClickable: true},
                canActivate: [AuthGuard]
              },
              {
                path:'**',
                component: NotFoundComponent
              }
        ]
    }
];

@NgModule({
    imports: [ RouterModule.forChild(DashboardRoutes) ],
    exports: [ RouterModule ]
})

export class DashboarRoutingModule {
  //static components = [DashboardComponent, HomeComponent,ServiceRequestDashboardComponent,WorkOrderDashboardComponent,PermittoWorkDashboardComponent];
}
