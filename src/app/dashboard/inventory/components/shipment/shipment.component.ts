
import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ILoginData, ILoginResponse } from '@auth/models/login.response';
import { IAssetReg, IAssetSearchList } from '@dashboard/asset-registry/models/assets';
import { IAssetCategories, IAssetStatus } from '@dashboard/config-assets/models/asset-categories';
import { AssetService } from '@dashboard/config-assets/services/asset.service';
import { IUnit } from '@dashboard/configuration/models/units/unit';
import { UnitService } from '@dashboard/configuration/services/unit.service';
import { Column } from '@shared/models/column';
import { ICommonRequest, IRequest } from '@shared/models/common-request';
import { IDropdown } from '@shared/models/dropdown';
import { IGetSearchRequest } from '@shared/models/request';
import { Constants } from 'src/app/core/http/constant';
import * as moment from 'moment';
import { CommonService } from '@shared/services/common.service';
import { constants } from 'buffer';
import { LoadingService } from '@shared/services/spinner.service';
import { IVendor } from '@dashboard/planning-scheduling/permit-to-work/models/vendor';
import { PermittoWorkService } from '@dashboard/planning-scheduling/permit-to-work/services/permit-to-work.service';
import { Router } from '@angular/router';
import { ShipmentService } from './services/shipment.service';
import { FormGroup, FormControl } from '@angular/forms';
import { IStatusResponse } from '@dashboard/service-requests/models/status-response';
import { IShipment, IShipmentSearchList, IShpList, IVoicList } from '../models/shipment';
import { IFormCheck } from '@shared/models/role-check';
import { ICPNumList } from '@dashboard/asset-registry/test/models/cashpurchase';

 interface DateRange {
  startDate: any;
  endDate: any;
}
@Component({
  selector: 'nxasm-shipment',
  templateUrl: './shipment.component.html',
  styleUrls: ['./shipment.component.scss']
})

export class ShipmentComponent implements OnInit {
   shipments: IShipment[] =[];  
   invoiceNames:IVoicList[]=[];
    rollName!: string;
    isAddEdit = false;    
     showFilter = false;
  showmFilter = false;
    categoryId = 0;  
    items: IDropdown[] = [];  
  shipmentNames: IShpList[] = [];  
  statuses: IStatusResponse[] = []; 
    shipmentSearch: IShipmentSearchList = {} as IShipmentSearchList;     
    UserInfo:ILoginResponse = {} as ILoginResponse;
    userRoleId!: string;   
    vendorNames: IVendor[] = [];
    isNotFound = false;
    shipmentForm = new FormGroup({
    InvoiceNumber: new FormControl(''),
    CarrierName: new FormControl(''),
    Vendor: new FormControl(''),
   receivedDateFrom:new FormGroup({startDate: new FormControl(), endDate: new FormControl()}),
    PageNo: new FormControl(''),
    PageSize: new FormControl(''),
    TotalRecords: new FormControl(''),
    Pagination: new FormControl(''),
    SystemId: new FormControl(''),
    Role: new FormControl(''),
   
  });
 
