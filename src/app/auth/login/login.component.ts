import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
const shajs = require('sha.js');

import { AuthService } from '../../core/services/auth.service';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { ILoginRequest } from '../models/login.request';
import { ILoginResponse } from '../models/login.response';
import { NgxPubSubService } from '@pscoped/ngx-pub-sub';
import { LoadingService } from '@shared/services/spinner.service';
import { NgxCaptchaService } from '@binssoft/ngx-captcha';
import { ToasterService } from '@shared/utils/dialogs/toaster/toaster.service';
import { AuditService } from '@dashboard/audit/audit-service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  form!: FormGroup;
  message!: string;
  loginSubscription!: Subscription;
  loginLoading = false;
  forgotLoading = false;
  loginRequest!: ILoginRequest;
  loginResponse!: ILoginResponse;
  dropdownRoles: any;
  roleMenu = false;
  selectedMenu!: string;
  otp!: number;
  isMFRequired = false;
  isResend!: boolean;;
  timerDisplay: any;
  isReset = false;
  static path = () => ['login'];
  loginDetailsSub!: Subscription;
  isFailedAttempt = 0;
  captch_input:any = null;
  code: any = null;
  resultCode:any = null;
  captchaStatus:any = '';
  isForgotPwd = false;
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
  private unsubscribe = new Subject<void>();
  constructor(
    private authService: AuthService,
    public formBuilder: FormBuilder,
    private router: Router,
    public snackBar: MatSnackBar,
    private pubsubSvc: NgxPubSubService,
    private auditService: AuditService,
    private captchaService:NgxCaptchaService,
    private toasterService: ToasterService,
    private _loadingService: LoadingService) {
    
    this.initFormBuilder();
   // this.capcacheCheck();
  }

  ngOnInit() {
    localStorage.clear();
    sessionStorage.clear();
    this._loadingService.loginloading$.subscribe((res)=>{
      this.loginLoading = res;
    })
    this.isResend = false;
    //this.createCaptchaLoad();
  }
  ngOnDestroy(): void {
    if(this.loginDetailsSub){
      this.loginDetailsSub.unsubscribe();
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

  loginUser() {
    this.loginLoading = true;
    try {
      localStorage.clear();
      sessionStorage.clear();
      if(this.isFailedAttempt === 0) {
        this.checkLogin();
      } else {
        this.checkCaptcha();
      }
    } catch (error) {
      this.loginLoading = false;
    }
  }

  checkCaptcha() {
    try {
      const captch_input = this.form.controls['captch_input'].value;
      this.captch_input = captch_input;
      if (this.captch_input != this.resultCode) {
        this.toasterService.setCaptchaStatus(false);
      } else  {
        this.toasterService.setCaptchaStatus(true);
      }
      this.capcacheCheck();
    } catch (error) {
      this.loginLoading = false;
    }
    
  }
  onDestroy$: Subject<void> = new Subject();
  capcacheCheck() {
    try {
      this.toasterService.captchStatus
      .pipe(take(1))
      .subscribe((status)=>{
        this.captchaStatus = status;
        if (status == false) {
            this.loginLoading = false;
           // alert("Opps!\nCaptcha mismatch")
           this.snackBar.open('Captcha mismatch', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
        } else if (status == true)  {
            //alert("Success!\nYou are right")
            this.checkLogin();
        }
      });
    } catch (error) {
      this.loginLoading = false;
    }
  }

  checkLogin() {
          this.loginUserAuth();
    /*
    this.authService.getTokenApi().subscribe((res)=>{
      if(res) {
        localStorage.setItem('token', res.token);
        setTimeout(() => {
          this.loginUserAuth();
        }, 200);
      }
    })
      */
  }

  loginUserAuth() {
    this.isReset = false;
    //shajs('sha256').update('123456789').digest('hex')
    this.loginRequest = {
      UserName: this.form.value.email,
      Password: shajs('sha256').update(this.form.value.password).digest('hex'),
      TimeStamp: new Date().toISOString(),
      IpAddress: '',
      IspAddress: '',
      BrowserInfo: ''
    }
    this.loginSubscription = this.authService.loginWithUserCredentials(this.loginRequest)
      .subscribe(
        data => {
          //data.resetpwd = 1;
          this.loginResponse = data;
          
          if(data && data.id > 0) {
            if(data.resetpwd ==1) {
              this.loginLoading = false
              this.isReset = true;
            }
            else if(data.isMFARequired ==1) {
              this.loginLoading = false
              this.isMFRequired = true;
              this.timer(3);
              setTimeout(() => {
                this.timerDisplay = '';
                this.isResend = true;
              }, 60000*2);
            } else {
              this.loginLoading = false;
              this.isMFRequired = false;
              this.isFailedAttempt = 0;
              this.getModuleFormsList();
             this.navigateToLandingPage(data);
            }
          } else {
            let msg;
            if(data==null) {
              msg = 'No Data Found';
            } else {
              msg = data.loginMessage;
            }
            this.loginLoading = false
            this.isFailedAttempt++;
            this.createCaptchaLoad();
            this.snackBar.open(msg, 'close', {duration: 4000,panelClass:'error',horizontalPosition: 'end',verticalPosition: 'top'});
          }
        },
        error => {
          this.loginLoading = false
          this.isFailedAttempt++;
          this.createCaptchaLoad();
          this.snackBar.open('username or password incorrect', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
        }
      );
  }

  getModuleFormsList() {
    try {
      this.auditService.getModulesFormsList().subscribe((res) => {
        if(res) {
          sessionStorage.setItem('modulesData', btoa(JSON.stringify(res.modules)));
        }
      })
    } catch (error) {
    }
  }

  navigateToLandingPage(data: ILoginResponse) {
    this.dropdownRoles = data.roleNames.split(',');
    sessionStorage.setItem('sessionData', btoa(JSON.stringify(data)));
    if(this.dropdownRoles.length ===1) {
      sessionStorage.setItem('roleMenu', btoa(JSON.stringify({roleId:data.roleIds,roleName:data.roleNames, unitAccessScopes: data.unitAccessScopes})));
      this.router.navigate(DashboardComponent.path());
    } else {
      this.roleMenu = true;
    }
  }

  validateOTP() {
    try {
      this.loginLoading =  true;
      this.authService.validateOTP(this.loginResponse.id,this.loginResponse.mfaReferenceCode,this.otp).subscribe((res)=>{
        if(res.Status==1){
          this.loginLoading =  false;
          this.navigateToLandingPage(this.loginResponse);
        } else {
          this.loginLoading =  false;
          this.snackBar.open('Please enter valid OTP', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
        }
      })
    } catch (error) {
      this.loginLoading =  false;
      this.snackBar.open('Please enter valid OTP', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
    }
  }

  resendOTP() {
    try {
      this.authService.reSendOTP(this.loginResponse.id).subscribe((res)=>{
        if(res){
          this.timer(3);
          this.loginResponse.mfaReferenceCode = res.mfaReferenceCode;
          this.isResend = false;
        } else {
          this.snackBar.open('Please enter valid OTP', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
        }
      })
    } catch (error) {
      this.snackBar.open('Please enter valid OTP', 'close', {duration: 4000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'});
    }
  }
  menuSelect() {
    let userData:any = sessionStorage.getItem('sessionData');
    let roleId:string='0';
    let unitAccessScopes = '';
    if (this.selectedMenu) {
      if (userData) {
        userData = JSON.parse(atob(userData));
      }
        let index = userData.roleNames.split(',').indexOf(this.selectedMenu);
         roleId= userData.roleIds.split(',')[index];
        unitAccessScopes = userData.unitAccessScopes.split(',')[index];
    }
    sessionStorage.setItem('roleMenu', btoa(JSON.stringify({roleId:roleId?.trim(),roleName:this.selectedMenu, unitAccessScopes: unitAccessScopes})));
    //sessionStorage.setItem('roleMenu', btoa(JSON.stringify(this.selectedMenu)));
    this.router.navigate(DashboardComponent.path());
  }

  private initFormBuilder() {
    this.form = this.formBuilder.group({
      email: ['', [
        Validators.required
      ]],
      password: ['', Validators.required],
      captch_input: ['']
    });
  }

  loginback(e: any) {
    this.isReset = false;
    this.isForgotPwd = false;
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

  forgotPwd() {
    try {
      this.forgotLoading = true;
      this.authService.getTokenApi().subscribe((res)=>{
        if(res) {
          this.forgotLoading = false;
          localStorage.setItem('token', res.token);
          this.isForgotPwd =  true;
        } else {
          this.forgotLoading = false;
        }
      })
    } catch (error) {
      this.forgotLoading = false;
    }
  }

}
