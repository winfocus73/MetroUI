import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { IUploadRequest } from "@shared/models/upload-request";
import { Observable } from "rxjs";
import { HttpApi } from "src/app/core/http/http-api";

@Injectable({
    providedIn: 'root'
  })
export class UploadService{

    constructor(
        private http: HttpClient,
        private router: Router,
      ) { }
    private options = { headers: new HttpHeaders().set('Content-Type', 'multipart/form-data') };
    UploadDocument(request:any):Observable<any>{
        return this.http.post<any>(HttpApi.uploadDocument, request);
    }

    downloadDocument(code:string):Observable<any>{
      return this.http.get<any>(HttpApi.downloadDocument+`/${code}`);
    }
    
    DeleteDocument(code:string) {
      return this.http.get<any>(HttpApi.DeleteDocument +`?code=${code}`);
    }
}