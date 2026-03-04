import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  ActivatedRoute,
  NavigationEnd,
  Event,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { ILoginData } from '@auth/models/login.response';
import { WorkFlowService } from '@dashboard/configuration-setup/services/workflow.service';
import { IApprovePTWRequest } from '@dashboard/planning-scheduling/permit-to-work/models/approve-ptw-request';
import { ICommunicationDetails } from '@dashboard/planning-scheduling/permit-to-work/models/communication-details';
import { IPermittoWorkDetail } from '@dashboard/planning-scheduling/permit-to-work/models/permit-to-work-detail';
import { PTWStates } from '@dashboard/planning-scheduling/permit-to-work/models/ptw-constants';
import { IStartPTWRequest } from '@dashboard/planning-scheduling/permit-to-work/models/start-ptw-request';
import { ISubmitPTWRequest } from '@dashboard/planning-scheduling/permit-to-work/models/submit-ptw-request';
import { PermittoWorkService } from '@dashboard/planning-scheduling/permit-to-work/services/permit-to-work.service';
import { ITracking } from '@dashboard/planning-scheduling/work-order/models/tracking';
import { WorkOrderService } from '@dashboard/planning-scheduling/work-order/services/work-order.service';
import { ServiceRequestService } from '@dashboard/service-requests/services/service-request.service';
import {
  IActionsResponse,
  ICommonRequest,
  IBreadCrumb,
  IRequest,
} from '@shared/models';
import { IAttachement } from '@shared/models/attachment';
import { IFormCheck } from '@shared/models/role-check';
import { CommonService } from '@shared/services/common.service';
import * as moment from 'moment';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Constants } from 'src/app/core/http/constant';

@Component({
  selector: 'app-fw-bw',
  templateUrl: './forward-backward.component.html',
  styleUrls: ['./forward-backward.component.scss'],
})
export class ForwardBackWordComponent implements OnInit, OnChanges {
  @Input() paginationOptions: any = {};
  @Input() getFilterItem$: any = {};
  @Input() getFilterItemDetails: any = {};
  @Input() enableCrossListDetails: boolean = false;

  @Output() pageChanged: EventEmitter<any> = new EventEmitter();

