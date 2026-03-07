import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ILoginData, ILoginResponse } from '@auth/models/login.response';
import {
  IAssetReg,
  IAssetSearchList,
} from '@dashboard/asset-registry/models/assets';
import {
  IAssetCategories,
  IAssetStatus,
} from '@dashboard/config-assets/models/asset-categories';
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
import { IFormCheck } from '@shared/models/role-check';
import { IStation } from '@shared/models/station';
import { LoadingService } from '@shared/services/spinner.service';
import { IZone } from '@shared/models/zone';
import { ICorridor } from '@dashboard/planning-scheduling/permit-to-work/models/corridor';
import { IOEM } from '@dashboard/asset-registry/models/oem';
import { PermittoWorkService } from '@dashboard/planning-scheduling/permit-to-work/services/permit-to-work.service';
import { IVendor } from '@dashboard/planning-scheduling/permit-to-work/models/vendor';
import { ICashPurchaseSearchList, ICPNumList, IItemType } from '@dashboard/inventory/models/cashpurchase';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from '@dashboard/inventory/services/inventory.service';
import { DynamicViewDialogComponent } from '@shared/components/dynamic-view-dialog/dynamic-view-dialog.component';

@Component({
  selector: 'app-cash-purchase',
  templateUrl: './cash-purchase.component.html',
  styleUrls: ['./cash-purchase.component.scss']
})
export class CashPurchaseComponent implements OnInit {

  agencyNames: IVendor[] = [];
    cashPurchaseData: ICPNumList[] = [];
    cashPurchaseSearch: ICashPurchaseSearchList = {} as ICashPurchaseSearchList;
    isAddEdit: boolean = false;
    assets: IAssetReg[] = [];
    rollName!: string;
    rec_id = 0;
    categoryId = 0;
    assetCategories: IAssetCategories[] = [];
    assetStatuses: IAssetStatus[] = [];
    assetsSearch: IAssetSearchList = {} as IAssetSearchList;
    dropLabel = 'Category';
    UserInfo: ILoginResponse = {} as ILoginResponse;
    userRoleId!: string;
    items: IDropdown[] = [];
    isNotFound = false;
    showFilter = false;
  
    objSearch = {
      sourceType: '',
      sourceNum: '',
      transactionType: null,
      transactionDate: null,
      referenceId: null,
      invoiceNumber: '',
      vendorName: null,
      vendorId: null,
      itemTypeId: null,
      categoryId: null,
      itemId: null,
      uomId: null,
      batchNumber: '',
      quantity: null,
      unitCost: null,
      lineCost: null,
      isSerialized: null,
      serialNumber: '',
      manufactureDate: null,
      make: '',
      warrantyDate: null,
      locationId: null,
      remarks: '',
      workOrderNumber: '',
      createdUserId: null,
      createdDateTime: null,
      updatedUserId: '',
      updatedDateTime: null,
      PageNo: 1,
      PageSize: 10,
      TotalRecords: 0,
      FromDate: '',
      ToDate: '',
    };
    stations: IStation[] = [];
    objForm: IFormCheck = {} as IFormCheck;
    oems: IOEM[] = [];
    itemTypes: IItemType[] = [];
    itemTypeItems: IDropdown[] = [];
    cpList: ICPNumList[] = [];
    LoginUserInfo: ILoginData = {} as ILoginData;
    tableColumns: Array<Column> = [
      {
        columnDef: 'index',
        header: 'No',
        cell: (element: Record<string, any>) => '',
      },
      {
        columnDef: 'rec_source_num',
        header: 'CP Num',
        isEditLink: true,
        cell: (element: Record<string, any>) => `${element['rec_source_num']}`,
      },
      {
        columnDef: 'rec_invoicenum',
        header: 'Bill No',
        cell: (element: Record<string, any>) => `${element['rec_invoicenum']}`,
      },
      {
        columnDef: 'rec_vendor_name',
        header: 'Vendor',
        cell: (element: Record<string, any>) => `${element['rec_vendor_name']}`,
      },
      {
        columnDef: 'rec_item_type_name',
        header: 'Item Type',
        cell: (element: Record<string, any>) =>
          `${element['rec_item_type_name']}`,
      },
      {
        columnDef: 'rec_item_name',
        header: 'Item Name ',
        cell: (element: Record<string, any>) => `${element['rec_item_name']}`,
      },
      {
        columnDef: 'rec_trans_date',
        header: 'Purchase Date',
        cell: (element: Record<string, any>) =>
          element['rec_trans_date']
            ? moment(element['rec_trans_date']).format('YYYY-MM-DD')
            : '-',
      },
      {
        columnDef: 'rec_location_name',
        header: 'Location',
        cell: (element: Record<string, any>) => `${element['rec_location_name']}`,
      },
      {
        columnDef: 'rec_qty',
        header: 'Quantity',
        cell: (element: Record<string, any>) => `${element['rec_qty']}`,
      },
  
      {
        columnDef: 'actions',
        header: 'Actions',
        cell: (element: Record<string, number>) => `${element['rec_id']}`,
        isEditbtn: true,
        isViewbtn: true,
      },
    ];
    corridors: ICorridor[] = [];
    service: any;
    dataList: any;
    searchForm: any;
    constructor(
      private fb: FormBuilder,
      private assetService: AssetService,
      private snackBar: MatSnackBar,
      private unitService: UnitService,
      private inventoryService: InventoryService,
      private commonService: CommonService,
      private _loading: LoadingService,
      private cdr: ChangeDetectorRef,
      private permitService: PermittoWorkService,
      private dialog: MatDialog,
    ) {}
  
