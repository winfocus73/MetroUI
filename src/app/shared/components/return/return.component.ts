import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICommonRequest, IGetAddEditResponse, ILookupData, ILookupValue, IRequest } from '@shared/models';
import * as moment from 'moment';
import { WorkOrderService } from '@dashboard/planning-scheduling/work-order/services/work-order.service';
import { CommonService } from '@shared/services/common.service';
import { ServiceRequestService } from '@dashboard/service-requests/services/service-request.service';
import { IReturn } from './return';
import { ILoginData } from '@auth/models/login.response';

@Component({
    selector: 'nxasm-return-item',
    templateUrl: './return.component.html',
    styleUrls: ['./return.component.scss']
})
export class ReturnTypeComponent implements OnInit {

    returnForm!: UntypedFormGroup;
    modeldata: any;
    dateFormat = 'YYYY-MM-DDTHH:mm:ss';
    dropDownAssetRemoval: ILookupValue[] = [];
    lookupData: ILookupData[] = [];
    addEditResponse: IGetAddEditResponse = {} as IGetAddEditResponse;
    loginData: ILoginData = {} as ILoginData;
    constructor(private fb: UntypedFormBuilder,
        private snackBar: MatSnackBar, private serviceRequestService: ServiceRequestService,
        @Inject(MAT_DIALOG_DATA) modeldata: any, private commonService: CommonService,
        private workOrderService: WorkOrderService,
        private dialog: MatDialogRef<ReturnTypeComponent>) {
        this.modeldata = modeldata;
    }
    ngOnInit(): void {
        this.validatAssetProvideSave();
        this.loginData = this.commonService.loginStorageData;
    }

    validatAssetProvideSave() {
        this.returnForm = this.fb.group({
            ReturnRemarks: ['', Validators.required]
        });
    }
    save() {
        let returnSave: IReturn = {} as IReturn;
        let objSave = Object.assign({}, this.returnForm.value);
        returnSave.Id = this.modeldata.id;
        returnSave.ReturnedBy = this.modeldata.userId;
        returnSave.ReturnRemarks = objSave.ReturnRemarks;
        returnSave.ReturnedOn = moment().format(this.dateFormat);
        returnSave.Workflow = this.modeldata.Workflow;
        let type: string;
        if (this.modeldata.type == 'SR') {
            type = ' Service Requiest';
            this.SR(type, returnSave);
        } else  if (this.modeldata.type == 'WO') {
            type = ' Work Order';
            this.WO(type, returnSave);
        }
    }

    SR(type: string, request: IReturn) {
        this.serviceRequestService.returnServiceRequest(request).subscribe((res) => {
            this.addEditResponse = res;
            if (res.status > 0) {
                this.snackMsg(type + 'Returned Successfully', 'success');
                this.dialog.close({ data: 'success' });
            } else {
                this.snackMsg(type + 'Returning failed', 'error');
            }
        },
            (err) => {
                this.snackMsg(type + 'Returning failed', 'error');
            });
    }
    WO(type: string, request: IReturn) {
        this.workOrderService.returnWorkOrder(request).subscribe((res) => {
            this.addEditResponse = res;
            if (res.status > 0) {
                this.snackMsg(type + 'Returned Successfully', 'success');
                this.dialog.close({ data: 'success' });
            } else {
                this.snackMsg(type + 'Returning failed', 'error');
            }
        },
            (err) => {
                this.snackMsg(type + 'Returning failed', 'error');
            });
    }
    
    snackMsg(msg: string, type: string) {
        this.snackBar.open(msg, 'close', {
            duration: 2000, panelClass: type, horizontalPosition: 'end', verticalPosition: 'top'
        });
    }
}
