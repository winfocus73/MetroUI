import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { map, catchError, finalize, timeout, retry } from 'rxjs/operators';

import { HttpError } from './http-error';
import { environment } from '../../../environments/environment';
import { LoadingService } from 'src/app/shared/services/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxPubSubService } from '@pscoped/ngx-pub-sub';
import { CommonService } from '@shared/services/common.service';
import { AlertDialogComponent } from '@shared/utils/dialogs/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
var CryptoJS = require("crypto-js");
const APP_XHR_TIMEOUT = 30000;

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  isOnline!: boolean;
  constructor(private loadingService: LoadingService, private snackBar: MatSnackBar, private pubsubSvc: NgxPubSubService,
    private commonService: CommonService,public dialog: MatDialog, private authService: AuthService,private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.isOnline = navigator.onLine;
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    if (this.authService.accessToken && this.authService.isTokenExpired()) {
      // Condition met, prevent next interceptor execution
      console.log('Token is expired. Preventing further interceptor execution.');
      this.authService.clearStorage();
      this.router.navigate(['auth/login']);
      return of(new HttpResponse({ status: 401, statusText: 'Unauthorized:Token Expired' }));
    }

    this.loadingService._loading.next(true);
    return next
    .handle(this.performRequest(req))
    .pipe(
      retry(2),
      timeout(APP_XHR_TIMEOUT),
      map((res) => this.handleSuccessfulResponse(res)),
      catchError((err) => this.handleErrorResponse(err)),
      finalize(
        () => {
        this.handleRequestCompleted.bind(this);
        this.pubsubSvc.publishEvent('NETWORK_ERROR');
        }
      )
    );
  }

  private performRequest(req: HttpRequest<any>): HttpRequest<any> {
    const authPrefix = 'Bearer';
    let contentType;
    const tokenExists = localStorage.getItem('token');
    const userData = sessionStorage.getItem('sessionData');
	let hashVal = CryptoJS.HmacSHA256(JSON.stringify(req.body), 'UW1nF0cu5S');
    hashVal = CryptoJS.enc.Hex.stringify(hashVal);
	//console.log("req.Body:"+  JSON.stringify(req.body));
	//console.log("hash val:"+  hashVal);

    let LoginUserInfo = this.commonService.loginStorageData;
    const userRoleId: any = LoginUserInfo?.userRoleId;
    let headers: HttpHeaders = req.headers;
    if (headers.has('Content-Type'))
       contentType = headers.get('Content-Type');

    headers = headers.set('Authorization', `${authPrefix} ${tokenExists}`,);
    headers = headers.set('Hash-Check', hashVal);
    headers = headers.set('Role-Id', userRoleId ? userRoleId : '-1');
    headers = headers.set('userSession', userData ? userData : '');
    //headers = headers.set('Content-Type',  contentType == undefined ? 'application/json' :  contentType);

    return req.clone({ url: `${environment.backend.host}/${req.url}`, headers });
}

  private handleSuccessfulResponse(event: any): HttpResponse<any> {
    // console.log('response at interceptor', event);

    if (event instanceof HttpResponse) {
      if(event.status==204) {
        setTimeout(() => {
          this.loadingService._loading.next(false);
        }, 500);
        return event;
      }
      event = event.clone({ body: event.body.response });
      setTimeout(() => {
        this.loadingService._loading.next(false);
      }, 500);
    }
    return event;
  }

  private handleErrorResponse(errorResponse: any): Observable<HttpEvent<any>> {
    // console.log('error at interceptor', errorResponse);
    if(this.isOnline) {
      if (errorResponse instanceof TimeoutError) {
        this.snackBar.open('TimeoutError', 'close', {
          duration: 2000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
        });
        this.loadingService._loading.next(false);
        return throwError('Timeout Exception');
      }

      switch (errorResponse.status) {
        case 401: // Unauthorized
          break;
        case 503: // Service Unavailable
          break;
        case 500: // Internal Server Error
          break;
        default: // Other Error
      }

      let customError = new HttpError();
      try {
        customError = HttpError.initWithCode(errorResponse.error.errors[0].code);
      } catch (e) {
       }
       if(errorResponse.error?.Message) {
        this.dialog.open(AlertDialogComponent, {
          width: '40%',
          disableClose: true,
          data: {body: errorResponse.error?.Message },
        });
       } else {
        this.snackBar.open(errorResponse.status == 0 ? 'Unable to connect, please try again' : errorResponse.message, 'close', {
          duration: 2000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
        });
       }
       this.loadingService._loginloading.next(false);
      this.loadingService._loading.next(false);
      return throwError(customError);
    } else {
      this.snackBar.open('Please Check Network', 'close', {
        duration: 2000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
      });
      this.loadingService._loginloading.next(false);
      this.loadingService._loading.next(false);
    }
    setTimeout(() => {
      this.loadingService._loginloading.next(false);
      this.loadingService._loading.next(false);
    }, 500);
    return throwError(null);
  }

  private handleRequestCompleted(): void {
    // console.log(`Request finished`);
    this.loadingService._loading.next(false);
  }

}
