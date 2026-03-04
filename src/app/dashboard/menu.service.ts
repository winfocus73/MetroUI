import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpApi } from 'src/app/core/http/http-api';
import { IGetMenuRequest, Menu } from './menu';


@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  getMenus(request: IGetMenuRequest): Observable<Menu[]> {
    return this.http.post<Menu[]>(HttpApi.menus, request);
  }

  getReportMenus(request: IGetMenuRequest): Observable<Menu[]> {
    return this.http.post<Menu[]>(HttpApi.reportMenus, request);
  }
}
