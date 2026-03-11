// In your inventory service
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICommonRequest, IRequest } from '@shared/models';
import {
  IItemType,
  ICategory,
  IItemTypeData,
  IPurchaseOrderDetailsResponse,
  IPurchaseOrderSearchList,
  IPurchaseOrderStatus,
  IPriority,
  ILocation,
} from '../models/purchase-order';
import { HttpApi } from 'src/app/core/http/http-api';
import {
  ICashPurchaseSearchList,
  ICPList,
  ICPNumList,
} from '@dashboard/inventory/models/cashpurchase';
import {
  IIssueNumberDropdown,
  IMaterialIssueDetailsResponse,
  IMaterialIssueSearchList,
  IMaterialIssueStatus,
  IDepartment,
  IIssueHeaderRequest,
  IIssueHeaderResponse,
} from '../models/material-issue';
import { IShipmentSearchList } from '../models/shipment';
import { IMaterialRequisitionSearchList, IMaterialRequisition, IMaterialRequisitionDetailsResponse, IMaterialRequisitionStatus } from '../models/material-requisition';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(private http: HttpClient) {}

  // In inventory.service.ts
  getItemTypes(): Observable<any> {
    return this.http.get(HttpApi.getItemTypes);
  }

  getCategories(): Observable<any> {
    return this.http.get(HttpApi.getAllCategories);
  }

  getItemsByCategoryAndType(request: any): Observable<any> {
    return this.http.post(HttpApi.getItemsByCategoryAndType, request);
  }

  getVendors(): Observable<any> {
    return this.http.get(HttpApi.getPOVendors);
  }

  // POST method for saving purchase order
  submitPurchaseOrder(data: any): Observable<any> {
    return this.http.post(HttpApi.savePurhaseOrder, data);
  }

  getPurchaseOrderDetails(request: {
    Params: { Key: string; Value: string }[];
  }): Observable<IPurchaseOrderDetailsResponse> {
    return this.http.post<IPurchaseOrderDetailsResponse>(
      HttpApi.getPurchaseOrderDetails,
      request,
    );
  }

  getAllPoList(): Observable<any> {
    return this.http.get<any>(HttpApi.getPoDetails);
  }
  getPurchaseOrderSearchList(
    request: ICommonRequest,
  ): Observable<IPurchaseOrderSearchList> {
    return this.http.post<IPurchaseOrderSearchList>(
      HttpApi.getPurchaseOrderSearchList,
      request,
    );
  }
  getPoStatus(): Observable<IPurchaseOrderStatus[]> {
    return this.http.get<IPurchaseOrderStatus[]>(
      HttpApi.getPurchaseOrderStatuses,
    );
  }
  getPriorities(): Observable<IPriority[]> {
    return this.http.get<IPriority[]>(HttpApi.getAllPriorities);
  }
  getLocations(): Observable<ILocation[]> {
    return this.http.get<ILocation[]>(HttpApi.getAllLocations);
  }

  //cash purches services

  getAllPriorities(request: ICommonRequest): Observable<any[]> {
    return this.http.post<any[]>(HttpApi.getAllPriorities, request);
  }

  // C A S H P U R C H A S E S E R V I C E S

  getCashPurchaseList(): Observable<ICPNumList[]> {
    return this.http.get<ICPNumList[]>(HttpApi.getCashPurchaseList);
  }
  getCashPurchaseById(request: {
    Params: { Key: string; Value: string }[];
  }): Observable<ICPList> {
    return this.http.post<ICPList>(HttpApi.getCashPurchaseById, request);
  }
  getCashPurchaseSearchList(
    request: ICommonRequest,
  ): Observable<ICashPurchaseSearchList> {
    return this.http.post<ICashPurchaseSearchList>(
      HttpApi.getCashPurchaseSearchList,
      request,
    );
  }

  saveCashPurchase(data: any): Observable<any> {
    return this.http.post(HttpApi.SaveCashPurchase, data);
  }

  updateCashPurchase(data: any): Observable<any> {
    return this.http.post(HttpApi.UpdateCashPurchase, data);
  }
   getMRNumbers():Observable<any>{
    return this.http.get(HttpApi.getMRNUmbers);
  }

  //material issue servicess




  // S H I P  M E N T S E R V I C E

  getShipmentSearchList(
    request: ICommonRequest,
  ): Observable<IShipmentSearchList> {
    return this.http.post<IShipmentSearchList>(
      HttpApi.getShipmentSearchList,
      request,
    );
  }

  addEditShipment(payload: any): Observable<any> {
    return this.http.post(HttpApi.addEditShipment, payload);
  }

  saveShipmentLineItems(payload: any): Observable<any> {
    return this.http.post(HttpApi.addShipmentLineItems, payload);
  }

  getPoListByShipmentApprovedOrNotComplete(): Observable<any> {
    return this.http.get<any>(HttpApi.getPoListByShipmentApprovedOrNotComplete);
  }
  getPoLineItemsByPOID(request: any): Observable<any> {
    return this.http.post(HttpApi.getPoLineItemsByPOID, request);
  }

  getShipmentById(request: any): Observable<any> {
    return this.http.post(HttpApi.getShipmentById, request);
  }

  // M A T E R I A L I S S U E


   getMrStatus(): Observable<IPurchaseOrderStatus[]> {
    return this.http.get<IPurchaseOrderStatus[]>(
      HttpApi.getPurchaseOrderStatuses,
    );
  }

  // In your inventory service
  getMINumbers(): Observable<IIssueNumberDropdown[]> {
    return this.http.get<IIssueNumberDropdown[]>(HttpApi.getMINumbers);
  }

  // getSectionList1(): Observable<any[]> {
  //   const request = {
  //     SearchByName: '',
  //     SearchByValue: '',
  //   };

  //   return this.http.post<any[]>(HttpApi.getSectionList, request);
  // }

  getSectionList(request: any): Observable<any[]> {
    return this.http.post<any[]>(HttpApi.getSectionList, request);
  }

  getAllIssueList(): Observable<IIssueNumberDropdown[]> {
    return this.http.get<IIssueNumberDropdown[]>(HttpApi.getAllIssueList);
  }

  // Get material issue details by ID
  // Get material issue details by ID
  getMaterialIssueDetails(
    request: ICommonRequest,
  ): Observable<IMaterialIssueDetailsResponse> {
    console.log('Service - getMaterialIssueDetails request:', request);

    // Convert ICommonRequest (lowercase) to API format (uppercase Key/Value)
    const apiRequest = {
      Params: request.Params.map((p) => ({
        Key: p.key,
        Value: p.value,
      })),
    };

    console.log('Service - API request:', apiRequest);

    return this.http.post<IMaterialIssueDetailsResponse>(
      HttpApi.getMaterialIssueDetails,
      apiRequest,
    );
  }

  // Search material issues with filters
  getMaterialIssueSearchList(
    request: ICommonRequest,
  ): Observable<IMaterialIssueSearchList> {
    return this.http.post<IMaterialIssueSearchList>(
      HttpApi.getMaterialIssueSearchList,
      request,
    );
  }

  // Get material issue statuses
  getMaterialIssueStatus(): Observable<IMaterialIssueStatus[]> {
    return this.http.get<IMaterialIssueStatus[]>(
      HttpApi.getMaterialIssueStatuses,
    );
  }

  // Get departments list
  getDepartmentsList(): Observable<IDepartment[]> {
    return this.http.get<IDepartment[]>(HttpApi.getDepartmentsList);
  }

  // Save new material issue
  saveMaterialIssue(data: any): Observable<any> {
    return this.http.post(HttpApi.saveMaterialIssue, data);
  }

  // Update existing material issue
  updateMaterialIssue(data: any): Observable<any> {
    return this.http.post(HttpApi.updateMaterialIssue, data);
  }

  // Delete material issue
  deleteMaterialIssue(issueId: number): Observable<any> {
    const request = {
      Params: [{ Key: 'IssueId', Value: issueId.toString() }],
    };
    return this.http.post(HttpApi.deleteMaterialIssue, request);
  }

  // Get items for material issue (similar to PO items)
  getItemsForMaterialIssue(request: any): Observable<any> {
    return this.http.post(HttpApi.getItemsForMaterialIssue, request);
  }

  // Get departments with filtering
  searchDepartments(request: ICommonRequest): Observable<IDepartment[]> {
    return this.http.post<IDepartment[]>(HttpApi.searchDepartments, request);
  }

  // Get issue types if applicable
  getIssueTypes(): Observable<any[]> {
    return this.http.get<any[]>(HttpApi.getIssueTypes);
  }

  //save header
  addIssueHeader(data: IIssueHeaderRequest): Observable<IIssueHeaderResponse> {
    return this.http.post<IIssueHeaderResponse>(HttpApi.addIssueHeader, data);
  }

  
  //Material Requisition Services
    materialRequisitionId!: number;

    getMaterialSearchList(request: ICommonRequest): Observable<IMaterialRequisitionSearchList> {
      return this.http.post<IMaterialRequisitionSearchList>(HttpApi.getMaterialRequisitionSearchList, request);
    }
    getAllMrList(): Observable<IMaterialRequisition[]> {
      return this.http.get<IMaterialRequisition[]>(HttpApi.getMRNumbers);
    }
      
       getMaterialRequisitionDetails(request: { Params: { Key: string; Value: string }[] }): Observable<IMaterialRequisitionDetailsResponse> {
        return this.http.post<IMaterialRequisitionDetailsResponse>(HttpApi.getMaterialRequisitionDetails, request);
      }
   
    
      // POST method for Submit MR
      SubmitMaterialRequisition(data: any): Observable<any> {
        return this.http.post(HttpApi.SubmitMaterialRequisition, data);
      }
    getMaterialRequisitionStatusTypes(): Observable<IStatusResponse[]> {
      return this.http.post<IStatusResponse[]>(HttpApi.getServiceRequestStatusTypes,{});
    }
  
    getSearchMaterialRequisitionList(request: ICommonRequest): Observable<IServiceRequestSearchList> {
      return this.http.post<IServiceRequestSearchList>(HttpApi.searchServiceRequestList, request);
    }
  
    getSearchServiceRequestHistoryList(request: ICommonRequest): Observable<IServiceRequestSearchList> {
      return this.http.post<IServiceRequestSearchList>(HttpApi.searchServiceRequestHistoryList, request);
    }
    
     
      getMaterialRequisitionStatus(): Observable<IMaterialRequisitionStatus[]> {
        return this.http.get<IMaterialRequisitionStatus[]>(HttpApi.getMaterialRequisitionStatuses);
      }
      
     getSessionsList(request: ICommonRequest): Observable<ISectionList> {
        return this.http.post<ISectionList>(HttpApi.getAllSessionsList, request);
      }


  
}
