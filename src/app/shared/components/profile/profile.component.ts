import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ILoginData } from '@auth/models/login.response';
import { IAddEditStaff } from '@dashboard/configuration/models/staff/add-edit-request';
import { IStaff } from '@dashboard/configuration/models/staff/staff';
import { IGetStaffResponse } from '@dashboard/configuration/models/staff/staff.response';
import { StaffService } from '@dashboard/configuration/services/staff.service';
import { IGetAddEditResponse, IGetSearchRequest } from '@shared/models';
import { CommonService } from '@shared/services/common.service';
import { LoadingService } from '@shared/services/spinner.service';
import { Constants } from 'src/app/core/http/constant';

@Component({
    selector: 'nxasm-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    staffRequest!: IGetSearchRequest;
    staffResponse!: IGetStaffResponse;
    staffId!: number;
    UserInfo: ILoginData = {} as ILoginData;
    staffData: IStaff = {} as IStaff;
    ProfileForm!: UntypedFormGroup;
    addEditRequest: IAddEditStaff = {} as IAddEditStaff;
    addEditResponse: IGetAddEditResponse = {} as IGetAddEditResponse;
    staffName!: string;
    userName!: string;
    constructor(private commonService: CommonService, private staffService: StaffService, private fb: UntypedFormBuilder,
        private snackBar: MatSnackBar, private dialog: MatDialogRef<ProfileComponent>, private _loading: LoadingService) {

    }

    ngOnInit(): void {
        this._loading._loading.next(true);
        this.UserInfo = this.commonService.loginStorageData;
        this.staffId = this.UserInfo.loginData.staffId;
        this.userName = this.UserInfo.loginData.userName;
        this.formLoad();
        this.getStaffDetails();
    }

    formLoad() {
        this.ProfileForm = this.fb.group({
            mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
            eMail: ['', [Validators.required, Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')]]
        });
    }

    getStaffDetails() {
        try {
            this.staffRequest = {
                SearchByName: '',
                SearchByValue: this.staffId?.toString()
            }
            this.staffService.getStaffDetails(this.staffRequest).subscribe((res) => {
                this.staffData = res;
                this.staffName = this.staffData.staffName;
                this._loading._loading.next(false);
                this.ProfileForm.controls['mobile'].setValue(this.staffData.mobile);
                this.ProfileForm.controls['eMail'].setValue(this.staffData.eMail);
            });
        } catch (error) {
            this._loading._loading.next(false);
        }

    }

    save() {
        try {
            const staff = Object.assign({}, this.ProfileForm.value);
            this.staffData.eMail = staff.eMail;
            this.staffData.mobile = staff.mobile;
            this.addEditRequest.staff = this.staffData;
            this.staffService.updateProfile(this.addEditRequest).subscribe((res) => {
                this.addEditResponse = res;
                if (res.status > 0) {
                    this.snackMsg(Constants.updateStaffSuccess, 'success');
                } else {
                    this.snackMsg(Constants.staffError, 'error');
                }
                if (res.status > 0) {
                    this.dialog.close();
                }
            },
                (err) => {
                    this.snackMsg(Constants.staffError, 'error');
                });
        } catch (error) {
            this.snackMsg(Constants.staffError, 'error');
        }
    }

    snackMsg(msg: string, type: string) {
        this.snackBar.open(msg, 'close', {
            duration: 2000, panelClass: type, horizontalPosition: 'end', verticalPosition: 'top'
        });
    }
}