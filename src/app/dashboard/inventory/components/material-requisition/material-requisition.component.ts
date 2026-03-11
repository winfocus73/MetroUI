import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ILoginResponse, ILoginData } from '@auth/models/login.response';
import { UnitService } from '@dashboard/configuration/services/unit.service';
import { IDropdown, Column, ICommonRequest, IRequest, ILookupValue, IGetSearchRequest } from '@shared/models';
import { IFormCheck } from '@shared/models/role-check';
import { CommonService } from '@shared/services/common.service';
import { LoadingService } from '@shared/services/spinner.service';
import * as moment from 'moment';
import { Constants } from 'src/app/core/http/constant';
import { HttpApi } from 'src/app/core/http/http-api';
import * as XLSX from 'xlsx';
import { IUnit } from '@dashboard/configuration/models/units/unit';
import { DynamicViewDialogComponent } from '@shared/components/dynamic-view-dialog/dynamic-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { IMaterialRequisitionReg, IMaterialRequisitionSearchList, IMRNumberDropdown, ISessionsList } from '@dashboard/inventory/models/material-requisition';
import { InventoryService } from '@dashboard/inventory/services/inventory.service';
import { ICategory, IPriority, ISectionList } from '@dashboard/inventory/models/material-issue';
import { Console } from 'console';
import { IStatus } from '../material-issue/add-edit-material-issue/add-edit-material-issue.component';

