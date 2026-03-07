import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ILoginResponse, ILoginData } from '@auth/models/login.response';
import { IAssetReg, IAssetSearchList } from '@dashboard/asset-registry/models/assets';
import { IOEM } from '@dashboard/asset-registry/models/oem';
import { IAssetCategories, IAssetStatus } from '@dashboard/config-assets/models/asset-categories';
import { AssetService } from '@dashboard/config-assets/services/asset.service';
import { UnitService } from '@dashboard/configuration/services/unit.service';
import { ICorridor } from '@dashboard/planning-scheduling/permit-to-work/models/corridor';
import { IDropdown, Column, ICommonRequest, IRequest } from '@shared/models';
import { IFormCheck } from '@shared/models/role-check';
import { IStation } from '@shared/models/station';
import { IZone } from '@shared/models/zone';
import { CommonService } from '@shared/services/common.service';
import { LoadingService } from '@shared/services/spinner.service';
import * as moment from 'moment';
import { Constants } from 'src/app/core/http/constant';
import { HttpApi } from 'src/app/core/http/http-api';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-material-requisition',
  templateUrl: './material-requisition.component.html',
  styleUrls: ['./material-requisition.component.scss']
})
export class MaterialRequisitionComponent implements OnInit {

   assets: IAssetReg[] =[];
    rollName!: string;
    isAddEdit = false;
    assetId = 0;
    categoryId = 0;
    assetCategories: IAssetCategories[] = [];
    assetStatuses: IAssetStatus[] = [];
    assetsSearch: IAssetSearchList = {} as IAssetSearchList;
    priorityList = HttpApi.priorityData;
    statusList = HttpApi.workStatusData;
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
      Make: '',
      Priority: ''
    }
    stations: IStation[] =[];
    objForm: IFormCheck = {} as IFormCheck;
    oems: IOEM[] = [];
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
        cell: (element: Record<string, any>) => `${element['mrNum']}`
      },
      {
        columnDef: 'reqDept',
        header: 'Req Dept',
        cell: (element: Record<string, any>) => `${element['reqDept']}`
      },
      {
        columnDef: 'mrReqDate',
        header: 'MR Req Date',
        cell: (element: Record<string, any>) => `${element['mrReqDate']}`
      },
      {
        columnDef: 'priority',
        header: 'Priority',
        cell: (element: Record<string, any>) => `${element['priority']}`
      },
      {
        columnDef: 'requiredDate',
        header: 'Required Date',
        cell: (element: Record<string, any>) => `${element['requiredDate']}`
      },
      {
        columnDef: 'status',
        header: 'Status',
        cell: (element: Record<string, any>) => `${element['status']}`
      },
      {
        columnDef: 'location',
        header: 'Location',
        cell: (element: Record<string, any>) => `${element['location']}`
      },
      // {
      //   columnDef: 'quantity',
      //   header: 'Quantity',
      //   cell: (element: Record<string, any>) => `${element['quantity']}`
      // }, 
      {
        columnDef: 'actions',
        header: 'Actions',
        cell: (element: Record<string, number>) => `${element['id']}`,
        isHistorybtn: true,
        isEditbtn: false,
        isAssetLocChange: true
      }
    ];
    zones: IZone[] = [];
    corridors: ICorridor[] = [];
  service: any;
  dataList: any;
    constructor(private assetService: AssetService, private snackBar: MatSnackBar, private unitService: UnitService,
      private commonService: CommonService, private _loading: LoadingService
      ) {}
  
  ngOnInit(): void {
  if (this.commonService.getFormPriviliges) {
    this.getFormPriviliges();
  }
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
      this.getZones();
      this.getCorridors();
      this.getOEMSList();
      //this.getAssetRegistryList();
  
      this.userRoleId = this.LoginUserInfo.userRoleId;
    }
  
    getOEMSList() {
      try {
        this.oems = [];
        const request: ICommonRequest = {} as ICommonRequest;
        let param: IRequest[] = [{
          key: 'OEMName', value: ''
        }];
        request.Params = param;
        this.assetService.getOems(request).subscribe((res) => {
          this.oems = res;
        });
      } catch (error) {
  
      }
    }
  
    getCorridors() {
      this.commonService.getCorridors().subscribe((res: any) => {
        if (res && res.length)
          this.corridors = res;
      })
    }
  
    getZones() {
      this.commonService.zones({} as ICommonRequest).subscribe((res: any) => {
        if (res && res.length)
          this.zones = res;
      })
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
        this.getAssetRegistryList();
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
  
    getAssetRegistryList() {
      this._loading._loading.next(true);
      this.assets = [];
      this.isNotFound = false;
      const request: ICommonRequest = {} as ICommonRequest;
      const reqdata: IRequest[] = [
        { key: 'Category', value: this.objSearch.CategoryId  ? this.objSearch.CategoryId : '0' },
        { key: 'AssetName', value: this.objSearch.AssetName  ? this.objSearch.AssetName.trim().toString() : '' },
         { key: 'Description', value: this.objSearch.Description  ? this.objSearch.Description.toString() : '' },
        { key: 'AssetNo', value: this.objSearch.AssetNo  ? this.objSearch.AssetNo.trim().toString() : '' },
        { key: 'PageNo', value: this.objSearch.PageNo  ? this.objSearch.PageNo.toString() : '' },
        { key: 'PageSize', value: this.objSearch.PageSize  ? this.objSearch.PageSize.toString() : '' },
        { key: 'Status', value: this.objSearch.Status  ? this.objSearch.Status.toString() : '' },
        { key: 'Linear', value: this.objSearch.Linear  ? this.objSearch.Linear.toString() : '' },
        { key: 'Pagenation', value: '1' },
        {key:'Station', value: this.objSearch.Station ? this.objSearch.Station.toString() : ''},
        {key: "Participation", value: this.objSearch.Participation ? this.objSearch.Participation.toString() : ''},
        {key: "Stage", value: this.objSearch.Stage ? this.objSearch.Stage: ''},
        {key: "Corridor", value: this.objSearch.Corridor ? this.objSearch.Corridor: ''},
        {key: "Location", value: this.objSearch.Location ? this.objSearch.Location: ''},
        {key: "Make", value: this.objSearch.Make ? this.objSearch.Make?.toString(): ''},
        {key: "IntegrationAssetNo", value: this.objSearch.IntegrationAssetNo ? this.objSearch.IntegrationAssetNo: ''},
        {key: "RootAssetNo", value: this.objSearch.TopAssetNo ? this.objSearch.TopAssetNo.toString(): ''}
        
  
      ]
      request.Params = reqdata;
      this.commonService.setFilterObject(Constants.ASSETS_LIST_FILTER_OBJECT,this.objSearch);
      try {
        this.assetService.getAssetRegistrySearchList(request).subscribe((res) =>{
          if(res) {
            this._loading._loading.next(false);
            this.assetsSearch = res;
            //this.objSearch.TotalRecords = this.assetsSearch.totalRows;
            this.objSearch.TotalRecords = this.assetsSearch.totalRows > 0 ? this.assetsSearch.totalRows : this.objSearch.TotalRecords;
            if(this.assetsSearch.results) {
              this.assets = JSON.parse(this.assetsSearch.results.toString());
            } else {
              this.assets = [];
              this.isNotFound = true;
            }
          } else {
            this._loading._loading.next(false);
            this.assets = [];
            this.isNotFound = true;
          }
        });
      } catch(ex) {
        this._loading._loading.next(false);
        this.assets = [];
        this.isNotFound = true;
      }
    }
  
    search() {
      this.objSearch.PageNo = 1;
      this.objSearch.PageSize = this.objSearch.PageSize;
      this.getAssetRegistryList();
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
        this.getAssetRegistryList();
      }
    }
  
    pageChanged(obj: any) {
      this.objSearch.PageSize =  obj.pageSize;
      this.objSearch.PageNo = obj.pageIndex;
      this.getAssetRegistryList();
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
        IntegrationAssetNo: '',
        Priority: '',
      }
      this.commonService.setFilterObject(Constants.ASSETS_LIST_FILTER_OBJECT, this.objSearch);
    }
  
    export() {
      const request: ICommonRequest = {} as ICommonRequest;
      const reqdata: IRequest[] = [
        { key: 'Category', value: this.objSearch.CategoryId  ? this.objSearch.CategoryId : '0' },
        { key: 'AssetName', value: this.objSearch.AssetName  ? this.objSearch.AssetName.trim().toString() : '' },
         { key: 'Description', value: this.objSearch.Description  ? this.objSearch.Description.toString() : '' },
        { key: 'AssetNo', value: this.objSearch.AssetNo  ? this.objSearch.AssetNo.trim().toString() : '' },
        { key: 'PageNo', value: this.objSearch.PageNo  ? this.objSearch.PageNo.toString() : '' },
        { key: 'PageSize', value: this.objSearch.PageSize  ? this.objSearch.PageSize.toString() : '' },
        { key: 'Status', value: this.objSearch.Status  ? this.objSearch.Status.toString() : '' },
        { key: 'Linear', value: this.objSearch.Linear  ? this.objSearch.Linear.toString() : '' },
        { key: 'Pagenation', value: '0' },
        {key:'Station', value: this.objSearch.Station ? this.objSearch.Station.toString() : ''},
        {key: "Participation", value: this.objSearch.Participation ? this.objSearch.Participation.toString() : ''},
        {key: "Stage", value: this.objSearch.Stage ? this.objSearch.Stage: ''},
        {key: "Corridor", value: this.objSearch.Corridor ? this.objSearch.Corridor: ''},
        {key: "Location", value: this.objSearch.Location ? this.objSearch.Location: ''},
        {key: "Make", value: this.objSearch.Make ? this.objSearch.Make?.toString(): ''},
        {key: "IntegrationAssetNo", value: this.objSearch.IntegrationAssetNo ? this.objSearch.IntegrationAssetNo: ''},
        {key: "RootAssetNo", value: this.objSearch.TopAssetNo ? this.objSearch.TopAssetNo.toString(): ''}
  
      ]
      request.Params = reqdata;
      try {
        this.assetService.getAssetRegistrySearchList(request).subscribe((res) =>{
          if(res) {
            const assetsSearch = res;
            if(assetsSearch.results) {
              const assets = JSON.parse(assetsSearch.results.toString());
              const ws: XLSX.WorkSheet=XLSX.utils.json_to_sheet(assets);
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
      this.getAssetRegistryList();
    }
  
}
