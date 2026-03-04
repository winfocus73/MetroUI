import { ModuleWithProviders, NgModule } from '@angular/core';
import {NgxCaptchaModule} from '@binssoft/ngx-captcha';
import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { ToasterService } from '@shared/utils/dialogs/toaster/toaster.service';

@NgModule({
  declarations: [
    ...AuthRoutingModule.components
  ],
  imports: [
    SharedModule,
    AuthRoutingModule,
    NgxCaptchaModule,
  ],
  providers: [ToasterService]
})
export class AuthModule { 
  // static forRoot(): ModuleWithProviders {
  //   return {
  //     ngModule: AuthModule,
  //     providers: [ ToasterService ]
  //   };
  // }
}
