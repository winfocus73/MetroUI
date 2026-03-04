import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IResetPWD } from '@auth/models/request-reset-pwd-response';
import { ICommonRequest } from '@shared/models';
import { IPWDExclusion } from '@shared/models/pwd-exclusion';
import { CommonService } from '@shared/services/common.service';
import { ToasterService } from '@shared/utils/dialogs/toaster/toaster.service';
import * as moment from 'moment';
import { AuthService } from 'src/app/core/services/auth.service';
const shajs = require('sha.js');

@Component({
  selector: 'nxasm-for-got-pwd',
  templateUrl: './for-got-pwd.component.html',
  styleUrls: ['./for-got-pwd.component.scss']
})
export class ForGotPWDComponent implements OnInit {
    @Output() backtologin = new EventEmitter();
    restForm!: UntypedFormGroup;
    pwdFormGroup!: UntypedFormGroup;
    resetPwd: IResetPWD = {} as IResetPWD;
    pwdList: IPWDExclusion = {} as IPWDExclusion;
    rloginLoading = false;
    uloginLoading = false;
    captchaStatus:any = '';
    code: any = null;
    dateFormat = 'YYYY-MM-DDTHH:mm:ss';
    resultCode:any = null;
    timerDisplay = '';
    isResend = false;
    captch_input:any = null;
    config:any = {
        type:1,
        length:6,
        cssClass:'custom',
        back: {
        stroke:"#2F9688",
        solid:"#f2efd2"
        } ,
        font:{
        color:"#000000",
        size:"35px"
        }
    };
    isUserCheck = false;
    constructor(private authService: AuthService, private snackBar: MatSnackBar, private commonService: CommonService,
        private router: Router, private toasterService: ToasterService) {

    }

    ngOnInit(): void {
        this.pwdCheck();
        this.objRestForm();
        this.createCaptchaLoad();
    }

    objRestForm() {
        this.restForm = new UntypedFormGroup({
            username: new UntypedFormControl('', [Validators.required]),
            captch_input: new UntypedFormControl('',[Validators.required]),
            mobileno: new UntypedFormControl('', [Validators.minLength(10), Validators.maxLength(10), Validators.required]),
        });
    }

    pwdCheck() {
        this.commonService.getPwdExceptionList().subscribe((res) => {
          this.pwdList = res;
        })
      }

