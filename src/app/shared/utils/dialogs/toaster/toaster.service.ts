import { Injectable } from '@angular/core';
import { Toast } from './toast.interface';
import { ToastType } from './toast.type';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  subject: BehaviorSubject<Toast>;
  toast$: Observable<Toast>;

  captchSource = new BehaviorSubject(null);
  captchStatus = this.captchSource.asObservable(); 

  constructor() {
    this.subject = new BehaviorSubject<Toast>({} as Toast);
    this.toast$ = this.subject.asObservable()
      .pipe(filter(toast => toast.title !== null));
  }

  show(type: ToastType, title?: string, body?: string, delay?: number) {
    this.subject.next({ type, title, body, delay });
  }

 
  setCaptchaStatus(code: any) {
    this.captchSource.next(code);
  }
}