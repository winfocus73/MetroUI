import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from '@shared/services/common.service';
import { IChangePwd } from './c-pwd';
import { IGetAddEditResponse } from '@shared/models/add-edit.response';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IUser } from '@dashboard/configuration/models/user/user';
import { ILoginResponse } from '@auth/models/login.response';
import { Router } from '@angular/router';
import { IPWDExclusion } from '@shared/models/pwd-exclusion';
const shajs = require('sha.js');
@Component({
  selector: 'nxasm-change-pwd',
  templateUrl: './change-pwd.component.html',
  styleUrls: ['./change-pwd.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  @Input() userForm = false;
  @Input() loginForm = false;
  @Input() userData: ILoginResponse = {} as ILoginResponse;
  pwdFormGroup!: UntypedFormGroup;
  objPwd: IChangePwd = {} as IChangePwd;
  UserInfo: any;
  selectedUserInfo: IUser = {} as IUser;
  addEditResponse:  IGetAddEditResponse = {} as IGetAddEditResponse;
  @Output() backtologin = new EventEmitter();
  pwdList: IPWDExclusion = {} as IPWDExclusion;
  constructor(
    private commonService: CommonService,
    private snackBar: MatSnackBar,
    @Optional() private dialog: MatDialogRef<ChangePasswordComponent>,
    private router: Router,
    @Optional()@Inject(MAT_DIALOG_DATA) modeldata: any) {
    if(modeldata) {
      this.userForm = modeldata.userForm;
      this.selectedUserInfo = modeldata.rowData;
    }
  }
  ngOnInit(): void {
    let userData = sessionStorage.getItem('sessionData');
    if (userData) {
        this.UserInfo = JSON.parse(atob(userData));
    }
    this.pwdCheck();
    this.init();
    if(this.userForm == false) {
      this.pwdFormGroup.controls['currentPassword'].setValidators(Validators.required);
      this.pwdFormGroup.updateValueAndValidity();
    }
  }

  init() {
    this.pwdFormGroup = new UntypedFormGroup(
        {
          currentPassword: new UntypedFormControl(''),
          newPassword: new UntypedFormControl(
            '',
            Validators.compose([
              Validators.required,
              Validators.minLength(12),
              Validators.maxLength(15),
              this.regexValidator(new RegExp('(?=.*?[0-9])'), { 'at-least-one-digit': true }),
              this.regexValidator(new RegExp('(?=.*[a-z])'), { 'at-least-one-lowercase': true }),
              this.regexValidator(new RegExp('(?=.*[A-Z])'), { 'at-least-one-uppercase': true }),
              this.regexValidator(new RegExp('(?=.*[!@#$%^&*])'), { 'at-least-one-special-character': true }),
              this.regexValidator(new RegExp('(^.{6,}$)'), { 'at-least-six-characters': true }),
              this.pwdvalidation({ 'please enter valid password': true })
            ])
          ),
          confirmPassword: new UntypedFormControl(
            '',
            Validators.compose([
              Validators.required,
              Validators.minLength(12),
              Validators.maxLength(15),
            ])
          ),
        },
        this.matchPassword
      );
  }

  matchPassword(fg: AbstractControl) {
    let password = fg.get('newPassword')?.value;
    let cpassword = fg.get('confirmPassword')?.value;
    if (password != cpassword) {
      fg.get('confirmPassword')?.setErrors({ matchPassword: true });
    }
    return fg.get('newPassword')?.value === fg.get('confirmPassword')?.value
      ? null
      : { matchPassword: true };
  }

  get f() {
    return this.pwdFormGroup.controls;
  }

  pwdCheck() {
    this.commonService.getPwdExceptionList().subscribe((res) => {
      this.pwdList = res;
      //this.pwdList.PwdExclusionPhrases.push('Admin$123456789')
    })
  }

  public onSubmit() {
    if(this.userForm==false) {
      this.pwdFormGroup.markAllAsTouched();
      var data = Object.assign({}, this.pwdFormGroup.value);
      this.objPwd.UserId = this.UserInfo.id;
      this.objPwd.CurrentPassword = shajs('sha256').update(data.currentPassword).digest('hex');
      this.objPwd.NewPassword = shajs('sha256').update(data.newPassword).digest('hex');
      if (this.pwdFormGroup.valid) {
          this.commonService.passwordChange(this.objPwd).subscribe((res) => {
              this.addEditResponse = res;
              if(res.status > 0) {
                this.snackMsg('Password Changed Successfully', 'success');
                    this.dialog.close();
              } else {
                this.snackMsg('Password Changed failed', 'error');
              }
            },
            (err) => {
              this.snackMsg('Password Changed failed', 'error');
            });
      }
    } else {
      this.pwdFormGroup.markAllAsTouched();
      var data = Object.assign({}, this.pwdFormGroup.value);
      this.objPwd.UserId = Object.keys(this.selectedUserInfo).length !== 0 ? this.selectedUserInfo.id : this.userData.id;
      this.objPwd.NewPassword = shajs('sha256').update(data.newPassword).digest('hex');
      this.objPwd.UpdatedBy = this.UserInfo ? this.UserInfo.id : this.userData.id;
      if (this.pwdFormGroup.valid) {
          this.commonService.restPasswordChange(this.objPwd).subscribe((res) => {
              this.addEditResponse = res;
              if(res.status > 0) {
                this.snackMsg('Password Changed Successfully', 'success');
                if(this.loginForm) {
                  this.backtologin.emit(res.status);
                  //this.router.navigate(['auth'])
                } else {
                  this.dialog.close();
                }
                  
              } else {
                this.snackMsg('Password Changed failed', 'error');
              }
            },
            (err) => {
              this.snackMsg('Password Changed failed', 'error');
            });
      }
    }
  }

  snackMsg(msg: string, type: string) {
    this.snackBar.open(msg, 'close', {
        duration: 2000, panelClass:type, horizontalPosition: 'end', verticalPosition: 'top'
    });
  }

  close() {
    this.dialog.close();
  }

  clear() {
    this.pwdFormGroup.reset();
  }

  private regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }

  private pwdvalidation(error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const valid = this.pwdList.PwdExclusionPhrases.some(str => control.value.includes(str));
      return valid ? error : null;
    };
  }
}