@Component({
  selector: 'nxasm-inventory-material-requisition',
  templateUrl: './material-requisition.component.html',
  styleUrls: ['./material-requisition.component.scss']
})
export class MaterialRequisitionComponent implements OnInit {
  selectedLanguage: string = 'en';
  languages = Constants.LANGUAGES;
  labels: { [key: string]: string } = {};
  @Output() message = new EventEmitter();
  @Input() mrId!: number;
  showFilter = false;
  showmFilter = false;
  materials: IMaterialRequisitionReg[] =[];
    statusList: IStatus[] = [];
   priorities: IPriority[] = [];
    status: IStatus[] = [];
  rollName!: string;
  isAddEdit = false;
  units: IUnit[] = [];
  sessionList: ISessionsList[] = [];
  categoryItems: IDropdown[] = [];
  pageNo = 1;
  pageSize = 10;
   categories: ICategory[] = [];
  totalRecords!: number; 
  mrSearch: IMaterialRequisitionSearchList = {} as IMaterialRequisitionSearchList;
  // priorityList = HttpApi.priorityData;
  // statusList = HttpApi.workStatusData;
  UserInfo:ILoginResponse = {} as ILoginResponse;
  userRoleId!: string;
  items: IDropdown[] = [];
  isNotFound = false;
  toDate = '';
  fromDate = '';
  MrData: IMRNumberDropdown[] = [];
  objSearch = {
    name: '',
    MRNumber: null,
    UnitId: '',
    unitName: '',
    statusId: '',
    Location:'',
    LocationId: '',
    PriorityId: '',
    priority: null,
    ToDate: '',
    FromDate: '',
    PageNo: 1,
    PageSize: 10,
    TotalRecords: 0,
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
        columnDef: 'mrNum',
        header: 'MR Num',
        isEditLink: true,
        cell: (element: Record<string, any>) => `${element['mrNumber']}`
      },
      {
        columnDef: 'SectionName',
        header: 'Section Name',
        cell: (element: Record<string, any>) => `${element['SectionName']}`
      },
      {
        columnDef: 'mrReqDate',
        header: 'MR Req Date',
        cell: (element: Record<string, any>) => `${element['mrDate']}`
      },
      {
        columnDef: 'priority',
        header: 'Priority',
        cell: (element: Record<string, any>) => `${element['priorityName']}`
      },
      {
        columnDef: 'requiredDate',
        header: 'Required Date',
        cell: (element: Record<string, any>) => `${element['requiredDate']}`
      },
      {
        columnDef: 'status',
        header: 'Status',
        cell: (element: Record<string, any>) => `${element['statusName']}`
      },
      {
        columnDef: 'location',
        header: 'Location',
        cell: (element: Record<string, any>) => `${element['locationName']}`
      },
      {
        columnDef: 'actions',
        header: 'Actions',
        cell: (element: Record<string, number>) => `${element['mrId']}`,
        // isHistorybtn: true,
        isViewbtn: true,
        isEditbtn: false,
        isDeletebtn: true
       
      }
    ];
  priorityList: any;
  constructor(private router: Router,
      private inventoryServices: InventoryService,
       private snackBar: MatSnackBar, private unitService: UnitService,
    private commonService: CommonService, private _loading: LoadingService, private dialog: MatDialog
    ) {}
  
  ngOnInit(): void {
    if (this.commonService.getFormPriviliges) {
      this.getFormPriviliges();
    }
    this.getUnitsData();
    this.getAllMrNumbersList();
    this.getCategories();
    this.getPriorities();
    this.getMrStatus();
  }
  pageLoad() {
    if(this.commonService.filterObjects[Constants.MATERIAL_REQUISITION_FILTER_OBJECT]){
      this.objSearch = this.commonService.filterObjects[Constants.MATERIAL_REQUISITION_FILTER_OBJECT];
    }
    this.LoginUserInfo = this.commonService.loginStorageData;
    if(this.LoginUserInfo.loginData.assetCategoryId > 0) {
    }  
    this.userRoleId = this.LoginUserInfo.userRoleId;
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
          }
        }

        // Load page data only if list permission is allowed
        if (this.objForm.list === 1) {
          this.pageLoad();
          // this.getMaterialRequisitionList();
        }
      },
      error: (err: any) => {
        console.error('Privilege API error', err);
      }
    });

  }
  getAllMrNumbersList() {
  this.inventoryServices.getAllMrList().subscribe((res: any) => {
    this.MrData = res;
      console.log("data of mr===========>"+JSON.stringify(this.MrData));
  });
}
   getMaterialRequisitionList() {
  this._loading._loading.next(true);
  this.materials = [];
  this.isNotFound = false;

  const request: ICommonRequest = {} as ICommonRequest;
  // const reqdata: IRequest[] = [
  //   { key: 'MRNumber', value: this.objSearch.MRNumber ? this.objSearch.MRNumber : '' },
  //   { key: 'UnitId', value: this.objSearch.unitName ? this.objSearch.unitName.toString() : '' },
  //   { key: 'statusId', value: this.objSearch.statusId ? this.objSearch.statusId.toString() : '' },
  //   { key: 'FromDate', value: this.objSearch.FromDate ? this.objSearch.FromDate.toString() : '' },
  //   { key: 'ToDate', value: this.objSearch.ToDate ? this.objSearch.ToDate.toString() : '' },
  //   { key: 'priority', value: this.objSearch.priority ? this.objSearch.priority : '' },
  //   { key: 'LocationId', value: this.objSearch.LocationId ? this.objSearch.LocationId.toString() : '' },
  //   { key: 'PageNo', value: this.objSearch.PageNo ? this.objSearch.PageNo.toString() : '' },
  //   { key: 'PageSize', value: this.objSearch.PageSize ? this.objSearch.PageSize.toString() : '' },
  //   { key: 'Pagenation', value: '1' }
  // ];
const reqdata: IRequest[] = [
  { key: 'MRNumber', value: this.objSearch.MRNumber ? this.objSearch.MRNumber : '' },
  { key: 'UnitId', value: this.objSearch.unitName ? this.objSearch.unitName.toString() : '' },
  { key: 'statusId', value: this.objSearch.statusId ? this.objSearch.statusId.toString() : '' },
  { key: 'DateFrom', value: this.objSearch.FromDate ? this.objSearch.FromDate.toString() : '' },
  { key: 'DateTo', value: this.objSearch.ToDate ? this.objSearch.ToDate.toString() : '' },
  { key: 'priority', value: this.objSearch.priority ? this.objSearch.priority : '' },
  { key: 'LocationId', value: this.objSearch.LocationId ? this.objSearch.LocationId.toString() : '' },
  { key: 'PageNo', value: this.objSearch.PageNo ? this.objSearch.PageNo.toString() : '' },
  { key: 'PageSize', value: this.objSearch.PageSize ? this.objSearch.PageSize.toString() : '' },
  { key: 'Pagenation', value: '1' }
];
  request.Params = reqdata;
  this.commonService.setFilterObject(Constants.MATERIAL_REQUISITION_FILTER_OBJECT, this.objSearch);

  try {
    this.inventoryServices.getMaterialSearchList(request).subscribe((res: IMaterialRequisitionSearchList) => {
      this._loading._loading.next(false);
      if (res) {
        this.mrSearch = res;

        // Total records for pagination
        this.objSearch.TotalRecords = this.mrSearch.totalRows > 0 ? this.mrSearch.totalRows : this.objSearch.TotalRecords;

        // Assign data
        if (this.mrSearch.results) {
          // If backend returns JSON string, parse it
          this.materials = typeof this.mrSearch.results === 'string' ? JSON.parse(this.mrSearch.results) : this.mrSearch.results;
        } else {
          this.materials = [];
          this.isNotFound = true;
        }
      } else {
        this.materials = [];
        this.isNotFound = true;
      }
      console.log('Final MR Table Data:', this.materials);
    });
  } catch (ex) {
    this._loading._loading.next(false);
    this.materials = [];
    this.isNotFound = true;
    console.error('Error fetching MR list:', ex);
  }
}
  
    // search() {
    //   this.objSearch.PageNo = 1;
    //   this.objSearch.PageSize = this.objSearch.PageSize;
    //   this.getMaterialRequisitionList();
    // }
    search() {
    if (this.dateValidation()) {
      this.objSearch.PageNo = 1;
      this.getMaterialRequisitionList();
    } else {
      this.snackBar.open(Constants.SearchDateError || 'To Date must be greater than or equal to From Date', 'Close', {
        duration: 4000,
        panelClass: 'error',
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }
   dateValidation(): boolean {
    if (!this.objSearch.FromDate || !this.objSearch.ToDate) return true;
    
    const to = moment(moment(this.objSearch.ToDate).format('YYYY-MM-DD'))
      .isSameOrAfter(moment(this.objSearch.FromDate).format('YYYY-MM-DD'));
    return to;
  }
  
  add(data: boolean) {
    this.isAddEdit = data;
    this.mrId = 0;
  }

  editMRId(mrId: any) {
    console.log('Editing material requisition with ID:', mrId);
    const materialRequsition = this.materials.find((x: { mrId: any; }) => x.mrId == mrId);
    if (materialRequsition) {
      this.mrId = materialRequsition.mrId; 
    } else {
      this.mrId = 0;
    }
    this.isAddEdit = true;
  }

  addEditMessage(status: number) {
      if(status > 0) {
        this.isAddEdit = false;
        this.getMaterialRequisitionList()
      }
    }
  
    viewMR(rowData: any): void {
    
    let mrId = null;
    
    if (rowData?.id && typeof rowData.id === 'object') {
      mrId = rowData.id.mrld || rowData.id.mrId || rowData.id.id;
    }

    this._loading._loading.next(true);
    
    // Create request
    const request = {
      Params: [
        { Key: 'MRId', Value: mrId.toString() }
      ],
    };
    this.inventoryServices.getMaterialRequisitionDetails(request).subscribe({
      next: (response: any) => {
        this._loading._loading.next(false);
        // Open dialog
        const dialogRef = this.dialog.open(DynamicViewDialogComponent, {
          width: '90vw',
          maxWidth: '1200px',
          data: {
            title: `Material Requisition Details`,
            data: response
          }
        });
      },
    });
  }
  getCategories(): void {
        this.inventoryServices.getCategories().subscribe({
          next: (res: ICategory[]) => {
            this.categories = res;
            this.categoryItems = res.map(x => ({ 
              code: x.id.toString(), 
              value: x.name 
            }));
          }
        });
      }
    ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  };
  // datesUpdated(range: any): void {
  //   if (range.endDate && range.startDate) {
  //     let dt = moment('' + range.startDate.year() + '-' + (range.startDate.month() + 1) + '-' + range.startDate.date()).utc();
  //     dt.set({ 'hour': moment().utc().hour(), 'minute': moment().utc().minute() });
  //     range.startDate = dt;

  //     range.endDate = moment('' + range.endDate.year() + '-' + (range.endDate.month() + 1) + '-' + range.endDate.date()).utc();
  //     range.endDate.set({ 'hour': moment().utc().hour(), 'minute': moment().utc().minute() });

  //     this.materialRequisitionForm.patchValue({
  //       timeStamp: {
  //         startDate: range.startDate,
  //         endDate: range.endDate
  //       }
  //     });

  //     this.objSearch.FromDate = range.startDate.format('YYYY-MM-DD');
  //     this.objSearch.ToDate = range.endDate.format('YYYY-MM-DD');

  //     this.search();
  //   }
  // }

  datesUpdated(range: any): void {

  if (range?.startDate && range?.endDate) {

    // range.startDate is already moment object
    this.objSearch.FromDate = range.startDate.format('YYYY-MM-DD');
    this.objSearch.ToDate = range.endDate.format('YYYY-MM-DD');

    console.log(
      'User Selected Dates:',
      this.objSearch.FromDate,
      this.objSearch.ToDate
    );

    this.search();
  }
}
getPriorities() {
   this.inventoryServices.getPriorities().subscribe({
        next: (res: any[]) => {
          this.priorities = res;
          this.priorityList = res.map(x => ({ code: x.id.toString(), value: x.name }));
          console.log("==================="+JSON.stringify(this.priorityList));
        },
      });
      
  }
  materialRequisitionForm = new FormGroup({
    // timeStamp: new FormGroup({
    //   startDate: new FormControl(),
    //   endDate: new FormControl()
    // })
  });
    pageChanged(obj: any) {
      this.objSearch.PageSize =  obj.pageSize;
      this.objSearch.PageNo = obj.pageIndex;
      this.getMaterialRequisitionList();
    }
   getUnitsData() {
      let unitsrequest: IGetSearchRequest = {} as IGetSearchRequest;
       unitsrequest = {
         SearchByName:  '',
         SearchByValue:  ''
       }
       this.unitService.getUnits(unitsrequest).subscribe((res: IUnit[]) => {
         this.units = res;
       });
   }
    reset() {
   this.objSearch = {
    name: '',
    MRNumber: null,
    UnitId: '',
    unitName: '',
    statusId: '',
    Location:'',
    LocationId: '',
    PriorityId: '',
    priority: null,
    ToDate: '',
    FromDate: '',
    PageNo: 1,
    PageSize: 10,
    TotalRecords: 0,
  }

    this.commonService.setFilterObject(Constants.ASSETS_LIST_FILTER_OBJECT, this.objSearch);
  }

  
    export() {
      if (this.dateValidation()) {
      const request: ICommonRequest = {} as ICommonRequest;
      const reqdata: IRequest[] = [
        { key: 'PageNo', value: this.objSearch.PageNo  ? this.objSearch.PageNo.toString() : '' },
        { key: 'PageSize', value: this.objSearch.PageSize  ? this.objSearch.PageSize.toString() : '' },
        { key: 'MRNumber', value: this.objSearch.MRNumber  ? this.objSearch.MRNumber : '' },
        { key: 'UnitId', value: this.objSearch.UnitId  ? this.objSearch.UnitId.toString() : '' },
       { key: 'priority', value: this.objSearch.priority ? this.objSearch.priority : '' },
        { key: 'fromDate', value: this.objSearch.FromDate  ? this.objSearch.FromDate.toString() : '' },
        { key: 'toDate', value: this.objSearch.ToDate  ? this.objSearch.ToDate.toString() : '' },
        { key: 'Pagenation', value: '0' },
        {key:  'Location', value: this.objSearch.Location ? this.objSearch.Location: ''},
        
      ]
      request.Params = reqdata;
      try {
        this.inventoryServices.getMaterialSearchList(request).subscribe((res: any) =>{
          if(res) {
            const mrSearch = res;
            if(mrSearch.results) {
              const materials = JSON.parse(mrSearch.results.toString());
              const ws: XLSX.WorkSheet=XLSX.utils.json_to_sheet(materials);
              const wb: XLSX.WorkBook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws,'Sheet1' );
  
              /* save to file */
              XLSX.writeFile(wb, 'AS_' + moment().format("DD-MM-YYYY HH:mm") +'.xlsx');
            }
          }
        });
      } catch(ex) {
      }
    }
}
  
  
    refreshTableData(e: any) {
      this.getMaterialRequisitionList();
    }
     getLabel(key: string, fallback: string): string {
    return this.labels[key] || fallback;
  }
 deleteMR(id: any): void {
    if (
      confirm(
        this.getLabel(
          'confirmDelete',
          'Are you sure you want to delete?',
        ),
      )
    ) {
      this.snackBar.open(
        this.getLabel('deleteSuccess', 'Material Requisition deleted successfully'),
        'Close',
        { duration: 2000 },
      );
      this.getMaterialRequisitionList();
    }
  }
   viewMRId(rowData: any): void {
    let mrId = null;

    if (rowData?.id && typeof rowData.id === 'object') {
      mrId = rowData.id.mrid || rowData.id.mrId || rowData.id.id;
    }

    this._loading._loading.next(true);

    const request = {
      Params: [{ Key: 'MRId', Value: mrId.toString() }],
    };

    this.inventoryServices.getMaterialRequisitionDetails(request).subscribe({
      next: (response: any) => {
        this._loading._loading.next(false);
        const dialogRef = this.dialog.open(DynamicViewDialogComponent, {
          width: '90vw',
          maxWidth: '1200px',
          data: {
            title: this.getLabel('materialRequisition', 'Material Requisition'),
            data: response,
          },
        });
      },
    });
  }
  onHeaderCategoryChange(): void {
      const categoryId = this.materialRequisitionForm.get('categoryId')?.value;
      console.log("Header Category Selected:", categoryId);
      if(categoryId){
      this.getSessionList(categoryId);
      }
    }
     getSessionList(categoryId: string): void {
    
          const request = {
            Params: [
              { key: 'CategoryId', value: categoryId }
            ]
          };
    
          this.inventoryServices.getSessionsList(request).subscribe({
    
            next: (res: ISectionList) => {
    
              console.log("API response received:", res);
              this.sessionList = res.map((session: any) => ({
                code: session.id?.toString(),
                value: session.name
              }));
    
              console.log("Mapped sessionList:", this.sessionList);
    
            },
    
            error: (error: any) => {
              console.error('Error loading sessions:', error);
            }
    
          });
        }
        getMrStatus() {
          this.inventoryServices.getPoStatus().subscribe((res: any) => {
          this.status = res;
          this.statusList = res.map((x: any) => ({ code: x.id.toString(), value: x.name }));
          console.log("==================="+JSON.stringify(this.statusList));
        });
  }
}