    objUpdateForm() {
        this.pwdFormGroup = new UntypedFormGroup(
            {
              forgototp: new UntypedFormControl(''),
              userid: new UntypedFormControl(''),
              otpref: new UntypedFormControl(''),
              timestamp: new UntypedFormControl(''),
              forgotPassword: new UntypedFormControl(
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

    matchPassword(fg: AbstractControl) {
        let password = fg.get('forgotPassword')?.value;
        let cpassword = fg.get('confirmPassword')?.value;
        if (password != cpassword) {
          fg.get('confirmPassword')?.setErrors({ matchPassword: true });
        }
        return fg.get('forgotPassword')?.value === fg.get('confirmPassword')?.value
          ? null
          : { matchPassword: true };
      }

      get f() {
        return this.pwdFormGroup.controls;
      }

    requestResetPwd() {
        try {
        this.rloginLoading = true;
        let request: ICommonRequest = {} as ICommonRequest;
        request.Params = [
            {key: 'username', value: this.restForm.controls['username'].value ? this.restForm.controls['username'].value.toString() : ''},
            {key: 'mobileno', value: this.restForm.controls['mobileno'].value ? this.restForm.controls['mobileno'].value.toString() : ''}
        ];
        this.authService.requestResetPwd(request).subscribe((res) => {
            if(res.status ===1) {
                this.resetPwd = res;
                this.isUserCheck =  true;
                this.rloginLoading = false;
                this.objUpdateForm();
                this.pwdFormGroup.controls['otpref'].setValue(this.resetPwd.otpRef);
                this.pwdFormGroup.controls['userid'].setValue(this.resetPwd.userId);
                this.pwdFormGroup.controls['forgototp'].setValue('');
                this.pwdFormGroup.controls['forgotPassword'].setValue('');
                this.pwdFormGroup.updateValueAndValidity();
                this.timer(5);
                setTimeout(() => {
                  this.timerDisplay = '';
                  this.isResend = true;
                }, 60000*2);
                setTimeout(() => {
                  const inputElement = document.getElementById('unique-id-1') as HTMLInputElement;
                  if (inputElement) {
                    inputElement.setAttribute('name', 'new-password');
                    inputElement.setAttribute('id', 'new-password');
                  }
                }, 100);
            } else {
                this.rloginLoading = false;
                this.snackBar.open('No user record found with the given user name and mobile no. Please recheck.', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
            }
        })
        } catch (error) {
            this.rloginLoading = false;
            this.snackBar.open('No user record found with the given user name and mobile no. Please recheck.', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
        }
    }

    resendOTP() {
      try {
        this.authService.reSendOTP(this.resetPwd.userId).subscribe((res)=>{
          if(res){
            this.timer(5);
            this.pwdFormGroup.controls['otpref'].setValue(res.mfaReferenceCode);
            this.isResend = false;
          } else {
            this.snackBar.open('Please enter valid OTP', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
          }
        })
      } catch (error) {
        this.snackBar.open('Please enter valid OTP', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
      }
    }

    timer(minute: number) {
      // let minute = 1;
      let seconds = minute * 60;
      let textSec: any = "0";
      let statSec = 60;
  
      const prefix = minute < 10 ? "0" : "";
  
      const timer = setInterval(() => {
        seconds--;
        if (statSec != 0) statSec--;
        else statSec = 59;
  
        // if (statSec < 10) textSec = "0" + statSec;
        // textSec = statSec;
  
        if (statSec < 10) {
          console.log("inside", statSec);
          textSec = "0" + statSec;
        } else {
          console.log("else", statSec);
          textSec = statSec;
        }
  
        // this.display = prefix + Math.floor(seconds / 60) + ":" + textSec;
        this.timerDisplay = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
  
        if (seconds == 0) {
          console.log("finished");
          this.timerDisplay = '';
          this.isResend = true;
          clearInterval(timer);
        }
      }, 1000);
    }

    createCaptcha() {

        switch(this.config.type) {
          case 1: // only alpha numaric degits to type

          let char =
          Math.random()
            .toString(24)
            .substring(2, this.config.length) +
          Math.random()
            .toString(24)
            .substring(2, 4);
          this.code = this.resultCode = char.toUpperCase();
          break;
          case 2: // solve the calculation
          let num1 = Math.floor(Math.random() * 99);
          let num2 = Math.floor(Math.random() * 9);
          let operators = ['+','-'];
          let operator = operators[(Math.floor(Math.random() * operators.length))];
          this.code =  num1+operator+num2+'=?';
          this.resultCode = (operator == '+')? (num1+num2):(num1-num2);
          break;
        }


        setTimeout(() => {
          let captcahCanvas: any = document.getElementById("captcahCanvas");
          var ctx = captcahCanvas.getContext("2d");
          ctx.fillStyle = this.config.back.solid;
          ctx.fillRect(0, 0, captcahCanvas.width, captcahCanvas.height);

          ctx.beginPath();

          captcahCanvas.style.letterSpacing = 15 + "px";
          ctx.font = this.config.font.size + " " + this.config.font.family;
          ctx.fillStyle = this.config.font.color;
          ctx.textBaseline = "middle";
          ctx.fillText(this.code, 40, 50);
          if (this.config.back.stroke) {
            ctx.strokeStyle = this.config.back.stroke;
            for (var i = 0; i < 150; i++) {
              ctx.moveTo(Math.random() * 300, Math.random() * 300);
              ctx.lineTo(Math.random() * 300, Math.random() * 300);
            }
            ctx.stroke();
          }

          // this.captchaCode.emit(char);
        }, 100);
    }

    updatedResetPwd() {
        try {
            this.uloginLoading = true;
            let request: ICommonRequest = {} as ICommonRequest;
            let pwd;
            if(this.pwdFormGroup.value.forgotPassword) {
                pwd = shajs('sha256').update(this.pwdFormGroup.value.forgotPassword).digest('hex')
            }
            request.Params = [
                {key: 'userid', value: this.pwdFormGroup.controls['userid'].value ? this.pwdFormGroup.controls['userid'].value.toString() : ''},
                {key: 'otpref', value: this.pwdFormGroup.controls['otpref'].value ? this.pwdFormGroup.controls['otpref'].value.toString() : ''},
                {key: 'password', value: pwd ? pwd: ''},
                {key: 'otp', value: this.pwdFormGroup.controls['forgototp'].value ? this.pwdFormGroup.controls['forgototp'].value.toString() : ''},
                {key: 'timestamp', value: moment(new Date()).format(this.dateFormat)},
            ];
            this.authService.requestUpdatePwd(request).subscribe((res) => {
                if(res.status > 0) {
                    this.uloginLoading = false;
                    this.snackBar.open(res.message, 'close', {duration: 4000, panelClass:'success', horizontalPosition: 'end', verticalPosition: 'top'});
                    //this.router.navigate(['auth/login']);
                    this.backtologin.emit(true);
                } else {
                    this.uloginLoading = false;
                    this.snackBar.open(res.message, 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
                }
            })
        } catch (error) {
            this.uloginLoading = false;
            this.snackBar.open('Password updating failed', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
        }
    }

    createCaptchaLoad() {
        if (this.config) {
          if (!this.config.font || !this.config.font.size) {
            this.config["font"]["size"] = "40px";
          }
          if (!this.config.font || !this.config.font.family) {
            this.config["font"]["family"] = "Arial";
          }
          if (!this.config.strokeColor) {
            this.config["strokeColor"] = "#f20c6c";
          }
          if (!this.config.length) {
            this.config["length"] = 6;
          }
          if (!this.config.cssClass) {
            this.config["cssClass"] = '';
          }

          if (!this.config.type) {
            this.config["type"] = 1;
          }

          if (!this.config.back || !this.config.back.stroke) {
            this.config["back"]["stroke"] = "";
          }
          if (!this.config.back || !this.config.back.solid) {
            this.config["back"]["solid"] = "#f2efd2";
          }

          this.createCaptcha();
        }
    }

    checkCaptcha() {
        try {
          const captch_input = this.restForm.controls['captch_input'].value;
          this.captch_input = captch_input;
          if (this.captch_input != this.resultCode) {
            this.toasterService.setCaptchaStatus(false);

          } else  {
            this.toasterService.setCaptchaStatus(true);
          }
          this.capcacheCheck();
        } catch (error) {
          this.rloginLoading = false;
        }

      }

    capcacheCheck() {
        try {
          this.rloginLoading = true;
          this.toasterService.captchStatus.subscribe((status)=>{
            this.captchaStatus = status;
            if (status == false) {
                this.rloginLoading = false;
               // alert("Opps!\nCaptcha mismatch")
               this.snackBar.open('Captcha mismatch', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
            } else if (status == true)  {
                //alert("Success!\nYou are right")
                this.requestResetPwd();
            }
          });
        } catch (error) {
          this.rloginLoading = false;
        }
    }

    backtoLoginPage() {
      this.backtologin.emit(true);
    }

}