   ranges: any = {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
     objSearch:any = {
      shipmentNumber: [],
      invoiceNumber: [],
      carrierName: '',
      Vendor: '',
      receivedDateFrom: null,
      receivedDateTo:'',
      PageNo: 1,
      PageSize: 10,
      TotalRecords: 0
  
     }    
    objForm: IFormCheck = {} as IFormCheck;   
    LoginUserInfo: ILoginData = {} as ILoginData;
   tableColumns: Array<Column> = [
    {
      columnDef: 'index',
      header: 'No',
      cell: (element: Record<string, any>) => ''
    },
    {
      columnDef: 'shipmentNumber',
      header: 'Shipment Num',
      isEditLink: true,
      cell: (element: Record<string, any>) => `${element['shipmentNumber']}`
    },
    {
      columnDef: 'invoivceNumber',
      header: 'Invoice Num',
      cell: (element: Record<string, any>) => `${element['invoiceNumber']}`
    },
    {
      columnDef: 'carrierName',
      header: 'Carrier Name',
      cell: (element: Record<string, any>) => `${element['carrierName']}`
    },
    {
      columnDef: 'receivedDate',
      header: 'Received Date',
      cell: (element: Record<string, any>) => `${element['receivedDate']}`
    },
    {
      columnDef: 'vendorName',
      header: 'Vendor ',
      cell: (element: Record<string, any>) => `${element['vendorName']}`
    },
    {
      columnDef: 'vehicleNum',
      header: 'Vehicle Num',
      cell: (element: Record<string, any>) => `${element['vehicleNumber']}`
    },
    {
      columnDef: 'location',
      header: 'Location',
      cell: (element: Record<string, any>) => `${element['locationName']}`
    },
    {
      columnDef: 'status',
      header: 'Status',
      cell: (element: Record<string, any>) => `${element['StatusName']}`
    },    
    {
      columnDef: 'actions',
      header: 'Actions',
      cell: (element: Record<string, number>) => `${element['shipmentId']}`,
      isDeletebtn: false,
      isEditbtn: false,      
    }
  ];
  service: any;
  dataList: any;
    constructor(private router: Router, 
      private shipmentService: ShipmentService, private assetService: AssetService, private snackBar: MatSnackBar, private unitService: UnitService,
      private commonService: CommonService, private permitService: PermittoWorkService, private _loading: LoadingService
      ) {}
  
  ngOnInit(): void {
  if (this.commonService.getFormPriviliges) {
    this.getFormPriviliges();
    this.getShipmentNumList();
    this.getInvoiceNumsList();
  }
}

    pageLoad() {
    
      this.LoginUserInfo = this.commonService.loginStorageData;
   
      this.getVendorsList();      
     
    //  this.getShipmentList();
  
      this.userRoleId = this.LoginUserInfo.userRoleId;
    }
  
   getVendorsList() {
    this.permitService.getVendorList().subscribe((res: IVendor[]) => {
      this.vendorNames = res;
    });
  }
     
getFormPriviliges(): void {

  this.commonService.getFormPriviliges.subscribe({
    next: (res: IFormCheck[]) => {
      if (!res || res.length === 0) {
        return;
      }
      this.objForm = res[0];
      // Enable Edit button based on privilege
      if (this.objForm.edit === 1) {
        const actionCol = this.tableColumns.find(x => x.columnDef === 'actions');
        if (actionCol) {
          actionCol.isEditbtn = true;
          actionCol.isDeletebtn = true;
        }
      }

      // Load page data only if list permission is allowed
      if (this.objForm.list === 1) {
        this.pageLoad();
      //  this.getShipmentList();
      }
    },
    error: (err: any) => {
      console.error('Privilege API error', err);
    }
  });

}  

getShipmentList() {

  this._loading._loading.next(true);
  this.shipments = [];
  this.isNotFound = false;

  const request: ICommonRequest = {} as ICommonRequest;

  let fromDate = '';
  let toDate = '';

  if (this.objSearch.receivedDateFrom) {

    fromDate = this.objSearch.receivedDateFrom.startDate
      ? this.objSearch.receivedDateFrom.startDate.format('YYYY-MM-DD')
      : '';

    toDate = this.objSearch.receivedDateFrom.endDate
      ? this.objSearch.receivedDateFrom.endDate.format('YYYY-MM-DD')
      : '';
  }

  const reqdata: IRequest[] = [
  { key: 'ShipmentNumber', value: this.objSearch.shipmentNumber?.toString() || '' },
  { key: 'InvoiceNumber', value: this.objSearch.invoiceNumber?.toString() || '' },
  { key: 'CarrierName', value: this.objSearch.carrierName ? this.objSearch.carrierName.trim() : '' },
  { key: 'VendorId', value: this.objSearch.Vendor?.toString() || '' },
  { key: 'FromDate', value: fromDate },
  { key: 'ToDate', value: toDate },
  { key: 'PageNo', value: this.objSearch.PageNo.toString() },
  { key: 'PageSize', value: this.objSearch.PageSize.toString() },
  { key: 'Pagenation', value: '1' }
];
// ];

  request.Params = reqdata;

  this.commonService.setFilterObject(Constants.SHIPMENT_SEARCH_LIST, this.objSearch);

  this.shipmentService.getShipmentSearchList(request).subscribe({
    next: (res: any) => {

      this._loading._loading.next(false);

      if (res) {

        this.shipmentSearch = res;

        this.objSearch.TotalRecords =
          this.shipmentSearch.totalRows > 0
            ? this.shipmentSearch.totalRows
            : this.objSearch.TotalRecords;

        if (this.shipmentSearch.results) {

          this.shipments =
            typeof this.shipmentSearch.results === 'string'
              ? JSON.parse(this.shipmentSearch.results)
              : this.shipmentSearch.results;

        } else {

          this.shipments = [];
          this.isNotFound = true;

        }

      } else {

        this.shipments = [];
        this.isNotFound = true;

      }

    },
    error: () => {

      this._loading._loading.next(false);
      this.shipments = [];
      this.isNotFound = true;

    }
  });
}

pageChanged(obj:any){
  this.objSearch.PageSize = obj?.pageSize ? obj.pageSize : this.objSearch.PageSize;
  this.objSearch.PageNo = (obj?.pageIndex ?? 0) + 1;
  this.getShipmentList();
}


    search() {
      this.objSearch.PageNo = 1;
      this.objSearch.PageSize = this.objSearch.PageSize;
      this.getShipmentList();
    }
  
 
    AddShipment(){
    this.shipmentService.shipmentId=0;
    this.router.navigate(['/dashboard/i-v/shipment/new']);
  }
    
  
    editAssetId(id: any) {
      const shipmentId = Number(id) || 0;
      if (!shipmentId) {
        console.log('selected Shipment id...'+shipmentId)
        this.snackBar.open('Invalid shipment id', 'close', {
          duration: 2500, panelClass: 'error'
        });
        return;
      }

      this.router.navigate(['/dashboard/i-v/shipment/new'], {
        queryParams: { id: shipmentId }
      });
    }
  
    addEditMessage(status: number) {
      if(status > 0) {
        this.isAddEdit = false;
        this.getShipmentList();
      }
    }
  
    SearchMaterialIssue() {    
      this.objSearch.PageNo = 1;
       this.objSearch.PageSize =  this.objSearch.PageSize;
      this.getShipmentList();
    }
  
    reset() {
      
      this.objSearch = {
        shipmentNumber: [],
          invoiceNumber: [],
          carrierName: '',
          Vendor: '',
          receivedDateFrom: null,
          receivedDateTo:'',
          PageNo: 1,
          PageSize: 10,
          TotalRecords: 0
       
      }
      this.commonService.setFilterObject(Constants.SHIPMENT_SEARCH_LIST, this.objSearch);
    }

getShipmentNumList(){
  this.shipmentService.getShipmentNums().subscribe((res: IShpList[]) => {
    this.shipmentNames = res;
    //console.log("data for shipmentLis====>"+JSON.stringify(this.shipmentNames));
  });
}

getInvoiceNumsList(){
  this.shipmentService.getInvoiceNums().subscribe((res: IVoicList[]) => {
    this.invoiceNames = res;
    //console.log("data for shipmentLis====>"+JSON.stringify(this.shipmentNames));
  });
}

      
    export() {

  const request: ICommonRequest = {} as ICommonRequest;

  const reqdata: IRequest[] = [
    { key: 'PageNo', value: this.objSearch.PageNo ? this.objSearch.PageNo.toString() : '' },
    { key: 'PageSize', value: this.objSearch.PageSize ? this.objSearch.PageSize.toString() : '' },
    { key: 'Pagenation', value: '0' }
  ];

  request.Params = reqdata;

  this.shipmentService.getShipmentSearchList(request).subscribe((res: { results: string; }) => {

    if (res && res.results) {

      const assets =
        typeof res.results === 'string'
          ? JSON.parse(res.results)
          : res.results;

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(assets);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      XLSX.writeFile(wb, 'Shipment_' + moment().format("DD-MM-YYYY HH:mm") + '.xlsx');
    }

  });
}


    datesUpdated(range: any): void {

  if (range?.startDate && range?.endDate) {

    this.objSearch.receivedDateFrom = {
      startDate: range.startDate,
      endDate: range.endDate
    };

    console.log(
      "Selected Dates:",
      this.objSearch.receivedDateFrom.startDate.format('YYYY-MM-DD'),
      this.objSearch.receivedDateFrom.endDate.format('YYYY-MM-DD')
    );

  }
}
  
    refreshTableData(e: any) {
      this.getShipmentList();
    }
   
  
}
