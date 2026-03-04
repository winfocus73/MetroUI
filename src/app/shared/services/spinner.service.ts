import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';;

@Injectable()
export class LoadingService {
    _loading = new BehaviorSubject<boolean>(false);
    public readonly loading$ = this._loading.asObservable();

    _loginloading = new BehaviorSubject<boolean>(false);
    public readonly loginloading$ = this._loginloading.asObservable();

    show() {
    this._loading.next(true);
    }

    hide() {
    this._loading.next(false);
    }

    loginSpin() {
        this._loginloading.next(false);
    }
}
