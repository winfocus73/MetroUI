import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  IServiceRequestResponse,
  IWorkOrderRequestResponse,
} from '@dashboard/dashboard/models/department-wise-count';
import { IResponse } from '@dashboard/planning-scheduling/permit-to-work/models/response';
import { IExecuteServiceRequest } from '@dashboard/service-requests/models/execute-service-request';
import { IImpactList } from '@dashboard/service-requests/models/get-impact-list-response';
import { IServiceRequestDetails } from '@dashboard/service-requests/models/new/service-request.details';
import {
  IScheduleServiceReqiest,
  ISRAssign,
} from '@dashboard/service-requests/models/schedule-service-request';
import {
  IServiceRequestList,
  IServiceRequestSearchList,
} from '@dashboard/service-requests/models/service-request-list';
import { IStatusResponse } from '@dashboard/service-requests/models/status-response';
import { ISubmitServiceRequest } from '@dashboard/service-requests/models/submit-service-request';
import {
  ISystemResponse,
  ISubSystemResponse,
  IZoneResponse,
} from '@dashboard/service-requests/models/system-response';
import { ICancel } from '@shared/components/cancel/cancel';
import { IReturn } from '@shared/components/return/return';
import { ICommonRequest, IRequest, IGetAddEditResponse } from '@shared/models';
import { IWaitingForMaterial } from '@shared/models/waiting-for-material';
import { Observable } from 'rxjs';
import { HttpApi } from 'src/app/core/http/http-api';
import { IShipmentSearchList } from '../../models/shipment';
import { IAddEditShipment } from '../../models/add-edit-shipment';
import { ILocation } from '@dashboard/configuration-setup/models/location/location';

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  getShipmentNums() {
    throw new Error('Method not implemented.');
  }
  getInvoiceNums() {
    throw new Error('Method not implemented.');
  }
  shipmentId!: number;
  constructor(private http: HttpClient) {}

  getServiceRequestList(
    request: ICommonRequest,
  ): Observable<IServiceRequestList[]> {
    return this.http.post<IServiceRequestList[]>(
      HttpApi.getServiceRequestList,
      request,
    );
  }

  getServiceRequestDetails(
    request: ICommonRequest,
  ): Observable<IServiceRequestDetails> {
    let roleMenu = sessionStorage.getItem('roleMenu');
    let userRoleId: number = 0;
    if (roleMenu) {
      userRoleId = JSON.parse(atob(roleMenu))?.roleId?.replace(/[" ]+/g, '');
    }
    const assetRequest: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
      { key: 'SId', value: this.shipmentId?.toString() },
      { key: 'RoleId', value: userRoleId?.toString() },
    ];
    assetRequest.Params = reqdata;

    return this.http.post<IServiceRequestDetails>(
      HttpApi.getServiceRequestDetails,
      assetRequest,
    );
  }

  SubmitServiceRequest(request: ISubmitServiceRequest): Observable<IResponse> {
    return this.http.post<IResponse>(HttpApi.SubmitServiceRequest, request);
  }

  getSubsystemFailureSummary(request: ICommonRequest): Observable<IResponse> {
    return this.http.post<IResponse>(
      HttpApi.getSubsystemFailureSummary,
      request,
    );
  }

  ScheduleServiceRequest(
    request: IScheduleServiceReqiest,
  ): Observable<IResponse> {
    return this.http.post<IResponse>(HttpApi.ScheduleServiceRequest, request);
  }
  assignServiceRequest(request: ISRAssign): Observable<IResponse> {
    return this.http.post<IResponse>(HttpApi.assignServiceRequest, request);
  }
  ExecuteServiceRequest(
    request: IExecuteServiceRequest | null,
  ): Observable<IResponse> {
    return this.http.post<IResponse>(HttpApi.ExecuteServiceRequest, request);
  }
  getSRDashBoardSummary(
    request: ICommonRequest,
  ): Observable<IServiceRequestResponse> {
    return this.http.post<IServiceRequestResponse>(
      HttpApi.getSRDashBoardSummary,
      request,
    );
  }

  getWoRequestDashBoardSummary(
    request: ICommonRequest,
  ): Observable<IWorkOrderRequestResponse> {
    return this.http.post<IWorkOrderRequestResponse>(
      HttpApi.workorderrequestsummary,
      request,
    );
  }

  getServiceRequestStatusTypes(): Observable<IStatusResponse[]> {
    return this.http.post<IStatusResponse[]>(
      HttpApi.getServiceRequestStatusTypes,
      {},
    );
  }

  getSearchServiceRequestList(
    request: ICommonRequest,
  ): Observable<IServiceRequestSearchList> {
    return this.http.post<IServiceRequestSearchList>(
      HttpApi.searchServiceRequestList,
      request,
    );
  }

  getSearchServiceRequestHistoryList(
    request: ICommonRequest,
  ): Observable<IServiceRequestSearchList> {
    return this.http.post<IServiceRequestSearchList>(
      HttpApi.searchServiceRequestHistoryList,
      request,
    );
  }

  getSytems(): Observable<ISystemResponse[]> {
    return this.http.post<ISystemResponse[]>(HttpApi.getFaultSystems, {});
  }
  getSubSystems(request: ICommonRequest): Observable<ISubSystemResponse[]> {
    return this.http.post<ISubSystemResponse[]>(
      HttpApi.getFaultSubSystems,
      request,
    );
  }

  getSystemFaults(request: ICommonRequest): Observable<ISystemResponse[]> {
    return this.http.post<ISystemResponse[]>(HttpApi.getSystemFaults, request);
  }
  getSRImpactList(): Observable<IImpactList[]> {
    return this.http.post<IImpactList[]>(HttpApi.getSRImpactList, {});
  }

  IssueWorkOder(request: ICommonRequest): Observable<IResponse> {
    return this.http.post<IResponse>(HttpApi.IssueWorkOrder, request);
  }
  cancelServiceRequest(request: ICancel): Observable<IGetAddEditResponse> {
    return this.http.post<IGetAddEditResponse>(
      HttpApi.cancelServiceRequest,
      request,
    );
  }
  returnServiceRequest(request: IReturn): Observable<IGetAddEditResponse> {
    return this.http.post<IGetAddEditResponse>(
      HttpApi.returnServiceRequest,
      request,
    );
  }
  checkAssetSRPending(request: ICommonRequest): Observable<any> {
    return this.http.post<any>(HttpApi.checkAssetSRPending, request);
  }
  changeAssetParams(request: ICommonRequest): Observable<any> {
    return this.http.post<any>(HttpApi.changeAssetParams, request);
  }
  saveFaultCode(request: ICommonRequest): Observable<IResponse> {
    return this.http.post<IResponse>(HttpApi.updateFailureCodeRequest, request);
  }
  saveWaitingForMaterial(request: ICommonRequest): Observable<IResponse> {
    return this.http.post<IResponse>(HttpApi.saveWaitingForMaterial, request);
  }
  getWaitingForMaterial(
    request: ICommonRequest,
  ): Observable<IWaitingForMaterial> {
    return this.http.post<IWaitingForMaterial>(
      HttpApi.getWaitingForMaterial,
      request,
    );
  }
  getZone(): Observable<IZoneResponse[]> {
    return this.http.post<IZoneResponse[]>(HttpApi.zones, {});
  }
  getShipmentSearchList(
    request: ICommonRequest,
  ): Observable<IShipmentSearchList> {
    return this.http.post<IShipmentSearchList>(
      HttpApi.getShipmentSearchList,
      request,
    );
  }

  //     addEditShipment(request: IAddEditShipment): Observable<IGetAddEditResponse> {
  //     return this.http.post<IGetAddEditResponse>(
  //     HttpApi.addEditShipment,   // 👈 make sure this API exists
  //     request.shipment
  //   );
  // }

  addEditShipment(payload: any): Observable<any> {
    return this.http.post(HttpApi.addEditShipment, payload);
  }

  saveShipmentLineItems(payload: any): Observable<any> {
    return this.http.post(HttpApi.addShipmentLineItems, payload);
  }

  getVendors(): Observable<any> {
    return this.http.get(HttpApi.getPOVendors);
  }

  getLocations(): Observable<ILocation[]> {
    return this.http.get<ILocation[]>(HttpApi.getAllLocations);
  }

  getPoStatus(): Observable<[]> {
    return this.http.get<[]>(HttpApi.getPurchaseOrderStatuses);
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
}
