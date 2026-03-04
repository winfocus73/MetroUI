import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'asm-help-system-dialog',
    templateUrl: 'help-system-dialog.component.html',
    styleUrls: ['help-system-dialog.component.scss'],
  })
  export class HelpSystemDialog implements OnInit {
    url = environment.backend.helpUrl;// 'http://localhost:4400/view/';
    safeUrl!:any;
    constructor(
      private sanitizer: DomSanitizer,
      public dialogRef: MatDialogRef<HelpSystemDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
        //this.url = this.url + data.contextId
       }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    ngOnInit(): void {
        // Example dynamic URL
        const ddd = this.url  + '#/view/' + this.data.contextId;
        const unsafeUrl = this.constructIframeUrl(ddd, { });
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
      }
    
      constructIframeUrl(base: string, params: { [key: string]: string }): string {
        const url = new URL(base);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return url.toString();
      }

      close() {
        this.dialogRef.close();
      }
  
  }