import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ILoginData, ILoginResponse } from '@auth/models/login.response';
import { Column } from '@shared/models/column';
import { ICommonRequest, IRequest } from '@shared/models/common-request';
import { IDropdown } from '@shared/models/dropdown';
import { Constants } from 'src/app/core/http/constant';
import * as moment from 'moment';
import { CommonService } from '@shared/services/common.service';
import { IFormCheck } from '@shared/models/role-check';
import { IStation } from '@shared/models/station';
import { LoadingService } from '@shared/services/spinner.service';
import { IZone } from '@shared/models/zone';
import { ICorridor } from '@dashboard/planning-scheduling/permit-to-work/models/corridor';
import { FormControl, FormGroup } from '@angular/forms';
import { PermittoWorkService } from '@dashboard/planning-scheduling/permit-to-work/services/permit-to-work.service';
import { MatDialog } from '@angular/material/dialog';

import {
  ScreenLabelService,
  IScreenLabelResponse,
} from '@shared/services/screen-label.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Import all interfaces from your model file
import {
  IPurchaseOrder,
  IPurchaseOrderReg,
  IPurchaseOrderSearchList,
  IVendor,
  IPurchaseOrderStatus,
  IPriority,
  ILocation,
  IPONumberDropdown,
} from '@dashboard/inventory/models/purchase-order';
import { InventoryService } from '@dashboard/inventory/services/inventory.service';
import { DynamicViewDialogComponent } from '@shared/components/dynamic-view-dialog/dynamic-view-dialog.component';

@Component({
  selector: 'nxasm-inventory-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss'],
})
export class PurchaseOrderComponent implements OnInit, OnDestroy {
  @Input() purchaseOrderId!: number;
  // Language and labels
  selectedLanguage: string = 'en';
  languages = Constants.LANGUAGES;
  labels: { [key: string]: string } = {};
  private destroy$ = new Subject<void>();

  poOrderData: IPurchaseOrderReg[] = [];
  purchaseOrders: IPurchaseOrder[] = [];
  agencyNames: IVendor[] = [];
  rollName!: string;
  isAddEdit = false;
  vendors: IVendor[] = [];
  purchaseOrderStatuses: IPurchaseOrderStatus[] = [];
  priorities: IPriority[] = [];
  locations: ILocation[] = [];
  vendorItems: IDropdown[] = [];
  purchaseOrderSearch: IPurchaseOrderSearchList =
    {} as IPurchaseOrderSearchList;
  dropLabel = 'Vendor';
  UserInfo: ILoginResponse = {} as ILoginResponse;
  userRoleId!: string;
  items: IDropdown[] = [];
  isNotFound = false;
  isEditbtn = false;
  showFilter = false;
  PoData: IPONumberDropdown[] = [];
  objSearch: {
    name: string | null;
    vendorName: string | null;
    statusId: string;
    FromDate: string;
    ToDate: string;
    PriorityId: string;
    LocationId: string;
    PageNo: number;
    PageSize: number;
    TotalRecords: number;
  } = {
    name: null,
    vendorName: null,
    statusId: '',
    FromDate: '',
    ToDate: '',
    PriorityId: '',
    LocationId: '',
    PageNo: 1,
    PageSize: 10,
    TotalRecords: 0,
  };

  stations: IStation[] = [];
  objForm: IFormCheck = {} as IFormCheck;
  LoginUserInfo: ILoginData = {} as ILoginData;

