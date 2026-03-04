import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpApi } from 'src/app/core/http/http-api';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn:'root'
})
export class TokenService {
 token!: string;
 baseUrl = environment.backend.host;
  constructor() {}
  obj: any = {
    UserName:"API-USER1",
    UserToken:"386F3CA3-FCC3-4B42-A030-3EF296590CB6",
    APIKey:"API-USER-APIKEY-0000A-00001-00001",
    Timestamp: new Date().toISOString()
}

 init() {
    fetch( this.baseUrl + '/authservice/api/auth/authenticate', {
        method: "POST",
        body: JSON.stringify(this.obj),
        headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        .then(json => {
            if(json) {
                localStorage.setItem('token', json.token);
            }
           // console.log(json)
        })
        .catch(err => {
            console.log('token:ex', err)
        
 });
}

}