    ngOnInit() {
      this.searchForm = this.fb.group({
        recSourceNum: [''],
        vendorId: [''],
        itemTypeId: [''],
        FromDate: [''],
        ToDate: [''],
      });
      this.getFormPriviliges();
      this.getVendorsList();
      this.getItemTypes();
      this.getCashPurchaseList();
    }
  
    getItemTypes() {
      this.inventoryService.getItemTypes().subscribe({
        next: (res: IItemType[]) => {
          this.itemTypes = res;
          console.log('item type data' + this.itemTypes);
          this.itemTypeItems = res.map((x) => ({
            code: x.id.toString(),
            value: x.name,
          }));
        },
        error: (error) => console.error('Error loading item types:', error),
      });
    }
  
    getVendorsList() {
      this.permitService.getVendorList().subscribe((res) => {
        this.agencyNames = res;
      });
    }
  
    getCashPurchaseList() {
      this.inventoryService
        .getCashPurchaseList()
        .subscribe((res: ICPNumList[]) => {
          this.cpList = res;
          console.log('data for cp list===>' + JSON.stringify(this.cpList));
        });
    }
  
    pageLoad() {
      if (this.commonService.filterObjects[Constants.ASSETS_LIST_FILTER_OBJECT]) {
        this.objSearch =
          this.commonService.filterObjects[Constants.ASSETS_LIST_FILTER_OBJECT];
      }
      this.LoginUserInfo = this.commonService.loginStorageData;
      if (this.LoginUserInfo.loginData.assetCategoryId > 0) {
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
          if (this.objForm.edit === 1) {
            const actionCol = this.tableColumns.find(
              (x) => x.columnDef === 'actions',
            );
            if (actionCol) {
              actionCol.isEditbtn = true;
            }
          }
          // Enable View button based on privilege
          if (this.objForm.view === 1) {
            const actionCol = this.tableColumns.find(
              (x) => x.columnDef === 'actions',
            );
            if (actionCol) {
              actionCol.isViewbtn = true;
            }
          }
  
          // Load page data only if list permission is allowed
          if (this.objForm.list === 1) {
            this.pageLoad();
          }
        },
        error: (err) => {
          console.error('Privilege API error', err);
        },
      });
    }
  
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
  
    getCashPurchaseSearchList() {
      this._loading._loading.next(true);
      this.cashPurchaseData = [];
      this.isNotFound = false;
      const request: ICommonRequest = {} as ICommonRequest;
      // Fix: Safely convert values to string
      const reqdata: IRequest[] = [
        {
          key: 'SourceNum',
          value: this.objSearch.sourceNum ? String(this.objSearch.sourceNum) : '',
        },
        {
          key: 'VendorId',
          value: this.objSearch.vendorId ? String(this.objSearch.vendorId) : '',
        },
        //{ key: 'ItemType', value: this.objSearch.itemTypeId ? String(this.objSearch.itemTypeId) : '' },
        {
          key: 'ItemType',
          value: this.objSearch.itemTypeId
            ? String(this.objSearch.itemTypeId)
            : '',
        },
        {
          key: 'DateFrom',
          value: this.objSearch.FromDate ? String(this.objSearch.FromDate) : '',
        },
        {
          key: 'DateTo',
          value: this.objSearch.ToDate ? String(this.objSearch.ToDate) : '',
        },
        { key: 'PageNo', value: String(this.objSearch.PageNo) },
        { key: 'PageSize', value: String(this.objSearch.PageSize) },
        { key: 'Pagenation', value: '1' },
      ];
  
      request.Params = reqdata;
  
      console.log('FINAL REQUEST:', request);
  
      request.Params = reqdata;
      this.commonService.setFilterObject(
        Constants.CASH_PURCHASE_LIST_FILTER_OBJECT,
        this.objSearch,
      );
  
      try {
        this.inventoryService.getCashPurchaseSearchList(request).subscribe({
          next: (res: any) => {
            if (res) {
              console.log('data for cp landing page====>' + JSON.stringify(res));
              this._loading._loading.next(false);
              this.cashPurchaseSearch = res;
              this.objSearch.TotalRecords =
                this.cashPurchaseSearch.totalRows > 0
                  ? this.cashPurchaseSearch.totalRows
                  : this.objSearch.TotalRecords;
  
              // Fix: Properly assign results
              if (
                this.cashPurchaseSearch.results &&
                this.cashPurchaseSearch.results.length > 0
              ) {
                this.cashPurchaseData = this.cashPurchaseSearch
                  .results as unknown as ICPNumList[];
              } else {
                this.cashPurchaseData = [];
                this.isNotFound = true;
              }
            } else {
              this._loading._loading.next(false);
              this.cashPurchaseData = [];
              this.isNotFound = true;
            }
            console.log('Final Table Data:', this.cashPurchaseData);
          },
          error: (error: any) => {
            console.error('Error fetching PO list:', error);
            this._loading._loading.next(false);
            this.cashPurchaseData = [];
            this.isNotFound = true;
          },
        });
      } catch (ex) {
        console.error('Exception in getPurchaseOrderList:', ex);
        this._loading._loading.next(false);
        this.cashPurchaseData = [];
        this.isNotFound = true;
      }
    }
  
    search() {
      const formValue = this.searchForm.value;
  
      this.objSearch.sourceNum = Array.isArray(formValue.recSourceNum)
        ? formValue.recSourceNum.join(',')
        : formValue.recSourceNum || '';
  
      this.objSearch.vendorId = formValue.vendorId || '';
  
      this.objSearch.itemTypeId = formValue.itemTypeId || '';
  
      if (this.dateValidation()) {
        this.objSearch.PageNo = 1;
        this.getCashPurchaseSearchList();
      }
    }
  
    dateValidation(): boolean {
      if (!this.objSearch.FromDate || !this.objSearch.ToDate) return true;
  
      const to = moment(
        moment(this.objSearch.ToDate).format('YYYY-MM-DD'),
      ).isSameOrAfter(moment(this.objSearch.FromDate).format('YYYY-MM-DD'));
      return to;
    }
  
    add(data: boolean) {
      this.isAddEdit = data;
      this.rec_id = 0;
    }
  
    editAssetId(id: any) {
      const asset = this.assets.filter((x) => x.assetNo == id);
      if (asset.length > 0) {
        this.rec_id = asset[0].id;
      } else {
        this.rec_id = parseInt(id);
      }
      this.isAddEdit = true;
    }
  
    addEditMessage(status: number) {
      if (status > 0) {
        this.isAddEdit = false;
        this.getCashPurchaseSearchList();
      }
    }
  
    pageChanged(obj: any) {
      this.objSearch.PageSize = obj.pageSize;
      this.objSearch.PageNo = obj.pageIndex;
      this.getCashPurchaseSearchList();
    }
  
    reset() {
      this.objSearch = {
        PageNo: 1,
        PageSize: 10,
        TotalRecords: 0,
        sourceType: '',
        sourceNum: '',
        transactionType: null,
        transactionDate: null,
        referenceId: null,
        invoiceNumber: '',
        vendorName: null,
        vendorId: null,
        itemTypeId: null,
        categoryId: null,
        itemId: null,
        uomId: null,
        batchNumber: '',
        quantity: null,
        unitCost: null,
        lineCost: null,
        isSerialized: null,
        serialNumber: '',
        manufactureDate: null,
        make: '',
        warrantyDate: null,
        locationId: null,
        remarks: '',
        workOrderNumber: '',
        createdUserId: null,
        createdDateTime: null,
        updatedUserId: '',
        updatedDateTime: null,
        FromDate: '',
        ToDate: '',
      };
      this.commonService.setFilterObject(
        Constants.CASH_PURCHASE_LIST_FILTER_OBJECT,
        this.objSearch,
      );
    }
  
    export() {
      if (this.dateValidation()) {
        const request: ICommonRequest = {} as ICommonRequest;
  
        const reqdata: IRequest[] = [
          {
            key: 'SourceNum',
            value: this.objSearch.sourceNum
              ? String(this.objSearch.sourceNum)
              : '',
          },
          {
            key: 'VendorId',
            value: this.objSearch.vendorId ? String(this.objSearch.vendorId) : '',
          },
          {
            key: 'ItemType',
            value: this.objSearch.itemTypeId
              ? String(this.objSearch.itemTypeId)
              : '',
          },
          {
            key: 'DateFrom',
            value: this.objSearch.FromDate ? String(this.objSearch.FromDate) : '',
          },
          {
            key: 'DateTo',
            value: this.objSearch.ToDate ? String(this.objSearch.ToDate) : '',
          },
          { key: 'PageNo', value: String(this.objSearch.PageNo) },
          { key: 'PageSize', value: String(this.objSearch.PageSize) },
          { key: 'Pagenation', value: '1' },
        ];
  
        request.Params = reqdata;
  
        this.inventoryService
          .getCashPurchaseSearchList(request)
          .subscribe((res) => {
            if (res && res.results) {
              const assets = res.results;
  
              const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(assets);
              const wb: XLSX.WorkBook = XLSX.utils.book_new();
  
              XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
              XLSX.writeFile(
                wb,
                'CP_' + moment().format('DD-MM-YYYY_HH-mm') + '.xlsx',
              );
            }
          });
      }
    }
    refreshTableData(e: any) {
      this.getCashPurchaseSearchList();
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
  
    viewPopup(rowData: any): void {
      // Extract ID properly - handle object IDs
      let id = null;
  
      if (typeof rowData === 'number' || typeof rowData === 'string') {
        id = parseInt(rowData.toString());
      } else if (rowData?.rec_id) {
        id =
          typeof rowData.rec_id === 'object'
            ? rowData.rec_id.id || rowData.rec_id.rec_id || rowData.rec_id.value
            : rowData.rec_id;
      } else if (rowData?.id) {
        id =
          typeof rowData.id === 'object'
            ? rowData.id.id || rowData.id.rec_id || rowData.id.value
            : rowData.id;
      }
  
      // Convert to number
      id = parseInt(id);
  
      if (!id || id === 0 || isNaN(id)) {
        console.error('Invalid ID:', rowData);
        this.snackBar.open('Invalid data for view operation', 'Close', {
          duration: 3000,
        });
        return;
      }
  
      this._loading._loading.next(true);
  
      const request = {
        Params: [
          {
            Key: 'rec_id',
            Value: id.toString(),
          },
        ],
      };
  
      this.inventoryService.getCashPurchaseById(request).subscribe({
        next: (response: any) => {
          this._loading._loading.next(false);
  
          this.dialog.open(DynamicViewDialogComponent, {
            width: '90vw',
            maxWidth: '1200px',
            data: {
              title: 'Cash Purchase',
              data: response,
            },
          });
        },
        error: (error) => {
          this._loading._loading.next(false);
          console.error('Error loading CP details:', error);
          this.snackBar.open('Error loading details', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }
  


