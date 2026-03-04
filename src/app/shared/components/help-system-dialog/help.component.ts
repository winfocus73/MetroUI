import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HelpSystemDialog } from './help-system-dialog.component';
import { CommonService } from '@shared/services/common.service';

@Component({
    selector: 'asm-help-dialog',
    template: `<i style="float: inline-end;margin-top: -2%;cursor: pointer;" (click)="openHelpSystem()" mat-icon-button class="fa fa-question-circle" title="Help System"></i>`,
})
export class HelpComponent implements  OnDestroy {

    contextCode = '';
    constructor(private dialog: MatDialog, private commonService: CommonService) {

    }
    
    openHelpSystem() {
        this.contextCode = this.commonService.getContextCode();
        if (this.contextCode) {
            this.dialog.open(HelpSystemDialog,
                {
                    width: '90vw',
                    height: '90vh',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    panelClass: 'full-screen-dialog-container',
                    data: { contextId: this.contextCode }
                })
        }
    }
    ngOnDestroy(): void {
        this.contextCode = '';
    }
}