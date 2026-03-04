import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICommonRequest, IGetAddEditResponse, ILookupData, ILookupValue, IRequest } from '@shared/models';
import * as moment from 'moment';
import { WorkOrderService } from '@dashboard/planning-scheduling/work-order/services/work-order.service';
import { CommonService } from '@shared/services/common.service';
import { ICancel } from './cancel';
import { ServiceRequestService } from '@dashboard/service-requests/services/service-request.service';

@Component({
  selector: 'nxasm-cancel-item',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss']
})
export class CancelTypeComponent implements OnInit {

    CancelForm!: UntypedFormGroup;
    modeldata: any;
    dateFormat = 'YYYY-MM-DDTHH:mm:ss';
    cancelSave: ICancel = {} as ICancel;
    dropDownAssetRemoval: ILookupValue[] = [];
    lookupData: ILookupData[] = [];
    addEditResponse:  IGetAddEditResponse = {} as IGetAddEditResponse;
    constructor(private fb: UntypedFormBuilder, private workorderService: WorkOrderService,
        private snackBar: MatSnackBar, private serviceRequestService: ServiceRequestService,
        @Inject(MAT_DIALOG_DATA) modeldata: any,private commonService: CommonService,
        private dialog: MatDialogRef<CancelTypeComponent>) {
            this.modeldata = modeldata;
    }
    ngOnInit(): void {
        this.validatAssetProvideSave();
        this.getLookUpData();
    }

    validatAssetProvideSave() {
        this.CancelForm = this.fb.group({
            reason: ['', Validators.required],
            remarks: ['', Validators.required]
        });
    }
    getLookUpData() {
        const request: ICommonRequest = {} as ICommonRequest;
        const reqdata: IRequest[] = [
            {
              key: 'name', value: this.modeldata.type == 'PTW' ? 'PTW Cancel Reason' : 'Reschedule Reason'
            },
            {
                key:'id', value:''
            }
          ]
          request.Params = reqdata;
            this.commonService.getLookupData(request).subscribe((res) => {
            this.lookupData = res;
            if(this.modeldata.type == 'PTW') {
                this.dropDownAssetRemoval = this.lookupData.filter(x=>x.lookup_name === 'PTW Cancel Reason')[0].lookupvalues;
            } else {
            this.dropDownAssetRemoval = this.lookupData.filter(x=>x.lookup_name === 'Reschedule Reason')[0].lookupvalues;
            }
        }); 
      }

    save() {
        this.cancelSave = Object.assign({}, this.CancelForm.value);
        this.cancelSave.Id = this.modeldata.id;
        this.cancelSave.CancelledBy = this.modeldata.userRoleId;
        this.cancelSave.CancelledBy = this.modeldata.userId; 
        this.cancelSave.Reason = this.cancelSave.Reason;
        this.cancelSave.Remarks = this.cancelSave.Remarks;
        this.cancelSave.CancelledOn = moment().format(this.dateFormat);
        this.cancelSave.Role = this.modeldata.userRoleId;
        let type: string;
        if(this.modeldata.type == 'WO') {
            type =' Work Order';
            this.workOrder(type);
        } if(this.modeldata.type == 'PTW') {
            type =' PTW';
            this.ptw(type);
        } if(this.modeldata.type == 'SR') {
            type =' Service Requiest';
            this.SR(type);
        }
    }

    workOrder(type: string) {
        this.workorderService.cancelWokorder(this.cancelSave).subscribe((res) =>{
            this.addEditResponse = res;
            if(res.status > 0){
                this.snackBar.open(type + 'Cancelled' + 'Successfully' , 'close', {
                    duration: 2000, panelClass:'success', horizontalPosition: 'end', verticalPosition: 'top'
                  });
                this.dialog.close({data:'success'});
            } else {
                this.snackBar.open(type + 'Cancelling' + 'failed', 'close', {
                    duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
                  });
            }
        },
        (err) => {
            this.snackBar.open(type + 'Cancelling' + 'failed', 'close', {
              duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
            });
        });
    }

    ptw(type: string) {
        this.workorderService.cancelPTW(this.cancelSave).subscribe((res) =>{
            this.addEditResponse = res;
            if(res.status > 0){
                this.snackBar.open(type + 'Cancelled' + 'Successfully' , 'close', {
                    duration: 2000, panelClass:'success', horizontalPosition: 'end', verticalPosition: 'top'
                  });
                this.dialog.close({data:'success'});
            } else {
                this.snackBar.open(type + 'Cancelling' + 'failed', 'close', {
                    duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
                  });
            }
        },
        (err) => {
            this.snackBar.open(type + 'Cancelling' + 'failed', 'close', {
              duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
            });
        });
    }

    SR(type: string) {
        this.serviceRequestService.cancelServiceRequest(this.cancelSave).subscribe((res) =>{
            this.addEditResponse = res;
            if(res.status > 0){
                this.snackBar.open(type + 'Cancelled' + 'Successfully' , 'close', {
                    duration: 2000, panelClass:'success', horizontalPosition: 'end', verticalPosition: 'top'
                  });
                this.dialog.close({data:'success'});
            } else {
                this.snackBar.open(type + 'Cancelling' + 'failed', 'close', {
                    duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
                  });
            }
        },
        (err) => {
            this.snackBar.open(type + 'Cancelling' + 'failed', 'close', {
              duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
            });
        });
    }
}
