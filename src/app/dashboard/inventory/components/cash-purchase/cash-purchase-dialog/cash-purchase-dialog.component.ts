import { Component, OnInit, Inject, ViewChild, AfterViewInit, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssetService } from '@dashboard/config-assets/services/asset.service';
import { ICommonRequest, IRequest } from '@shared/models/common-request';
import { IGetSearchRequest } from '@shared/models/request';
import { Column, IDropdown, ITreeResponse } from '@shared/models';
import { IAssetType, IAssetTypeSearchList } from '@dashboard/config-assets/models/asset-types/asset-type';
import { LoadingService } from '@shared/services/spinner.service';
import { Router } from '@angular/router';
import { AssetRemoveComponent } from '@dashboard/asset-registry/components/cars/remove/remove.component';
import { IAssetDetails, IAssetReg, IAssetSearchList } from '@dashboard/asset-registry/models/assets';
import { IFormCheck } from '@shared/models/role-check';
import { CommonService } from '@shared/services/common.service';
import * as moment from 'moment';
import { ILoginResponse, ILoginData } from '@auth/models/login.response';
import { IOEM } from '@dashboard/asset-registry/models/oem';
import { IAssetCategories, IAssetStatus } from '@dashboard/config-assets/models/asset-categories';
import { UnitService } from '@dashboard/configuration/services/unit.service';
import { ICorridor } from '@dashboard/planning-scheduling/permit-to-work/models/corridor';
import { IVendor } from '@dashboard/planning-scheduling/permit-to-work/models/vendor';
import { PermittoWorkService } from '@dashboard/planning-scheduling/permit-to-work/services/permit-to-work.service';
import { IStation } from '@shared/models/station';
import { IZone } from '@shared/models/zone';
import { Constants } from 'src/app/core/http/constant';
import { FormArray, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { serialize } from 'v8';


@Component({
  selector: 'app-cash-purchase-dialog',
  templateUrl: './cash-purchase-dialog.component.html',
  styleUrls: ['./cash-purchase-dialog.component.scss']
})
export class CashPurchaseDialogComponent implements OnInit {
  displayedColumns: string[] = ['item',  'make', 'oemSerialNo','modelNum'];
    agencyNames: IVendor[] = [];
    serialList: any[] = [];
    isAddEdit: boolean = false;
    cashPurchaseForm!: FormGroup;
    assetId = 0;
    dataSource = new MatTableDataSource<any>();
    categoryId = 0;
    assetCategories: IAssetCategories[] = [];
    assetStatuses: IAssetStatus[] = [];
    assetsSearch: IAssetSearchList = {} as IAssetSearchList;
    dropLabel = 'Category';
    UserInfo:ILoginResponse = {} as ILoginResponse;
    userRoleId!: string;
    items: IDropdown[] = [];
    isNotFound = false;
    showFilter = false;
    objSearch = {
      CategoryId: '',
      AssetName: '',
      AssetNo: '',
      Status: '',
      Linear:'',
      PageNo: 1,
      PageSize: 10,
      TotalRecords: 0,
      Station:'',
      Participation: '',
      Corridor:'',
      Stage:'',
      Location:'',
      TopAssetNo: '',
      Description: '',
      IntegrationAssetNo: '',
      Make: ''
    }
    stations: IStation[] =[];
    objForm: IFormCheck = {} as IFormCheck;
    oems: IOEM[] = [];
    LoginUserInfo: ILoginData = {} as ILoginData;
 tableColumns: Array<Column> = [
  {
    columnDef: 'index',
    header: 'No',
    cell: () => ''
  },
  {
    columnDef: 'item',
    header: 'Item',
    isEditLink: true,
    cell: (element: any) => element.item
  },
  {
    columnDef: 'make',
    header: 'Make',
    isInput: true,
    //inputType: 'text',
    cell: (element: any) => element.make
  },
  {
    columnDef: 'serialNum',
    header: 'Serial Num',
    isInput: true,
    inputType: 'text',
    cell: (element: any) => element.serialNum
  },
  {
    columnDef: 'modelNum',
    header: 'Model Num',
    isInput: true,   
    inputType: 'text',
    cell: (element: any) => element.modelNum
  }
];

    
    corridors: ICorridor[] = [];
  service: any;
  dataList: any;
  assets: any[] = [];
  
  
    constructor(private assetService: AssetService, private snackBar: MatSnackBar, private unitService: UnitService, @Inject(MAT_DIALOG_DATA) public dialogData: any,
       private dialog: MatDialogRef<CashPurchaseDialogComponent>,private commonService: CommonService, private _loading: LoadingService,private cdr: ChangeDetectorRef,private permitService: PermittoWorkService,
      ) {}
  
  ngOnInit(){
  if (this.dialogData) {
    const quantity = Number(this.dialogData.quantity);
    const itemName = this.dialogData.itemName;

    // Create an array with the required number of rows
    const tempArray = Array.from({ length: quantity }, (_, i) => ({
      index: i + 1,
      item: itemName,
      make: '',
      oemSerialNo: '',
      modelNum: ''
    }));

    // Assign to the table's data source
    this.dataSource.data = tempArray;
  }
    this.getVendorsList();
    this.getFormPriviliges();
    // this.generateRows(selectedQty, selectedItem);

  
}

generateRows(quantity: number, itemName: string) {

  let rows: any[] = [];

  for (let i = 1; i <= quantity; i++) {
    rows.push({
      index: i,
      item: itemName,
      make: '',
      oemSerialNo: '',
      modelNum: ''
    });
  }

  this.dataSource.data = rows;
}


    pageLoad() {
      if(this.commonService.filterObjects[Constants.ASSETS_LIST_FILTER_OBJECT]){
        this.objSearch = this.commonService.filterObjects[Constants.ASSETS_LIST_FILTER_OBJECT];
      }
      this.LoginUserInfo = this.commonService.loginStorageData;
      if(this.LoginUserInfo.loginData.assetCategoryId > 0) {
        this.objSearch.CategoryId = this.LoginUserInfo.loginData.assetCategoryId.toString();
      }
      this.getAssetCategories();
      this.getAssetStatus();
      this.getStations();
      //this.getAssetRegistryList();
  
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
        
      }
    },
    error: (err) => {
      console.error('Privilege API error', err);
    }
  });

}
    getAssetCategories() {
      let request: ICommonRequest = {} as ICommonRequest;
      const reqdata: IRequest[] = [
          {
            key: 'name', value: ''
          },
          {
            key: 'id', value: ''
          }
        ]
        request.Params = reqdata;
          this.assetService.getAssetCategories(request).subscribe((res) => {
          this.assetCategories = res;
          this.items = this.assetCategories.map( x => ({ code: x.assetCategoryId.toString(), value: x.assetCategoryCode }));
      });
  }
  getAssetStatus() {
    let request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
        {
          key: 'name', value: ''
        }
      ]
      request.Params = reqdata;
        this.assetService.getAssetStatusTypes(request).subscribe((res) => {
        this.assetStatuses = res;
    });
  }
  

  
    search() {
      this.objSearch.PageNo = 1;
      this.objSearch.PageSize = this.objSearch.PageSize;
      
    }
  
    add(data: boolean) {
      this.isAddEdit = data;
      this.assetId = 0;
      //this.getAssetRegistryList();
    }

    editAssetId(id: any) {
      const asset = this.assets.filter(x=>x.assetNo == id);
      if(asset.length > 0) {
        this.assetId = asset[0].id;
      } else {
        this.assetId = parseInt(id);
      }
      this.isAddEdit = true;
    }
  
    addEditMessage(status: number) {
      if(status > 0) {
        this.isAddEdit = false;
        
      }
    }
  
    pageChanged(obj: any) {
      this.objSearch.PageSize =  obj.pageSize;
      this.objSearch.PageNo = obj.pageIndex;
      
    }
  
    reset() {
      this.objSearch = {
        CategoryId: this.UserInfo.assetCategoryId > 0 ? this.UserInfo.assetCategoryId.toString() :  '',
        AssetName: '',
        Status:'',
        AssetNo: '',
        Linear: '',
        PageNo: 1,
        PageSize: 10,
        TotalRecords: 0,
        Station: '',
        Participation: '',
        Corridor:'',
        Stage:'',
        Location:'',
        TopAssetNo: '',
        Description: '',
        Make: '',
        IntegrationAssetNo: ''
      }
      this.commonService.setFilterObject(Constants.ASSETS_LIST_FILTER_OBJECT, this.objSearch);
    }
  
    export() {
    }
  
    getStations() {
      const request: ICommonRequest = {} as ICommonRequest;
      const reqdata: IRequest[] = [
          {key: 'Name', value: ''}
      ]
      request.Params = reqdata;
      this.commonService.getStations(request).subscribe(res=>{
        this.stations =res;
      })
    }
  
    refreshTableData(e: any) {
      
    }
    getVendorsList() {
    this.permitService.getVendorList().subscribe((res) => {
      this.agencyNames = res;
    });
  }
     close() {
      this.dialog.close();
    }
    get assetsArray(): FormArray {
  return this.cashPurchaseForm.get('assets') as FormArray;
}



save() {

  const invalidRows = this.dataSource.data.some(
    row => !row.make?.trim() ||
           !row.oemSerialNo?.trim() ||
           !row.modelNum?.trim()
  );

  if (invalidRows) {
    this.snackBar.open(
      'Please fill all required fields in the table',
      'Close',
      { duration: 3000 }
    );
    return;
  }

  //  Match backend property names EXACTLY
  const formattedSerials = this.dataSource.data.map(row => ({
    rec_serial_no: row.oemSerialNo,
    rec_make: row.make,
    rec_model: row.modelNum,
    rec_mfg_date: row.mfgDate ? new Date(row.mfgDate) : null,
    rec_warrenty_date: row.warrentyDate ? new Date(row.warrentyDate) : null
  }));

  console.log("Popup Returning =>", formattedSerials);

  this.dialog.close(formattedSerials);
}
}