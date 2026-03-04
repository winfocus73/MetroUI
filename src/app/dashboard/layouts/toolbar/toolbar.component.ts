import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ILoginResponse } from 'src/app/auth/models/login.response';
import { ChangePasswordComponent } from '../../../shared/components/change-pwd/change-pwd.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Menu } from '@dashboard/menu';
import { Observable, catchError, map, of, startWith, tap } from 'rxjs';
import { FormControl, FormGroup, UntypedFormControl } from '@angular/forms';
import { MessagingService } from '@dashboard/messaging/messaging/services/massaging.service';
import { ICommonRequest, IRequest } from '@shared/models';
import { FeedbackComponent } from '@shared/components/feedback/feedback.component';
import { CommonService } from '@shared/services/common.service';
import { ProfileComponent } from '@shared/components/profile/profile.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit, OnChanges {
  @Input() menusData!: Menu[];
  @Input() dataMenus!: Menu[];
  @Input() reportsMenusData!: Menu[];
  @Input() reportsDataMenus!: Menu[];
  orderNumber = 0;
  @Output() sidenavToggle = new EventEmitter<boolean>();
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('notificationTemplate') notificationTemplate!: TemplateRef<any>;
  loginData: ILoginResponse = {} as ILoginResponse;
  displayRole!: string;
  wfTemplateObjectTypeId = '';
  filteredOptions: Observable<Menu[]> = new Observable<Menu[]>();
  myControl = new UntypedFormControl();
  dialogRef!: MatDialogRef<ChangePasswordComponent>;
  profileDialogRef!: MatDialogRef<ProfileComponent>;
  powerBITplRef!: MatDialogRef<any>;
  notificationTemplateRef!: MatDialogRef<any>;
  unReadMessageCount!: string;
  formData = {
    orderNumber: '',
  };
  headerSearch = new FormGroup({
    orderNumber: new FormControl(''),
    wfTemplateObjectTypeId: new FormControl(''),
  });
  safeUrl!: SafeResourceUrl;
  link!: string;
  showIframe: boolean = false;
  userRoleId: string = '';
  notifications: any;
  unReadNotificationCount: number = 0;

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private commonService: CommonService,
    public dialog: MatDialog,
    private messageService: MessagingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    let data: any = sessionStorage.getItem('sessionData');
    this.loginData = JSON.parse(atob(data));
    const role: any = sessionStorage.getItem('roleMenu');
    if (role) {
      this.displayRole = JSON.parse(atob(role))?.roleName?.replace(
        /[" ]+/g,
        ''
      );
      this.userRoleId = JSON.parse(atob(role))?.roleId?.replace(
        /[" ]+/g,
        ''
      );
    }
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => <Menu[]>this._filter(value))
    );
    this.getUnReadMessageCount();
    this.getUnReadNotificationCount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.reportsDataMenus);
    if (this.reportsMenusData.length) {
      // if(!this.reportsMenusData.some(e => e.name == 'Embed Report Sample')){
      //   // this.reportsMenusData.push({
      //   //   state: 'Embed Report Sample',
      //   //   name: 'Embed Report Sample',
      //   //   type: '',
      //   //   icon: '',
      //   //   id: '',
      //   //   submenu: []
      //   // })
      // }
    }
    // this.reportsDataMenus = [
    //   {
    //     "name": "Service Requests",
    //     "state": "sr-rep",
    //     "type": "report",
    //     "icon": "crop_7_5",
    //     "id":1,
    //     "submenu": [
    //         {
    //           "name": "Service Requests",
    //           "state": "sr-rep/https://ngl-rapp-001/Reports/powerbi/AMS%20Reports/SR%20Reports/Service%20Request",
    //           "type": "report",
    //           "icon": "crop_7_5",
    //           "id": 1,
    //           submenu: []
    //         }
    //     ]
    // },
    // {
    //     "name": "Workorders",
    //     "state": "wo-rep",
    //     "type": "report",
    //     "icon": "crop_7_5",
    //     "id":2,
    //     "submenu": [
    //         {
    //             "name": "Workorders",
    //             "state": "wo-rep/https://ngl-rapp-001/Reports/powerbi/AMS%20Reports/Work%20Order%20Reports/Work%20Order%20NXAMS",
    //             "type": "report",
    //             "icon": "crop_7_5",
    //             "id":1,
    //             submenu:[]
    //         }
    //     ]
    // }
    // ]
  }

  toggleIframe() {
    this.showIframe = !this.showIframe; // Toggle the value of showIframe
  }

  private _filter(value: string): Menu[] {
    const filterValue = value.toLowerCase();

    const filterData: Menu[] = this.dataMenus.map((element) => {
      return {
        ...element,
        submenu: element.submenu.filter((subElement) =>
          subElement.name.toLowerCase().includes(filterValue)
        ),
      };
    });

    return filterData.filter((x) => x.submenu.length > 0);
    //return this.menusData.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  getUnReadMessageCount() {
    let request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
      {
        key: 'UserId',
        value: this.loginData.id.toString(),
      },
    ];
    request.Params = reqdata;
    this.messageService.unReadMessageCount(request).subscribe((d) => {
      if (d) this.unReadMessageCount = d.status.toString();
    });
  }

  updateFormLocation(e: any, state: string) {
    this.router.navigate(['dashboard/' + state]);
  }
  getUnReadNotificationCount() {
    console.log('[Toolbar] calling getUnReadNotificationCount, userId=', this.loginData?.id);
    const request = { Params: [{ key: 'UserId', value: this.loginData?.id?.toString() ?? ''}] } as ICommonRequest;

    this.messageService.unReadNotificationCount(request).pipe(
      tap(res => console.log('[Toolbar] service returned (tap):', res)),
      catchError(err => {
        console.error('[Toolbar] unread notif error', err);
        return of({ status: 0 } as any);
      })
    ).subscribe((d: any) => {
      console.log('[Toolbar] subscribe received:', d);
      this.unReadNotificationCount = Number(d?.status ?? 0);
    });
  }
  onSignaling() {
    this.router.navigate(['dashboard/signaling']);
  }

  onToggeleSidenav() {
    // this.appSidenavComponent.toggle();
    this.sidenavToggle.emit();
  }

  onLogout() {
    this.authService.logout({ remarks: 'User Logout' });
    this.commonService.filterObjects = {};
    this.router.navigate(['auth/login']);
  }
  onMailRoute() {
    //this.router.navigate(MessagingComponent.path());
    this.router.navigate(['dashboard/messaging']);
  }

  onCalendarRoute() {
    this.router.navigate(['dashboard/calendar']);
  }

  onPowerBiLinkClick(url: string) {
    if (url == 'Embed Report Sample') {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.example.com'
      );
      this.link = url;
      this.toggleIframe();
      this.powerBITplRef = this.dialog.open(this.dialogTemplate, {
        width: '98vw', height: '98vh',
        disableClose: false,
        data: { carId: 0 },
      });

      this.powerBITplRef.afterClosed().subscribe((result) => {
        this.toggleIframe();
      });

    } else {
      window.open(url, "_blank");
    }

    //this.router.navigate(['dashboard/powerbi-report']);
  }

  openReportInNewTab(url?: string) {
    window.open(url, "_blank");
  }

  onPowerBiLinkActiveuser() {
    //window.open('https://www.google.com', "_blank");
    window.open(
      'https://ngl-rapp-001/Reports/powerbi/AMS%20Reports/SR%20Reports/Service%20Request',
      '_blank'
    );
    //this.router.navigate(['dashboard/powerbi-report']);
  }

  onFullscreenToggle() {
    const elem = <any>document.querySelector('body');

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullScreen) {
      elem.msRequestFullScreen();
    }
  }

  changePWD(): void {
    this.dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '640px',
      disableClose: true,
      height: '45vh',
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      // if(result && result?.data) {
      //   this.assetData = result.data;
      // }
      //console.log('The dialog was closed');
    });
  }

  openFeedback(): void {
    let feedbackDialogRef = this.dialog.open(FeedbackComponent, {
      width: '640px',
      disableClose: true,
      height: '70vh',
    });

    feedbackDialogRef.afterClosed().subscribe((result) => {
      // if(result && result?.data) {
      //   this.assetData = result.data;
      // }
      //console.log('The dialog was closed');
    });
  }

  profile() {
    this.profileDialogRef = this.dialog.open(ProfileComponent, {
      width: '640px',
      disableClose: true,
      height: '55vh',
    });

    this.profileDialogRef.afterClosed().subscribe((result) => { });
  }

  test() {
    alert('HO');
  }

  onSubmit() {
    const data: any = this.headerSearch.controls.orderNumber.value;
    const type: string = this.headerSearch.controls.wfTemplateObjectTypeId.value!;
    if (data > 0) {
      if (type === 'SR' || type === 'WO' || type === 'PTW') {
        try {
          let request: ICommonRequest = {} as ICommonRequest;
          const reqdata: IRequest[] = [
            { key: 'SearchText', value: data.toString() },
            { key: 'UnitId', value: '0' },
          ];
          request.Params = reqdata;
          this.commonService.searchGlobal(request).subscribe((res) => {
            if (res) {
              const kind: string = res?.Kind;
              const id: any = res?.Id?.toString();
              const status: any = res?.Status;
              if (kind === 'SR') {
                this.router.navigate(['/dashboard/s-r/service-requests'], {
                  state: id,
                });
              } else if (kind === 'WO') {
                this.router.navigate(['dashboard/p-s/work-orders/open'], { state: id });
              } else if (kind === 'PTW' || kind === 'PT') {
                if (status == 'New') {
                  this.router.navigate(['dashboard/p-s/permit-to-work/new'], {
                    state: id,
                  });
                } else {
                  this.router.navigate(['dashboard/p-s/permit-to-work'], {
                    state: id,
                  });
                }
              }
            }
          })
        } catch (error) {
          this.snackBar.open('please try again', 'close', {
            duration: 2000,
            panelClass: 'error',
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        }
      }
    }
  }

  onNotification() {
    let request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
      { key: 'RoleId', value: this.userRoleId ? this.userRoleId.toString() : '' },
      { key: 'UnitId', value: this.loginData.unitId ? this.loginData.unitId.toString() : '' },
    ];
    request.Params = reqdata;
    this.commonService.notifications(request).subscribe((res) => {
      this.notifications = res;

      this.notificationTemplateRef = this.dialog.open(this.notificationTemplate, {
        width: '98vw', height: '70vh',
        disableClose: false,
        data: { notifications: this.notifications },
      });
    });
  }
}
