import { AfterContentChecked, AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';

import { SidenavComponent } from './layouts/sidenav/sidenav.component';
import { IGetMenuRequest, IMenuList, Menu } from './menu';
import { MenuService } from './menu.service';
import { LoadingService } from '../shared/services/spinner.service';

import { NgScrollbar, ScrollbarAppearance }from 'ngx-scrollbar';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  static path = () => ['dashboard/home/service-requests'];

  menuRequest!: IGetMenuRequest;
  menus: Menu[] =[];
  submenus: Menu[] = []
  fullSubMenus: Menu[] = [];
  menuResponse!: IMenuList;

  reportsMenuRequest!: IGetMenuRequest;
  reportsMenus: Menu[] =[];
  reportsSubmenus: Menu[] = []
  reportsFullSubMenus: Menu[] = [];
  reportsMenuResponse!: IMenuList;
  data: any;
  reportsData: any;
  activeClass = false;
  indexParent!: number;
  userRoleId:number = 0;
  scrollbarMode: ScrollbarAppearance = 'compact';
  @ViewChild('appSideNav', { static: false }) appSidenavComponent!: SidenavComponent;

  // MenuData: IMenuList = { menus:   [
  //   {
  //     state: 'home',
  //     name: 'Dashboard',
  //     type: 'link',
  //     icon: 'las la-tachometer-alt',
  //     submenu: []
  //   },
  //   {
  //     state: 'Configuration Setup',
  //     name: 'Configuration Setup',
  //     type: 'label',
  //     icon: 'fa fa-gear',
  //     submenu: [
  //       { state: 'c-s/organizations', type: 'link', name: 'Organizations', icon: 'las la-tachometer-alt', submenu: []},
  //       { state: 'c-s/functional-units', type: 'link', name: 'Functional Units', icon: 'las la-tachometer-alt', submenu: [] },
  //     ]
  //   },
  //   {
  //     state: 'Asset',
  //     name: 'Asset',
  //     type: 'label',
  //     icon: 'fa fa-th-list',
  //     submenu: [
  //       { state: 'asset/registry', type: 'link', name: 'Register', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'asset/commissioning', type: 'link', name: 'Commissioning', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'asset/disposal', type: 'link', name: 'Disposal', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'asset/documentation', type: 'link', name: 'Documentation', icon: 'view_comfy',  submenu: [] },
  //     ]
  //   },
  //   {
  //     state: 'Manage',
  //     name: 'Manage',
  //     type: 'label',
  //     icon: 'fa fa-tasks',
  //     submenu: [
  //       { state: 'manage/employees', type: 'link', name: 'Employess', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'manage/roles', type: 'link', name: 'Roles', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'manage/users', type: 'link', name: 'Users', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'manage/units', type: 'link', name: 'Units', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'manage/locations', type: 'link', name: 'Locations', icon: 'las la-tachometer-alt', submenu: [] },
  //     ]
  //   },
  //   {
  //     state: 'schedule-workbench',
  //     name: 'Schedule Workbench',
  //     type: 'label',
  //     icon: 'fa fa-wrench',
  //     submenu: [
  //       { state: 'sc-wb/mergesplit-workorders', type: 'link', name: 'MergeSplit Workorders', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'sc-wb/schedule-workorders', type: 'link', name: 'Schedule Workorders', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'sc-wb/workorders-jobcards', type: 'link', name: 'Workorders Jobcards', icon: 'las la-tachometer-alt',  submenu: [] },
  //     ]
  //   },
  //   {
  //     state: 'planning-workbench',
  //     name: 'Planning Workbench',
  //     type: 'label',
  //     icon: 'fa fa-tasks',
  //     submenu: [
  //       { state: 'p-wb/ins-workorders', type: 'link', name: 'InSpection Workorders', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'p-wb/oh-workorders', type: 'link', name: 'OH Workorders', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'p-wb/up-maintenance-workorders', type: 'link', name: 'UnPlanned Workorders', icon: 'las la-tachometer-alt',  submenu: [] },
  //     ]
  //   },
  //   {
  //     state: 'Maintenance Shop',
  //     name: 'Maintenance Shop',
  //     type: 'label',
  //     icon: 'las la-tachometer-alt',
  //     submenu: [
  //       { state: 'm-s/asset-replacement', type: 'link', name: 'Asset Replacement', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'm-s/assignement', type: 'link', name: 'Assignement', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'm-s/job-assetpm', type: 'link', name: 'Job AssetPM', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'm-s/job-pmrepair', type: 'link', name: 'Job PMRepair', icon: 'view_comfy',  submenu: [] },
  //       { state: 'm-s/spares-positions', type: 'link', name: 'Spares Positions', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'm-s/meter/rollover', type: 'link', name: 'Rollover', icon: 'view_comfy',  submenu: [] },
  //       { state: 'm-s/meter/measurements', type: 'link', name: 'Measurements', icon: 'view_comfy',  submenu: [] },
  //       { state: 'm-s/meter/replace', type: 'link', name: 'Replace', icon: 'view_comfy',  submenu: [] },
  //     ]
  //   },
  //   {
  //     state: 'Configuration Maintenance',
  //     name: 'Configuration Maintenance',
  //     type: 'label',
  //     icon: 'las la-tachometer-alt',
  //     submenu: [
  //       { state: 'c-m/asset-locations', type: 'link', name: 'Asset Locations', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'c-m/asset-types', type: 'link', name: 'Asset Types', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'c-m/checklist', type: 'link', name: 'Checklist', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'c-m/jobactivities', type: 'link', name: 'Job Activities', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'c-m/jobplans', type: 'link', name: 'Job Plans', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'c-m/pmplans', type: 'link', name: 'PM Plans', icon: 'las la-tachometer-alt',  submenu: [] },
  //       { state: 'c-m/schedule-categories', type: 'link', name: 'Schedule Categories', icon: 'las la-tachometer-alt',  submenu: [] },
  //     ]
  //   },
  //   {
  //     state: 'audit',
  //     name: 'Audit',
  //     type: 'link',
  //     icon: 'las la-tachometer-alt',
  //     submenu: []
  //   },
  // ]
  // }

  loading =  false;
  safeUrl!: SafeResourceUrl;
  link!: string;
  showIframe: boolean = false;
  powerBITplRef!: MatDialogRef<any>;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  constructor(private menuService: MenuService, private _loading: LoadingService, public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this._loading.loading$.subscribe(x=>{
      this.loading = x;
    })
  }

  ngOnInit() {

  }
  ngAfterContentChecked() {


  }

  ngAfterViewInit() {
    this.getMenus();
    this.getReportsMenu();
  }


  // to do ( need to revise )
  onMouseEnter(event: MouseEvent) {
    console.log('onmouseEnter - scroll container')
    event.preventDefault();
    // Your custom logic here
  }

  onKeyDown(event: KeyboardEvent) {
    // Check if the key pressed is a specific key to switch modes
    console.log('onmouseDown - scroll container')
    if (event.key === 'Enter' || event.key === 'ArrowDown') {
      this.scrollbarMode = 'standard';
    }
    event.preventDefault();
  }

  onContentEnter(event: MouseEvent | KeyboardEvent){
    console.log('onmouseenter - content')
    this.scrollbarMode = 'compact';
    event.preventDefault();
  }
 
  onMouseEnterLi(event: MouseEvent) {
    const liElement = event.currentTarget as HTMLElement;
    if (liElement instanceof HTMLElement) {
      const litop = liElement.getBoundingClientRect().top;
      const liComputedStyle = window.getComputedStyle(liElement);
      const liHeight = parseFloat(liComputedStyle.height); // Get the exact height of the liElement
      const ulChild = liElement.querySelector('ul');
      if (ulChild instanceof HTMLElement) {
        const ulHeight = ulChild.getBoundingClientRect().height;
        const viewportHeight = window.innerHeight;
        const topSpace = litop; // space from top of the viewport to the top of the li element
        const bottomSpace = viewportHeight - litop; // space from bottom of the viewport to the top of the li element
  
        // Calculate whether there's enough space to display the submenu below the li element
        if (bottomSpace > ulHeight) {
          // If there's enough space, position the submenu below the li element
          ulChild.style.top = litop + 'px';
        } else if (topSpace >= ulHeight) {
          // If there's enough space above the li element, position the submenu above it
          ulChild.style.top = (litop - ulHeight+liHeight) + 'px';
        } else {
          // If there's not enough space both above and below, position the submenu at the bottom of the viewport
          //ulChild.style.top = (viewportHeight - ulHeight+liHeight-100) + 'px';
          ulChild.classList.add('submenu-pull');
        }
      }
    }
  }
  
  onMouseDown(event: MouseEvent) {
    console.log('onmouseDown - scroll container')
    // Check if the mouse button pressed is a specific button to switch modes
    if (event.button === 0) { // Left mouse button
      this.scrollbarMode = 'standard';
    }
    event.preventDefault();
  }

  // to do ( need to revise )

  getReportsMenu() {
    let roleMenu = sessionStorage.getItem('roleMenu');
    if (roleMenu) {
      this.userRoleId = JSON.parse(atob(roleMenu))?.roleId?.replace(
        /[" ]+/g,
        ''
      );
    }
    this.menuResponse = {}  as IMenuList;
    this.reportsMenuRequest = {
      SearchByName: '',
      SearchByValue: this.userRoleId?.toString()
    }
    this.menuService.getReportMenus(this.menuRequest).subscribe((res) => {
      this.reportsData = res;
      this.reportsMenus = res;
      
      this.reportsData.reportmenus.forEach((item: { submenu: any[]; })=> {
        item.submenu.forEach(sm=> {
          this.reportsSubmenus.push(sm)
        })

      })
     // this.reportsMenuResponse.menus = this.reportsData.reportmenus;
      this.reportsFullSubMenus = this.reportsData.reportmenus;
      
    });
  }
  getMenus() {
    let roleMenu = sessionStorage.getItem('roleMenu');
    if (roleMenu) {
      this.userRoleId = JSON.parse(atob(roleMenu))?.roleId?.replace(
        /[" ]+/g,
        ''
      );
    }
    this.menuResponse = {}  as IMenuList;
    this.menuRequest = {
      SearchByName: '',
      SearchByValue: this.userRoleId?.toString()
    }
    this.menuService.getMenus(this.menuRequest).subscribe((res) => {
      this.data = res;
      this.menus = res;
      
      this.data.menus.forEach((item: { submenu: any[]; })=> {
        item.submenu.forEach(sm=> {
          this.submenus.push(sm)
        })

      })
      this.menuResponse.menus = this.data.menus;
      this.fullSubMenus = this.data.menus;
      
    });
  }
  onSidenavToggle() {
    this.appSidenavComponent.toggle();
  }
  activeParentli(i: number) {
    this.activeClass=true;
    this.indexParent = i;
  }

  helpSysytemClick() {
    window.open(environment.backend.helpUrl, "_blank");
  }

  toggleIframe() {
    this.showIframe = !this.showIframe; // Toggle the value of showIframe
  }

  onPowerBiLinkClick(url: string) {
    if(url== 'Embed Report Sample'){
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.example.com'
      );
      this.link = url;
      this.toggleIframe();
      this.powerBITplRef = this.dialog.open(this.dialogTemplate, {
        width: '98vw',height:'98vh',
        disableClose: false,
        data: { carId: 0 },
      });

      this.powerBITplRef.afterClosed().subscribe((result) => {
        this.toggleIframe();
      });

    }else{
    window.open(url, "_blank");
    }

    //this.router.navigate(['dashboard/powerbi-report']);
  }
}
