import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { HttpApi } from '../http/http-api';
import { ILoginRequest } from 'src/app/auth/models/login.request';
import { ILoginResponse } from 'src/app/auth/models/login.response';
import { TokenService } from '@shared/services/token.service';
import { ICommonRequest, IGetAddEditResponse, IRequest } from '@shared/models';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IResetPWD } from '@auth/models/request-reset-pwd-response';
import * as moment from 'moment';

const OAUTH_DATA = environment.oauth;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  obj: any = {
    UserName:"API-USER1",
    UserToken:"386F3CA3-FCC3-4B42-A030-3EF296590CB6",
    APIKey:"API-USER-APIKEY-0000A-00001-00001",
    Timestamp: new Date().toISOString()
}
  private onUserLoggedIn = new Subject<boolean>();
  public onUserLoggedIn$ = this.onUserLoggedIn.asObservable();
  private tokenCheckTimer: any;


  constructor(private http: HttpClient, private tokenService: TokenService, private dialog: MatDialog, private router: Router) {
    this.initTokenCheck();
    //this.initUserInteractionListener();
  }

  getTokenApi(): Observable<any> {
    return this.http.post<any>(HttpApi.tokenApi, this.obj);
  }

  register(userRequest: any): Observable<any> {
    const data = {
      code: userRequest.codigo,
      email: userRequest.email,
      password: userRequest.password
    };

    return this.http.post(HttpApi.userRegister, data)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  loginWithUserCredentials(request: ILoginRequest): Observable<ILoginResponse> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post<ILoginResponse>(HttpApi.oauthLogin, request)
    .pipe(finalize(() => this.onUserLoggedIn.next(true)));



    // return this.http.post(HttpApi.oauthLogin, body.toString(), { headers })
    //   .pipe(
    //     map((response: any) => {
    //       localStorage.setItem('session', JSON.stringify(response));
    //       return response;
    //     })
    //   );
  }

  validateOTP(userId: number, MFAReference: number, otp: number): Observable<any> {
    const request: ICommonRequest = {} as ICommonRequest;
    let reqdata: IRequest[] = [
      { key: 'UserId',value: userId.toString()},
      { key: 'MFAReference',value: MFAReference.toString()},
      { key: 'otp',value: otp.toString()},
    ]
    request.Params = reqdata;
    return this.http.post<any>(HttpApi.validateOTP, request);
      //return this.http.get<any>(HttpApi.validateOTP + `?userId=${userId}&MFAReference=${MFAReference}&otp=${otp}`);
  }

  reSendOTP(userId: number): Observable<any> {
    const request: ICommonRequest = {} as ICommonRequest;
    let reqdata: IRequest[] = [
      { key: 'UserId',value: userId.toString()}
    ]
    request.Params = reqdata;
    return this.http.post<any>(HttpApi.resendOTP, request);
    //return this.http.get<any>(HttpApi.resendOTP + `?user_id=${userId}`);
  }

  loginWithRefreshToken(): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('client_id', OAUTH_DATA.client_id);
    body.set('client_secret', OAUTH_DATA.client_secret);
    body.set('refresh_token', this.refreshToken);
    body.set('scope', OAUTH_DATA.scope);

    return this.http.post(HttpApi.oauthLogin, body.toString(), { headers })
      .pipe(
        map((response: any) => {
          localStorage.setItem('token', JSON.stringify(response));
          return response;
        })
      );
  }

  isUserLoggedIn(): boolean {
    const token = localStorage['token'];
    const session = sessionStorage['sessionData'];
    const isTokenExpired = this.isTokenExpired();
    console.log('tk_exp', isTokenExpired);
    if(token && session) {
     return true;
    } else {
     return false;
    }
    //return localStorage.getItem('token') ? true : false;
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Invalid token format');
      return null;
    }
  }

  isTokenExpired(): boolean {
    let token =  this.accessToken ? this.accessToken : '';
    const decodedToken = this.decodeToken(token);
    if (!decodedToken || !decodedToken.exp) {
      return true;
    }

    const expiryTime = decodedToken.exp * 1000; // Convert expiry time to milliseconds
    // const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() > expiryTime;
  }

  logout(options: any = {}): void {
    const userData = sessionStorage.getItem('sessionData');
    let loginInfo: ILoginResponse = {} as ILoginResponse;
    if (userData) {
      loginInfo = JSON.parse(atob(userData));
    }else{
      this.router.navigate(['auth/login']);
      return;
    }
    const request: ICommonRequest = {} as ICommonRequest;
    let reqdata: IRequest[] = [
      { key: 'UserSession',value: loginInfo.userSession.toString()},
      { key: 'UserSessionId',value: loginInfo.userSessionId.toString()},
      { key: 'Remarks',value: options.remarks? options.remarks: ''}
    ]
    request.Params = reqdata;
    this.logOutAPI(request).subscribe((res) => {
      if(res.status=== 1) {
        let tk = <string>(localStorage.getItem('token') ? localStorage.getItem('token') : '');
        localStorage.clear();
        this.dialog.closeAll();
        if(tk && !this.isTokenExpired())
        localStorage.setItem('token', tk);
        sessionStorage.clear();
        // this.tokenService.init();
        this.onUserLoggedIn.next(false);
        this.router.navigate(['auth/login']);
      }
    }, err => {
      if(this.isTokenExpired()){
        console.log('logged out with api exception', err)
        this.router.navigate(['auth/login']);
      }
    })
  }

  logOutAPI(request: ICommonRequest): Observable<IGetAddEditResponse> {
    return this.http.post<IGetAddEditResponse>(HttpApi.oauthLogout, request)
  }

  autoLogout(expirationDuration: number): void {
    setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }



  get accessToken() {
   // return localStorage['token'] ? JSON.parse(localStorage['token']).access_token : null;
   return localStorage['token'];
  }

  get refreshToken() {
    //return localStorage['token'] ? JSON.parse(localStorage['token']).refresh_token : null;
    return localStorage['token'];
  }


  requestResetPwd(request: ICommonRequest): Observable<IResetPWD> {
    return this.http.post<IResetPWD>(HttpApi.requestResetPwd, request)
  }

  requestUpdatePwd(request: ICommonRequest): Observable<IGetAddEditResponse> {
    return this.http.post<IGetAddEditResponse>(HttpApi.requestUpdatePwd, request)
  }

  clearStorage(){
    localStorage.clear();
    sessionStorage.clear();
  }

  getToken(): string | null {
    const tokenData = localStorage.getItem('token');
    return tokenData || null;
  }


  private initTokenCheck() {
    console.log('init-tk-chk');
    // Check token validity on application startup
    if (this.getToken() && this.isTokenExpired()) {
      this.logout();
    }

    // Listen for visibility change events (tab visibility)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // When the tab becomes visible again, check token validity
        if (this.getToken() && this.isTokenExpired()) {
          this.logout();
        }

        // if user out for more than idle timeout
        // let lastVisitTime = localStorage.getItem('lastvisibility');
        // if(lastVisitTime){
        //   let diff = moment().diff(moment(lastVisitTime), 'seconds');
        //   if(diff > 600){
        //     console.log('user idle more than usual time')
        //   }
        // }
      }
      let dt = moment().format('YYYY-MM-DDTHH:mm:ss');
      localStorage.setItem('lastvisibility',  dt);
      console.log('visibilty changed', dt);
    });
  }

  private scheduleTokenCheck() {
    clearTimeout(this.tokenCheckTimer); // Clear existing timer
    this.tokenCheckTimer = setTimeout(() => {
      if (this.getToken() && this.isTokenExpired()) {
        this.logout();
      } else {
        this.scheduleTokenCheck();
      }
    }, 6000); // Check every minute (adjust interval as needed)
  }

  private initUserInteractionListener() {
    // Listen for user interactions on document (e.g., mouse movements, key presses)
    document.addEventListener('mousemove', this.handleUserInteraction);
    document.addEventListener('keypress', this.handleUserInteraction);
    document.addEventListener('scroll', this.handleUserInteraction);
    // Add other relevant interactions as needed
  }

  private handleUserInteraction = () => {
    // Reset the token check timer on user interaction

    if (this.getToken() && this.isTokenExpired()) {
      this.logout();
    }
    // console.log('validated')
    // clearTimeout(this.tokenCheckTimer);
    // this.scheduleTokenCheck();
  };
}
