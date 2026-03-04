import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FooterComponent } from './footer/footer.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { RouterModule } from '@angular/router';
import { ToasterComponent } from 'src/app/shared/utils/dialogs/toaster/toaster.component';
import { ToasterContainerComponent } from 'src/app/shared/utils/dialogs/toaster/toaster-container.component';
//import { ChangePasswordComponent } from '../../shared/components/change-pwd/change-pwd.component';
import { SharedModule } from '@shared/shared.module';
import { MenuItemComponent } from './toolbar/mat-menu/menu-item.component';

@NgModule({
  schemas:[CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations: [
    FooterComponent,
    SidenavComponent,
    ToolbarComponent,
    BreadcrumbComponent,
    ToasterComponent,
    ToasterContainerComponent,
    MenuItemComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    FooterComponent,
    SidenavComponent,
    ToolbarComponent,
    BreadcrumbComponent,
    ToasterComponent,
    ToasterContainerComponent,
    MenuItemComponent
  ],
})
export class DashboardLayoutModule { }
