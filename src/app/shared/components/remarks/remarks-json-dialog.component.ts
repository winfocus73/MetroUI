import { Component, OnInit, Input, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ILoginData } from '@auth/models/login.response';
import { CommonService } from '@shared/services/common.service';
import { LoadingService } from '@shared/services/spinner.service';
import { Constants } from 'src/app/core/http/constant';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog'; 

@Component({
  selector: 'nxasm-remarks-json-dialog',
  templateUrl: './remarks-json-dialog.component.html',
  styleUrls: ['./remarks-json-dialog.component.scss'],
})
export class RemarksComponent implements OnInit {
    //@Input() assetDetailsID =0;
    UserInfo: ILoginData = {} as ILoginData;
    RemarksForm!: UntypedFormGroup;
    userName!: string;
    remarks!:string;
    remarksDate!:string;
    currentDate: Date = new Date();
    displayedColumns: string[] = ['date', 'username', 'remarks'];
    isClosed = false;

    constructor(private commonService: CommonService, private fb: UntypedFormBuilder,
        private snackBar: MatSnackBar, private dialog: MatDialogRef<RemarksComponent>, 
        private _loading: LoadingService,@Inject(MAT_DIALOG_DATA) public parentdata: any
        
      ) {
  
    }
remarksHistory: any[] = [];

    ngOnInit(): void {
  this.UserInfo = this.commonService.loginStorageData;
  this.userName = this.UserInfo.loginData.userName;
  this.isClosed = this.parentdata?.isClosed;
  try {  
  const raw = this.parentdata?.remarks;
    if (typeof raw === 'string' && raw.trim().startsWith('[')) {
      this.remarksHistory = JSON.parse(raw);
    }
    else if (Array.isArray(raw)) {
      this.remarksHistory = raw;
    }
    else {
      this.remarksHistory = [];
    }
  } catch (e) {
    this.remarksHistory = [];
  }
  this.RemarksForm = this.fb.group({
    FormRemarks: [{ value: '', disabled: this.isClosed },Validators.required]
  });
}
    // save() {
    //     try {
    //           const newEntry = {
    //             "date": this.currentDate,
    //             "username": this.userName,
    //             "remarks": this.RemarksForm.get('FormRemarks')?.value 
    //             //this.RemarksForm.controls['FormRemarks'].value
    //           };
    //           const updatedJsonString = this.addNewElementAndSaveAsString(this.parentdata, newEntry);
    //           this.dialog.close(updatedJsonString);
    //         } catch (error) {
    //         this.snackMsg(Constants.staffError, 'error');
    //     }
    // }

   save() {
  try {
    const newEntry = {
      date: new Date(),
      username: this.userName,
      remarks: this.RemarksForm.value.FormRemarks
    };

    const updatedRemarks = [...this.remarksHistory, newEntry];

    this.dialog.close(JSON.stringify(updatedRemarks));
  } catch (e) {
    this.snackMsg(Constants.staffError, 'error');
  }
}


    snackMsg(msg: string, type: string) {
        this.snackBar.open(msg, 'close', {
            duration: 2000, panelClass: type, horizontalPosition: 'end', verticalPosition: 'top'
        });
    }
    closeDialog() {
  this.dialog.close(null); // null → parent knows it’s cancelled
}
}