  zones: IZone[] = [];
  corridors: ICorridor[] = [];

  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment().subtract(1, 'month').startOf('month'),
      moment().subtract(1, 'month').endOf('month'),
    ],
  };

  purchaseOrderForm = new FormGroup({
    // timeStamp: new FormGroup({
    //   startDate: new FormControl(),
    //   endDate: new FormControl(),
    // }),
  });

  constructor(
    private poService: InventoryService,
    private permitService: PermittoWorkService,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private _loading: LoadingService,
    public dialog: MatDialog,
    private screenLabelService: ScreenLabelService,
  ) {}

  ngOnInit(): void {
    this.loadScreenLabels();
    this.getFormPriviliges();
    this.getVendorsList();
    this.getAllPoList();
    this.getPoStatus();
    this.getPriorities();
    this.getLocations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  tableColumns: Array<Column> = [
    {
      columnDef: 'index',
      header: 'S.No.',
      cell: (element: Record<string, any>) => '',
    },
    {
      columnDef: 'poNumber',
      header: 'PO Num',
      isEditLink: true,
      cell: (element: Record<string, any>) => `${element['poNumber']}`,
    },
    {
      columnDef: 'vendorName',
      header: 'Vendor',
      cell: (element: Record<string, any>) => `${element['vendorName']}`,
    },
    {
      columnDef: 'poDate',
      header: 'PO Date',
      isDateOnly: true,
      cell: (element: Record<string, any>) =>
        element['poDate']
          ? moment(element['poDate'], 'DD-MM-YYYY').format('YYYY-MM-DD')
          : '',
    },
    {
      columnDef: 'priorityName',
      header: 'Priority',
      cell: (element: Record<string, any>) => `${element['priorityName']}`,
    },
    {
      columnDef: 'poRequiredDate',
      header: 'Required Date',
      isDateOnly: true,
      cell: (element: Record<string, any>) =>
        element['requiredDate']
          ? moment(element['requiredDate'], 'DD-MM-YYYY').format('YYYY-MM-DD')
          : '',
    },
    {
      columnDef: 'statusName',
      header: 'Status',
      isStatusPipe: true,
      cell: (element: Record<string, any>) => `${element['statusName']}`,
    },
    {
      columnDef: 'locationName',
      header: 'Location',
      cell: (element: Record<string, any>) => `${element['locationName']}`,
    },
    {
      columnDef: 'actions',
      header: 'Actions',
      cell: (element: Record<string, number>) => `${element['poId']}`,
      isEditbtn: true,
      isViewbtn: true,
      isDeletebtn: true,
    },
  ];

  updateTableHeaders(): void {
    this.tableColumns.forEach((col) => {
      switch (col.columnDef) {
        case 'index':
          col.header = this.getLabel('sNo', 'S.No.');
          break;
        case 'poNumber':
          col.header = this.getLabel('poNumber', 'PO Num');
          break;
        case 'vendorName':
          col.header = this.getLabel('vendor', 'Vendor');
          break;
        case 'poDate':
          col.header = this.getLabel('poDate', 'PO Date');
          break;
        case 'priorityName':
          col.header = this.getLabel('priority', 'Priority');
          break;
        case 'poRequiredDate':
          col.header = this.getLabel('requiredDate', 'Required Date');
          break;
        case 'statusName':
          col.header = this.getLabel('status', 'Status');
          break;
        case 'locationName':
          col.header = this.getLabel('location', 'Location');
          break;
        case 'actions':
          col.header = this.getLabel('actions', 'Actions');
          break;
      }
    });

    // Force change detection
    this.tableColumns = [...this.tableColumns];
  }

  loadScreenLabels(): void {
    this._loading._loading.next(true);

    this.screenLabelService
      .getScreenLabels('PURCHASE_ORDER', this.selectedLanguage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: IScreenLabelResponse) => {
          this._loading._loading.next(false);

          if (response.success && response.data && response.data.length > 0) {
            // Convert array to key-value object for easy access
            this.labels = {};
            response.data.forEach((item) => {
              this.labels[item.lbl_name] = item.lbl_value;
            });

            this.updateTableHeaders();
          }

          // Always load PO data
          // this.getPurchaseOrderList();
        },
        error: () => {
          this._loading._loading.next(false);
          this.getPurchaseOrderList();
        },
      });
  }
  onLanguageChange(lang: string): void {
    this.selectedLanguage = lang;
    this.loadScreenLabels();
  }
  initializeTableColumns(): void {
    this.tableColumns = [
      {
        columnDef: 'index',
        header: this.getLabel('sNo', 'S.No.'),
        cell: (element: Record<string, any>) => '',
      },
      {
        columnDef: 'poNumber',
        header: this.getLabel('poNumber', 'PO Num'),
        isEditLink: true,
        cell: (element: Record<string, any>) => `${element['poNumber']}`,
      },
      {
        columnDef: 'vendorName',
        header: this.getLabel('vendor', 'Vendor'),
        cell: (element: Record<string, any>) => `${element['vendorName']}`,
      },
      {
        columnDef: 'poDate',
        header: this.getLabel('poDate', 'PO Date'),
        isDateOnly: true,
        cell: (element: Record<string, any>) =>
          element['poDate']
            ? moment(element['poDate'], 'DD-MM-YYYY').format('YYYY-MM-DD')
            : '',
      },
      {
        columnDef: 'priorityName',
        header: this.getLabel('priority', 'Priority'),
        cell: (element: Record<string, any>) => `${element['priorityName']}`,
      },
      {
        columnDef: 'poRequiredDate',
        header: this.getLabel('requiredDate', 'Required Date'),
        isDateOnly: true,
        cell: (element: Record<string, any>) =>
          element['requiredDate']
            ? moment(element['requiredDate'], 'DD-MM-YYYY').format('YYYY-MM-DD')
            : '',
      },
      {
        columnDef: 'statusName',
        header: this.getLabel('status', 'Status'),
        isStatusPipe: true,
        cell: (element: Record<string, any>) => `${element['statusName']}`,
      },
      {
        columnDef: 'locationName',
        header: this.getLabel('location', 'Location'),
        cell: (element: Record<string, any>) => `${element['locationName']}`,
      },
      {
        columnDef: 'actions',
        header: this.getLabel('actions', 'Actions'),
        cell: (element: Record<string, number>) => `${element['poId']}`,
        isEditbtn: true,
        isViewbtn: true,
        isDeletebtn: true,
      },
    ];
  }
  getLabel(key: string, fallback: string): string {
    return this.labels[key] || fallback;
  }
  pageLoad() {
    if (
      this.commonService.filterObjects[
        Constants.PURCHASE_ORDER_LIST_FILTER_OBJECT
      ]
    ) {
      const savedFilter =
        this.commonService.filterObjects[
          Constants.PURCHASE_ORDER_LIST_FILTER_OBJECT
        ];
      this.objSearch = { ...this.objSearch, ...savedFilter };
    }
    this.LoginUserInfo = this.commonService.loginStorageData;
    this.getZones();
    this.getCorridors();
    this.getStations();
    // this.getPurchaseOrderList();

    this.userRoleId = this.LoginUserInfo?.userRoleId;
  }
  getCorridors() {
    this.commonService.getCorridors().subscribe((res: any) => {
      if (res && res.length) this.corridors = res;
    });
  }

  getZones() {
    this.commonService.zones({} as ICommonRequest).subscribe((res: any) => {
      if (res && res.length) this.zones = res;
    });
  }

  getFormPriviliges() {
    this.pageLoad();
    this.isEditbtn = true;
  }

  viewPO(rowData: any): void {
    let poId = null;

    if (rowData?.id && typeof rowData.id === 'object') {
      poId = rowData.id.pold || rowData.id.poId || rowData.id.id;
    }

    this._loading._loading.next(true);

    const request = {
      Params: [{ Key: 'POId', Value: poId.toString() }],
    };

    this.poService.getPurchaseOrderDetails(request).subscribe({
      next: (response: any) => {
        this._loading._loading.next(false);
        const dialogRef = this.dialog.open(DynamicViewDialogComponent, {
          width: '90vw',
          maxWidth: '1200px',
          data: {
            title: this.getLabel('purchaseOrder', 'Purchase Order'),
            data: response,
          },
        });
      },
    });
  }

  getPoStatus() {
    this.poService.getPoStatus().subscribe((res: any) => {
      this.purchaseOrderStatuses = res;
    });
  }

  getPriorities() {
    this.poService.getPriorities().subscribe((res: any) => {
      this.priorities = res;
    });
  }

  getLocations() {
    this.poService.getLocations().subscribe((res: any) => {
      this.locations = res;
    });
  }

  //purchaseOrderForm

  getAllPoList() {
    this.poService.getAllPoList().subscribe((res: any) => {
      this.PoData = res;
    });
  }

  getVendorsList() {
    this.permitService.getVendorList().subscribe((res: any) => {
      this.agencyNames = res;
    });
  }

  getStations() {
    const request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [{ key: 'Name', value: '' }];
    request.Params = reqdata;
    this.commonService.getStations(request).subscribe((res) => {
      this.stations = res;
    });
  }

  getPurchaseOrderList() {
    this._loading._loading.next(true);
    this.poOrderData = [];
    this.isNotFound = false;

    const request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
      {
        key: 'PONumber',
        value: this.objSearch.name ? String(this.objSearch.name) : '',
      },
      {
        key: 'VendorId',
        value: this.objSearch.vendorName
          ? String(this.objSearch.vendorName)
          : '',
      },
      {
        key: 'StatusId',
        value: this.objSearch.statusId ? String(this.objSearch.statusId) : '',
      },
      // {
      //   key: 'FromDate',
      //   value: this.objSearch.FromDate ? String(this.objSearch.FromDate) : '',
      // },
      // {
      //   key: 'ToDate',
      //   value: this.objSearch.ToDate ? String(this.objSearch.ToDate) : '',
      // },
      {
        key: 'DateFrom',
        value: this.objSearch.FromDate
          ? moment(this.objSearch.FromDate).format('YYYY-MM-DD')
          : '',
      },
      {
        key: 'DateTo',
        value: this.objSearch.ToDate
          ? moment(this.objSearch.ToDate).format('YYYY-MM-DD')
          : '',
      },

      {
        key: 'PriorityId',
        value: this.objSearch.PriorityId
          ? String(this.objSearch.PriorityId)
          : '',
      },
      {
        key: 'LocationId',
        value: this.objSearch.LocationId
          ? String(this.objSearch.LocationId)
          : '',
      },
      { key: 'PageNo', value: String(this.objSearch.PageNo) },
      { key: 'PageSize', value: String(this.objSearch.PageSize) },
      { key: 'Pagenation', value: '1' },
    ];

    request.Params = reqdata;
    this.commonService.setFilterObject(
      Constants.PURCHASE_ORDER_LIST_FILTER_OBJECT,
      this.objSearch,
    );
    this.poService.getPurchaseOrderSearchList(request).subscribe({
      next: (res: any) => {
        this._loading._loading.next(false);
        if (res) {
          this.purchaseOrderSearch = res;
          this.objSearch.TotalRecords =
            this.purchaseOrderSearch.totalRows > 0
              ? this.purchaseOrderSearch.totalRows
              : this.objSearch.TotalRecords;

          if (
            this.purchaseOrderSearch.results &&
            this.purchaseOrderSearch.results.length > 0
          ) {
            this.poOrderData = this.purchaseOrderSearch
              .results as unknown as IPurchaseOrderReg[];
            this.isNotFound = false;
          } else {
            this.poOrderData = [];
            this.isNotFound = true;
          }
        } else {
          this.poOrderData = [];
          this.isNotFound = true;
        }
      },
    });
  }

  search() {
    if (this.dateValidation()) {
      this.objSearch.PageNo = 1;
      this.getPurchaseOrderList();
    } else {
      this.snackBar.open(
        Constants.SearchDateError ||
          'To Date must be greater than or equal to From Date',
        'Close',
        {
          duration: 4000,
          panelClass: 'error',
          horizontalPosition: 'end',
          verticalPosition: 'top',
        },
      );
    }
  }
  reset() {
    this.objSearch = {
      name: null,
      vendorName: '',
      statusId: '',
      FromDate: moment(new Date().setDate(new Date().getDate() - 6)).format(
        'YYYY-MM-DD',
      ),
      ToDate: moment(new Date()).format('YYYY-MM-DD'),
      PriorityId: '',
      LocationId: '',
      PageNo: 1,
      PageSize: 10,
      TotalRecords: 0,
    };
    this.commonService.setFilterObject(
      Constants.PURCHASE_ORDER_LIST_FILTER_OBJECT,
      this.objSearch,
    );
    this.getPurchaseOrderList();
  }

  datesUpdated(range: any): void {
    if (range?.startDate && range?.endDate) {
      // range.startDate is already moment object
      this.objSearch.FromDate = range.startDate.format('YYYY-MM-DD');
      this.objSearch.ToDate = range.endDate.format('YYYY-MM-DD');

      console.log(
        'User Selected Dates:',
        this.objSearch.FromDate,
        this.objSearch.ToDate,
      );

      this.search();
    }
  }

  export() {
    if (this.dateValidation()) {
      const request: ICommonRequest = {} as ICommonRequest;
      const reqdata: IRequest[] = [
        {
          key: 'PONumber',
          value: this.objSearch.name ? String(this.objSearch.name) : '',
        },
        {
          key: 'VendorId',
          value: this.objSearch.vendorName
            ? String(this.objSearch.vendorName)
            : '',
        },
        {
          key: 'StatusId',
          value: this.objSearch.statusId ? String(this.objSearch.statusId) : '',
        },
        {
          key: 'DateFrom',
          value: this.objSearch.FromDate ? String(this.objSearch.FromDate) : '',
        },
        {
          key: 'DateTo',
          value: this.objSearch.ToDate ? String(this.objSearch.ToDate) : '',
        },
        {
          key: 'PriorityId',
          value: this.objSearch.PriorityId
            ? String(this.objSearch.PriorityId)
            : '',
        },
        {
          key: 'LocationId',
          value: this.objSearch.LocationId
            ? String(this.objSearch.LocationId)
            : '',
        },
        { key: 'PageNo', value: '1' },
        { key: 'PageSize', value: '10000' },
        { key: 'Pagenation', value: '0' },
      ];

      request.Params = reqdata;
      this.poService.getPurchaseOrderSearchList(request).subscribe({
        next: (res: any) => {
          if (res && res.results) {
            const purchaseOrder = res.results;
            const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(purchaseOrder);
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            XLSX.writeFile(
              wb,
              'PO_' + moment().format('DD-MM-YYYY HH:mm') + '.xlsx',
            );
          }
        },
      });
    }
  }

  add(data: boolean) {
    this.isAddEdit = data;
    this.purchaseOrderId = 0;
  }

  editPurchaseOrderId(poId: any) {
    const purchaseOrder = this.poOrderData.find((x) => x.poId == poId);
    if (purchaseOrder) {
      this.purchaseOrderId = purchaseOrder.poId;
    } else {
      this.purchaseOrderId = 0;
    }

    this.isAddEdit = true;
  }

  addEditMessage(status: number) {
    if (status > 0) {
      this.isAddEdit = false;
      this.getPurchaseOrderList();
    }
  }

  deletPO(id: any): void {
    if (
      confirm(
        this.getLabel(
          'confirmDelete',
          'Are you sure you want to delete this purchase order?',
        ),
      )
    ) {
      this.snackBar.open(
        this.getLabel('deleteSuccess', 'Purchase Order deleted successfully'),
        'Close',
        { duration: 2000 },
      );
      this.getPurchaseOrderList();
    }
  }

  pageChanged(obj: any) {
    this.objSearch.PageSize = obj.pageSize;
    this.objSearch.PageNo = obj.pageIndex;
    this.getPurchaseOrderList();
  }

  refreshTableData(e: any) {
    this.getPurchaseOrderList();
  }

  dateValidation(): boolean {
    if (!this.objSearch.FromDate || !this.objSearch.ToDate) return true;

    const to = moment(
      moment(this.objSearch.ToDate).format('YYYY-MM-DD'),
    ).isSameOrAfter(moment(this.objSearch.FromDate).format('YYYY-MM-DD'));
    return to;
  }
}
