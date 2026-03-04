import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';;
import { Observable } from 'rxjs';
import { HttpApi } from 'src/app/core/http/http-api';
import { IUnit } from 'src/app/dashboard/configuration/models/units/unit';
import { IDesignation } from 'src/app/dashboard/configuration-setup/models/designation/designation';
import { ITreeResponse } from '../models/tree-view.response';
import { ITreeRequest } from '../models/tree-view.request';
import { IGetSearchRequest } from '../models/request';
import { ICommonRequest, IRequest } from '../models/common-request';
import { IChangePwd } from '@shared/components/change-pwd/c-pwd';
import { IZone } from '@shared/models/zone';
import { IGetAddEditResponse, ILookupValue } from '..';
import { IFormCheck } from '@shared/models/role-check';
import { ILoginData, ILoginResponse } from '@auth/models/login.response';
import { IStation } from '@shared/models/station';
import { IAssetChange } from '@shared/models/asset-change';
import { ITool } from '@dashboard/configuration-maintenance/models/tool';
import { IAddEditStaffQualification, IQualification, ISearchStaffQualification, IStaffQualification } from '@dashboard/configuration/models/staff-qualification/staff-qualification';
import { error } from 'console';
import { IFeedback } from '@shared/models/feedback';
import { ICorridor } from '@dashboard/planning-scheduling/permit-to-work/models/corridor';
import { IPWDExclusion } from '@shared/models/pwd-exclusion';
import { AbstractControl, FormArray, FormGroup, ValidatorFn } from '@angular/forms';
import { IForm, IModule } from '@shared/models/module-form';
import * as moment from 'moment';
import * as XLSX from 'xlsx';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public filterObjects:any = {};
  currentFilterItemOptions!: { currentFilter$: (request: ICommonRequest) => Observable<any>;
    options: ICommonRequest, type: string, ctx?: any, http?: any, currentItem:any, pageItems?: any[]
    pageOptions?: any
  };
  currentFilterItemDetailOptions!: { currentFilter$: (request: ICommonRequest) => Observable<any>;
    options: ICommonRequest,  type: string, http?: any, pageItems?: any[]
  };
  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  getUnits(request: IGetSearchRequest): Observable<IUnit[]> {
    return this.http.post<IUnit[]>(HttpApi.getUnits, request);
  }

  searchGlobal(request: any): Observable<any> {
    return this.http.post<any>(HttpApi.searchGlobal, request);
  }

  notifications(request: ICommonRequest): Observable<any> {
    return this.http.post<any>(HttpApi.getNotifications, request);
  }

  getStatuses(request: IGetSearchRequest): Observable<ILookupValue[]> {
    return this.http.post<ILookupValue[]>(HttpApi.statuses, request);
  }


  getDesignations(request: IGetSearchRequest): Observable<IDesignation[]> {
    return this.http.post<IDesignation[]>(HttpApi.getDesignations, request);
  }

  getStations(request: ICommonRequest): Observable<IStation[]> {
    return this.http.post<IStation[]>(HttpApi.getStations, request);
  }

  getroles_tree(request: ITreeRequest): Observable<ITreeResponse> {
    return this.http.post<ITreeResponse>(HttpApi.getroleTreeData, request);
  }

  getunits_tree(request: ITreeRequest): Observable<ITreeResponse> {
    return this.http.post<ITreeResponse>(HttpApi.getUnitTreeData, request);
  }


  getLookupData(request: ICommonRequest): Observable<any> {
    return this.http.post<any>(HttpApi.getLookupList, request);
  }

  passwordChange(request: IChangePwd): Observable<any> {
    return this.http.post<any>(HttpApi.passwordChange, request);
  }

  restPasswordChange(request: IChangePwd): Observable<any> {
    return this.http.post<any>(HttpApi.restPasswordChange, request);
  }

  addUpdateFeedback(request: IFeedback): Observable<any> {
    return this.http.post<any>(HttpApi.addUpdateFeedback, request);
  }

  searchFeedbacks(request: ICommonRequest): Observable<any> {
    return this.http.post<any>(HttpApi.searchFeedback, request);
  }

  getFeedbackItems(request: ICommonRequest): Observable<any> {
    return this.http.post<any>(HttpApi.addUpdateFeedback, request);
  }

  getFeedbackDetails(request: ICommonRequest): Observable<any> {
    return this.http.post<any>(HttpApi.getFeedbackDetails, request);
  }

  assetLocationChange(request: IAssetChange): Observable<IGetAddEditResponse> {
    return this.http.post<IGetAddEditResponse>(HttpApi.assetLocationChange, request);
  }

  zones(request: ICommonRequest): Observable<IZone[]> {
    return this.http.post<IZone[]>(HttpApi.zones, request);
  }

  getToolsList(request: ICommonRequest): Observable<ITool[]> {
    return this.http.post<ITool[]>(HttpApi.getToolsList, request);
  }

  getQualificationList(request: ICommonRequest): Observable<IQualification[]> {
    return this.http.post<IQualification[]>(HttpApi.getQualificationList, request);
  }
  searchStaffQualification(request: ICommonRequest): Observable<ISearchStaffQualification> {
    return this.http.post<ISearchStaffQualification>(HttpApi.searchStaffQualification, request);
  }

  getStaffQualificationDetails(request: ICommonRequest): Observable<IAddEditStaffQualification> {
    return this.http.post<IAddEditStaffQualification>(HttpApi.getStaffQualificationDetails, request);
  }

  addEdiStaffQualifications(request: IAddEditStaffQualification): Observable<IGetAddEditResponse> {
    return this.http.post<IGetAddEditResponse>(HttpApi.addEdiStaffQualifications, request);
  }

  getCorridors(): Observable<ICorridor[]> {
    return this.http.post<ICorridor[]>(HttpApi.getCorridorList, {});
  }

  getPwdExceptionList(): Observable<IPWDExclusion> {
    return this.http.post<IPWDExclusion>(HttpApi.getPwdExceptionList, {});
  }

  getFormPriviligesData(request: ICommonRequest): Observable<IFormCheck[]> {
    const UserInfo = this.loginStorageData;
    request.Params.push(
        { key: 'RoleId', value: UserInfo.userRoleId.toString() },
        { key: 'UserId', value: UserInfo.loginData.id.toString()}
        )
    return this.http.post<IFormCheck[]>(HttpApi.getFormPriviliges, request);
  }



  public get loginStorageData() {
    const userData = sessionStorage.getItem('sessionData');
    const roleMenu = sessionStorage.getItem('roleMenu');
    const login: ILoginData = {} as ILoginData;
    if (userData) {
      const UserInfo = JSON.parse(atob(userData));
      login.loginData = UserInfo;
    }
    if (roleMenu) {
      const userRoleId = JSON.parse(atob(roleMenu))?.roleId?.replace(
        /[" ]+/g,
        ''
      );
      const unitAccessScopes = JSON.parse(atob(roleMenu))?.unitAccessScopes?.trim();
      login.userRoleId= userRoleId;
      login.loginData.unitAccessScopes = unitAccessScopes;
    }

    return login;
  }

  public getContextCode(): string {
    let contextCode = '';
    try {
      const data = sessionStorage.getItem('modulesData');
      if(data) {
        const objData: IModule[] = JSON.parse(atob(data));
        if(objData.length > 0) {
          const formUrl = this.router.url.replace('/dashboard/','');
          const moduleState = this.router.url.replace('/dashboard/','').split('/')[0];
          const moduleName = objData.find(x=>x.state === moduleState)?.name;
          let formsData:IForm[] = JSON.parse(objData.find(x=>x.name === moduleName)?.forms!);
          contextCode = objData.find(x=>x.state === moduleState)?.name + '-' +  formsData.find(x=>x.state === formUrl)?.name;
        }
      }
      return contextCode;
    } catch (error) {
      return contextCode;
    }
  }

  public get  getFormPriviliges() {
    const userData = sessionStorage.getItem('sessionData');
    const roleMenu = sessionStorage.getItem('roleMenu');
    let objForm: IFormCheck = {} as IFormCheck;
    let userRoleId;
    let UserInfo: any;
    if (roleMenu) {
      userRoleId = JSON.parse(atob(roleMenu))?.roleId?.replace(
        /[" ]+/g,
        ''
      );
    }
    if (userData) {
      UserInfo = JSON.parse(atob(userData));
    }
    const currentUrl: any = this.router.url.replace('/dashboard/','').split('/');
    let request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
        { key: 'Module', value: currentUrl[0]?.toString() },
        { key: 'Menu', value: currentUrl[1]?.toString() },
        { key: 'RoleId', value: userRoleId?.toString() },
        { key: 'UserId', value: UserInfo?.id?.toString() },
      ]
      request.Params = reqdata;
      let observable = this.http.post<IFormCheck[]>(HttpApi.getFormPriviliges, request);
      observable.subscribe(x =>
        {
          objForm =  x[0];
        }, (error: any) =>{
          return null;
        });
        return observable;
  }

  getFilterObject(key: string, filterOptions: any = null) {
    let filterObject = this.filterObjects[key] || (sessionStorage.getItem('FILTER_OBJECTS') ? JSON.parse(<any>sessionStorage.getItem('FILTER_OBJECTS'))[key] : {})
    if (filterObject && filterOptions) {
     // filterOptions = filterObject;
      Object.assign(filterOptions, filterObject)
    }
    return filterObject;
  }

  setFilterObject(key: string, obj: any) {
    this.filterObjects[key] = { ...obj };
    sessionStorage.setItem('FILTER_OBJECTS', JSON.stringify(this.filterObjects));
  }


  setCurrentPageOptions(context: any, items:any[], pageNo: number, type: string){
    if(!this.currentFilterItemOptions){
      this.currentFilterItemOptions = <any>{};
    }
    this.currentFilterItemOptions.ctx = context;
    this.currentFilterItemOptions.type = type;
    this.currentFilterItemOptions.pageOptions = {};
    this.currentFilterItemOptions.pageOptions.pageItems = items
    this.currentFilterItemOptions.pageOptions.isVisible = true;
    this.currentFilterItemOptions.pageOptions.currentItem = context.row;
    let itemIndex = items.indexOf(context.row)
    this.currentFilterItemOptions.pageOptions.itemIndex = itemIndex+1;
    this.currentFilterItemOptions.pageOptions.pageSize = this.currentFilterItemOptions.pageOptions.pageItems.length;
    this.currentFilterItemOptions.pageOptions.currentPage = pageNo;
  }

  updatePageOptions(obj: any, type: string, pageOptions?: any){
    if(obj){
      // this.currentFilterItemDetailOptions = {  ...this.currentFilterItemDetailOptions, };
      if(this.currentFilterItemOptions && this.currentFilterItemOptions.type != type){
        this.currentFilterItemOptions.type = type;
        this.currentFilterItemOptions.ctx = null;
        this.currentFilterItemOptions.pageOptions = null;
        //this.commonService.currentFilterItemDetailOptions = <any>null;
      } else {
        this.currentFilterItemOptions = {  ...this.currentFilterItemOptions,  ...obj};
      if(this.currentFilterItemOptions.pageOptions){
        this.currentFilterItemOptions.pageOptions = { ... this.currentFilterItemOptions.pageOptions, ... pageOptions};
        this.currentFilterItemOptions.pageOptions.pageSize =  this.currentFilterItemOptions.pageItems?.length;
      }
      }
    }
  }

  enableAllControls(formGroup: FormGroup) {

     if(!formGroup || !formGroup.controls) return;
    // Iterate through all controls in the form group
    Object.values(formGroup.controls).forEach(control => {
      // If the control is a FormGroup or FormArray, recursively enable its controls
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.enableControls(control);
      } else {
        // If the control is a FormControl, enable it
        control.enable();
      }
    });
  }

  enableControls(group: FormGroup | FormArray) {
    Object.values(group.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.enableControls(control);
      } else {
        control.enable();
      }
    });
  }

  assignObjectWithCaseInsensitiveKeys(obj:any, keyValues:any) {
    const result:any = {};
    // Copy obj to result without changing the case of keys
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = obj[key];
      }
    }
    // Assign keyValues to result, converting keys to lowercase
    for (const key in keyValues) {
      if (Object.prototype.hasOwnProperty.call(keyValues, key)) {
        result[key.toLowerCase()] = keyValues[key];
      }
    }
    return result;
  }

  markAllAsDirty(form: FormGroup) {
    this.markGroupAsDirty(form);
  }

  // Recursive method to mark all controls as dirty
  private markGroupAsDirty(group: FormGroup) {
    Object.keys(group.controls).forEach((key) => {
      const control = group.controls[key];
      control.markAsDirty();
      if (control instanceof FormGroup) {
        this.markGroupAsDirty(control);
      }
    });
  }

  isValueWithinRange(min: number, max: number, value: any, inclusive: boolean = true):any {


      if (value == null || value === '') {
        return <any>null;
      }

      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        return <any>null;
      }

      if (inclusive) {
        if (numValue < min || numValue > max) {
          return { outOfRange: { min, max, actual: numValue, msg: `Value must be between ${min} and ${max}` } };
        }
      } else {
        if (numValue <= min || numValue >= max) {
          return { outOfRange: { min, max, actual: numValue, msg: `Value must be between ${min} and ${max}` } };
        }
      }

      return <any>null;
    };

  getPageOptionsWithTotalSize(count: number){
    if (count > 100) {
        if (count - 100 > 100) {
          return [10, 20, 50, 75, 100, count];
        } else if (count - 100 < 100 && count - 100 > 0) {
          return [10, 20, 50, 75, count];
        }
      }
      return [10, 20, 50, 75, 100];
  }

  exportData(list:any[] | any, name: string = '') {

    if(list) {
    const items = Array.isArray(list) ? list : JSON.parse(list.results.toString());
    const ws: XLSX.WorkSheet=XLSX.utils.json_to_sheet(items);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws,'Sheet1' );
    /* save to file */
    XLSX.writeFile(wb, name+'_' + moment().format("DD-MM-YYYY HH:mm") +'.xlsx');

    }
  }

  roundOffNumbers(array:any[]){

    if(!array || !array.length){
      return array;
    }

  const roundedDataArray = array.map(item => {
    const roundedItem = { ...item }; // Create a shallow copy of the item

    Object.keys(roundedItem).forEach(key => {
      if (typeof roundedItem[key] === 'number') {
        roundedItem[key] = parseFloat(roundedItem[key].toFixed(2)); // Round to 2 decimal places
      }
    });

    return roundedItem; // Return the modified item
  });
  return roundedDataArray;
}

requiredIf(condition: boolean): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (condition) {
      return control.value ? null : { requiredIf: true };
    }
    return null;
  };
}
}