  currrentRoute: any = {};
  @Input() isDetailsNavigationVisible: boolean = true;
  pageOptions!: any

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public permitService: PermittoWorkService,
    private workorderService: WorkOrderService,
    private serviceRequestService: ServiceRequestService,
    private commonService: CommonService
  ) {
    this.router.events.subscribe((event: Event) => {

      if (event instanceof NavigationEnd) {
          // Hide loading indicator
          if(this.commonService.currentFilterItemOptions){
          if(event.url == '/dashboard/p-s/work-orders/open' && this.commonService.currentFilterItemOptions.type == 'wo'){
            this.isDetailsNavigationVisible = true
          } else  if(event.url == '/dashboard/p-s/permit-to-work/open' && this.commonService.currentFilterItemOptions.type == 'ptw'){
            this.isDetailsNavigationVisible = true
          } else  if(event.url == '/dashboard/s-r/service-requests/open' && this.commonService.currentFilterItemOptions.type == 'sr'){
            this.isDetailsNavigationVisible = true
          }  else
            this.isDetailsNavigationVisible = false;

          if(this.commonService.currentFilterItemOptions.pageOptions){
              this.commonService.currentFilterItemOptions.pageOptions.isVisible = this.isDetailsNavigationVisible;
              this.pageOptions = this.commonService.currentFilterItemOptions.pageOptions;
          }
          this.cdr.detectChanges();
        } else {
          this.isDetailsNavigationVisible = false;
        }
      }
  });
  }
  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit() {
    if (
      !this.commonService.currentFilterItemOptions ||
      !this.commonService.currentFilterItemOptions.ctx
    ) {
      this.isDetailsNavigationVisible = false;
      return;
    }

    if (this.commonService.currentFilterItemOptions) {
      let ctx = this.commonService.currentFilterItemOptions.ctx;
      if (ctx) {
        this.paginationOptions.index = ctx.itemIndex;
        this.paginationOptions.totalRecords = ctx.totalRecords;
        if (
          this.commonService.currentFilterItemDetailOptions &&
          this.commonService.currentFilterItemOptions.type !=
          this.commonService.currentFilterItemDetailOptions.type
        ) {
          this.isDetailsNavigationVisible = false;
        }

        if(this.commonService.currentFilterItemOptions.pageOptions){
          this.pageOptions = this.commonService.currentFilterItemOptions.pageOptions;
        }
      } else {
        this.isDetailsNavigationVisible = false;
      }

    }
  }

  moveback() {
    if (this.commonService.currentFilterItemOptions) {
      if (this.paginationOptions.index > 1) --this.paginationOptions.index;
      if(this.pageOptions){
        this.updateBackwardPageOptions();
      }
      this.loadPageData();
    }
  }

  moveforward() {
    if (this.commonService.currentFilterItemOptions) {
      if (this.paginationOptions.index < this.paginationOptions.totalRecords)
        ++this.paginationOptions.index;
        if(this.pageOptions){
          this.updatePageOptions();
        }
        this.loadPageData();
    }
  }

  updateBackwardPageOptions(){
    if(this.pageOptions){
      let itemIndex = this.pageOptions.pageItems?.indexOf(this.pageOptions.currentItem)
      if(itemIndex-1 == -1){
        // back to list
        // this.router.navigate(['/dashboard/p-s/permit-to-work/list']);
        return;
      }
      --itemIndex;
      this.pageOptions.itemIndex = itemIndex + 1;
      if(itemIndex > -1)
      this.pageOptions.currentItem = this.pageOptions?.pageItems[itemIndex];
      }
  }

  updatePageOptions(){
    if(this.pageOptions){
      let itemIndex = this.pageOptions.pageItems?.indexOf(this.pageOptions.currentItem)
      if(itemIndex == -1 || itemIndex  == this.pageOptions.pageItems.length-1){
        // back to list
        // this.router.navigate(['/dashboard/p-s/permit-to-work/list']);
        return;
      }
      ++itemIndex;
      this.pageOptions.itemIndex = itemIndex + 1;
      if(itemIndex > -1)
      this.pageOptions.currentItem = this.pageOptions?.pageItems[itemIndex];
      }
  }

  loadPageData() {

    if (this.commonService.currentFilterItemOptions.type == 'ptw') {
      this.permitService.permittoWorkId = this.pageOptions.currentItem.ptwId;
      const assetRequest: ICommonRequest = {} as ICommonRequest;
      this.permitService.getPermittoWorkDetails(assetRequest).subscribe(d => {
        if (d) this.pageChanged.emit({ data: d });
      });
      this.commonService.currentFilterItemOptions.pageOptions = this.pageOptions;
      return;
    } else if (this.commonService.currentFilterItemOptions.type == 'wo') {
      let woNumber = this.pageOptions.currentItem.id;
      if (woNumber)
        this.pageChanged.emit({ data: { workorderId: woNumber } });
      return;
    } else if (this.commonService.currentFilterItemOptions.type == 'sr') {
      let srId = this.pageOptions.currentItem.id;
      if (srId){
        this.serviceRequestService.serviceRequestId = srId.toString();
        const assetRequest: ICommonRequest = {} as ICommonRequest;
        this.serviceRequestService.getServiceRequestDetails(assetRequest)
        .subscribe(d => {
          if (d) this.pageChanged.emit({ data: d });
        });
      }
      return
    }
    this.commonService.currentFilterItemOptions.options.Params.forEach(
      (v, i) => {
        if (v.key == 'PageNo') {
          v.value = this.paginationOptions.index.toString();
        } else if (v.key == 'PageSize') {
          v.value = '1';
        }
      }
    );

    this.commonService.currentFilterItemOptions
      .currentFilter$(this.commonService.currentFilterItemOptions.options)
      .subscribe((res: any) => {
        let data = JSON.parse(res.results.toString());
        if (this.commonService.currentFilterItemOptions.type == 'ptw-wo') {
          //this.router.navigate(['dashboard/p-s/work-orders/open'], { state: data[0].ptwWoNumber });
          //if (woNumber)
          this.pageChanged.emit({ data: { workorderId: data[0].ptwWoId } });
          return;
        }
        if (this.commonService.currentFilterItemOptions.type == 'wo-ptw') {
          this.router.navigate(['dashboard/p-s/work-orders/open'], {
            state: data[0].ptwWoId,
          });
          return;
        }
        if (this.commonService.currentFilterItemOptions.type == 'wo') {
          let woNumber = data[0].id;
          if (woNumber)
            this.pageChanged.emit({ data: { workorderId: woNumber } });
          return;
        }
        if (this.commonService.currentFilterItemOptions.type == 'sr') {
          let srId = data[0].id;
          if (srId)
            this.serviceRequestService.serviceRequestId = srId.toString();
        }
        if (this.commonService.currentFilterItemOptions.type == 'ptw') {
          this.permitService.permittoWorkId = data[0].ptwId;
        }
        this.commonService.currentFilterItemDetailOptions.options.Params.forEach(
          (v, i) => {
            if (v.key == 'PtWId') {
              v.value = data[0].ptwId.toString();
            }

            if (v.key == 'SRId') {
              v.value = data[0].id.toString();
            }
          }
        );

        this.commonService.currentFilterItemDetailOptions
        .currentFilter$(
            this.commonService.currentFilterItemDetailOptions.options
          )
          .subscribe((dt) => {
            if (dt) this.pageChanged.emit({ data: dt });
          });
      });
  }
}
