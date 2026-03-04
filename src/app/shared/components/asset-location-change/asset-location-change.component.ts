import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from '@shared/services/common.service';
import { IGetAddEditResponse } from '@shared/models/add-edit.response';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IAssetChange } from '@shared/models/asset-change';
import { IAssetReg } from '@dashboard/asset-registry/models/assets';
import { ILoginData } from '@auth/models/login.response';
import { WorkOrderListPopupComponent } from '@dashboard/planning-scheduling/work-order/list/popup/work-order-list-popup.component';
import { LocationsDialogComponent } from '@shared/components/location-dialog/location-dialog.component';
import { defaultControlOptions } from '@shared/utils/dialogs/defaultOptions';
import * as moment from 'moment';
const shajs = require('sha.js');
@Component({
  selector: 'nxasm-asset-location-change',
  templateUrl: './asset-location-change.component.html',
  styleUrls: ['./asset-location-change.component.scss'],
})
export class AssetLocationChangeComponent implements OnInit {
  assetFormGroup!: UntypedFormGroup;
  dateFormat = 'YYYY-MM-DDTHH:mm:ss';
  objAssetChange: IAssetChange = {} as IAssetChange;
  UserInfo: any;
  selectedAssetData: IAssetReg = {} as IAssetReg;
  addEditResponse:  IGetAddEditResponse = {} as IGetAddEditResponse;
  dialogRef!: MatDialogRef<AssetLocationChangeComponent>;
  locationDialogRef!: MatDialogRef<LocationsDialogComponent>;
  dialogWorkOrderRef!: MatDialogRef<WorkOrderListPopupComponent>;
  datePickerOptions: any = defaultControlOptions.dateTimePicekr;
  constructor(
    private commonService: CommonService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Optional()@Inject(MAT_DIALOG_DATA) modeldata: any) {
    if(modeldata) {
      this.selectedAssetData = modeldata.rowData;
    }
  }
  ngOnInit(): void {
    const loginDta: ILoginData = this.commonService.loginStorageData;
    this.UserInfo = loginDta.loginData;
    this.init();
  }

  init() {
    this.assetFormGroup = new UntypedFormGroup({
        newLocationId: new UntypedFormControl('', Validators.required),
        newLocation: new UntypedFormControl('', Validators.required),
        date: new UntypedFormControl('',Validators.required),
        woId: new UntypedFormControl('',Validators.required),
        woNumber: new UntypedFormControl('',Validators.required),
        remarks: new UntypedFormControl('',Validators.required)
    });
  }

  openWorkOrderDialog(): void {
    this.dialogWorkOrderRef = this.dialog.open(WorkOrderListPopupComponent, {
      width: '50%',
      disableClose: true,
      data: { userData: this.UserInfo },
    });
    this.dialogWorkOrderRef.afterClosed().subscribe((result) => {
      if (result && result?.data) {
        this.assetFormGroup.controls['woId'].setValue(result.data[0].id);
        this.assetFormGroup.controls['woNumber'].setValue(result.data[0].no);
        this.assetFormGroup.updateValueAndValidity();
      }
    });
  }

  openDialog(): void {
    this.locationDialogRef = this.dialog.open(LocationsDialogComponent, {
      width: '100%',
      disableClose: true,
    });
    this.locationDialogRef.afterClosed().subscribe((result) => {
      if (result && result?.data) {
        this.assetFormGroup.controls['newLocationId'].setValue(result.data.locationId);
        this.assetFormGroup.controls['newLocation'].setValue(result.data.locationName);
        this.assetFormGroup.updateValueAndValidity();
      }
    });
  }


  public onSubmit() {
    var data = Object.assign({}, this.assetFormGroup.value);
    this.objAssetChange.changedBy = this.UserInfo.id;
    this.objAssetChange.assetId = this.selectedAssetData.id;
    this.objAssetChange.newLocation = data.newLocation;
    this.objAssetChange.newLocationId = data.newLocationId;
    this.objAssetChange.woNumber = data.woNumber;
    this.objAssetChange.woId = data.woId
    this.objAssetChange.remarks = data.remarks;
    this.objAssetChange.date =  moment(data.date).format(this.dateFormat);
    this.commonService.assetLocationChange(this.objAssetChange).subscribe((res) => {
        this.addEditResponse = res;
        if(res.status > 0) {
        this.snackMsg('Asset Loaction Changed Successfully', 'success');
        this.dialog.closeAll();
        } else {
        this.snackMsg('Asset Loaction Changing failed', 'error');
        }
    },
    (err) => {
        this.snackMsg('Asset Loaction Changing failed', 'error');
    });
  }

  snackMsg(msg: string, type: string) {
    this.snackBar.open(msg, 'close', {
        duration: 2000, panelClass:type, horizontalPosition: 'end', verticalPosition: 'top'
    });
  }

  lengthcheck(controlName: string) {
    return this.assetFormGroup.controls[controlName].value?.length;
  }

  close() {
    this.dialog.closeAll();
  }
}
