import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {


  idleState = 'Not started.';
  timedOut = false;
  lastPing!: Date;
  title = 'angular-idle-timeout';

  //this.config.backdrop = 'static';
  //this.config.keyboard = false;
  childModal!: MatDialogRef<any>;

  // public modalRef: BsModalRef;

  // @ViewChild('childModal', { static: false }) childModal: ModalDirective;
  @ViewChild('confimLogout', { static: true }) confimLogout!: TemplateRef<any>;
  //@ViewChild('template') templateRef: TemplateRef<any>;
  constructor(private idle: Idle, private keepalive: Keepalive, private dialog: MatDialog,
    private router: Router, private authService: AuthService) {
    this.InitiateIdleTimeout();
  }


  ngOnInit(): void {
    // this.startIdleTimer();
  }

  startIdleTimer() {
    if (this.authService.isUserLoggedIn()) {
      this.reset();
    }
  }

  reset() {
    this.idle.watch();
    //this.idleState = 'Started.';
    this.timedOut = false;
  }
  show() {
    this.childModal = this.dialog.open(this.confimLogout, { ariaLabelledBy: 'modal-basic-title' });
  }

  hideChildModal(): void {
    this.childModal.close();
  }

  stay() {
    this.childModal.close();
    this.reset();
  }

  logout(options?: any) {
    this.childModal.close();
    // perform logout user from local and server
    //this.appService.setUserLoggedIn(false);
    this.authService.logout(options);
    this.idle.stop();
    this.router.navigate(['auth/login']);
  }


  InitiateIdleTimeout() {

    // sets an idle timeout of 5 seconds, for testing purposes.
    this.idle.setIdle(600);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(60);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.interrupt()

    this.idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.'
      console.log(this.idleState);
      this.reset();
    });

    this.idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      console.log(this.idleState);
      //this.router.navigate(['/']);
      this.logout({remarks: 'auto logout'});
    });

    this.idle.onIdleStart.subscribe(() => {
      this.idleState = 'You\'ve gone idle!'
      console.log(this.idleState);
      this.show();
    });

    this.idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = '' + countdown;
      console.log(this.idleState);
    });

    // sets the ping interval to 15 seconds
    this.keepalive.interval(60);

    this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.authService.onUserLoggedIn$.subscribe(userLoggedIn => {
      if (userLoggedIn) {
        this.startIdleTimer();
        this.timedOut = false;
      } else {
        this.idle.stop();
      }
    })

    // this.reset();

  }


  ngOnDestroy() {
    this.idle.stop();
  }


}
