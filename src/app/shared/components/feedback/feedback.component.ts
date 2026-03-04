import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from '@shared/services/common.service';
import { IGetAddEditResponse } from '@shared/models/add-edit.response';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IUser } from '@dashboard/configuration/models/user/user';
import { ICommonRequest, IRequest } from '@shared/models';
import { IFeedback } from '@shared/models/feedback';
import { regxValidator } from '@shared/validators/regx-validator';
import { Constants } from 'src/app/core/http/constant';
import { IAttachement } from '@shared/models/attachment';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  @Input() userForm = false;
  feedbackFormGroup!: UntypedFormGroup;
  feedbackId  = 0;
  attachments: IAttachement[] =[];
  modelData!: any;
  UserInfo: any;
  selectedUserInfo: IUser = {} as IUser;
  addEditResponse:  IGetAddEditResponse = {} as IGetAddEditResponse;
  isActionRequire = false;
  constructor(
    private commonService: CommonService,
    private dialog: MatDialogRef<FeedbackComponent>,
    private snackBar: MatSnackBar,
    @Optional()@Inject(MAT_DIALOG_DATA) data: any) {

    if(data) {
      this.modelData = data.feedback;
      this.isActionRequire = data.isActionRequire;
     // this.userForm = modeldata.userForm;
     // this.selectedUserInfo = modeldata.rowData;

    }
  }
  ngOnInit(): void {
    let userData = sessionStorage.getItem('sessionData');
    if (userData) {
        this.UserInfo = JSON.parse(atob(userData));
      }
    this.init();
    // if(this.userForm == false) {
    //   this.feedbackFormGroup.controls['currentPassword'].setValidators(Validators.required);
    //   this.feedbackFormGroup.updateValueAndValidity();
    // }
  }

  /*

  {
        "Id":0,
        "FeedbackNumber":"FB001",
        "Name": "Rao22",
        "Mobile": "1234567890",
        "EMail": "test@gmail.com",
        "UnitId":9,
        "UnitName": "RST",
        "Description": "TESTFEEDBACK",
        "ActionTaken": "",
        "UserId":1
  }

  */

  init() {
    this.feedbackFormGroup = new UntypedFormGroup(
        {
          description: new UntypedFormControl('', Validators.required),
          name: new FormControl(this.UserInfo.name),
          mobile: new FormControl(''),
          email: new FormControl('', [Validators.required, regxValidator(Constants.emailRegx)]),
          userId: new FormControl(''),
          actionTaken: new FormControl('', [this.requiredIfActionNotTaken()] )

        }
      );
      if(this.modelData){
        this.feedbackFormGroup.patchValue({
          email: this.modelData.eMail,
          mobile: this.modelData.mobile,
          actionTaken: this.modelData.actionTaken,
          description: this.modelData.description});
        this.attachments = this.modelData.Attachments;
        this.feedbackId = this.modelData.id;
      }
  }


 requiredIfActionNotTaken(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const currentValue = control.value;

    if (this.isActionRequire && !currentValue) {
      return { 'required': true };
    }

    return null;
  };
}

  getFeedback(){
    if(!this.feedbackId) return
    const request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
      {key:"FeedBackId",value:this.feedbackId.toString()}
    ]
    request.Params = reqdata;
    this.commonService.getFeedbackDetails(request).subscribe(res => {
      this.attachments = res.attachments
    })

  }

  addOrUpdateFeedback() {

    if(this.feedbackFormGroup.invalid) {
      return;
    }

    const request: IFeedback = {
           Id: 0 ,
           FeedbackNumber: "" ,
           Name:  this.UserInfo.userName||this.UserInfo.roleNames ,
           Mobile:  this.feedbackFormGroup.value.mobile ,
           EMail:  this.feedbackFormGroup.value.email ,
           UnitId: this.UserInfo.unitId ,
           UnitName:  this.UserInfo.unitName ,
           Description:  this.feedbackFormGroup.value.description ,
           ActionTaken:  "" ,
           UserId:  this.UserInfo.id,
           Attachments:[]
          }

          if(this.feedbackId){
            request.Attachments = this.attachments;
            request.Id = this.feedbackId;
          }
          if(this.isActionRequire){
            request.ActionTaken = this.feedbackFormGroup.value.actionTaken;
          }

    this.commonService.addUpdateFeedback(request).subscribe((res) => {
      //this.workFlowHisotryData = res;
      if(res && res.status > 0) {
        this.feedbackId = res.status;
        //this.close();
        this.snackBar.open('Feedback submitted', 'close', {
            duration: 2000, panelClass:'success', horizontalPosition: 'end', verticalPosition: 'top'
        });
        //this.close();
        // this.getFeedbacksList();
      } else {
        this.snackBar.open('error in Feedback submission', 'close', {
          duration: 2000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
      });
      }
    });



  }


  getFeedbacksList() {
    if(this.feedbackFormGroup.invalid) return;
    const request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
          {key: 'Unit' , value: '1'},
          {key: 'FromDate' , value: ''},
          {key: 'ToDate' , value: ''},
          {key: 'PageNo' , value: '1'},
          {key: 'PageSize' , value: '2'},
          {key: 'Pagenation' , value: '1'}
    ]
    request.Params = reqdata;
    this.commonService.searchFeedbacks(request).subscribe((res) => {
      if(res && res.length) {
      //this.workFlowHisotryData = res;
      //if(res && res.status > 0) {
        //this.close();
        this.snackBar.open('Feedback submitted', 'close', {
            duration: 2000, panelClass:'success', horizontalPosition: 'end', verticalPosition: 'top'
        });

      }

      //}
    });


  }

  get f() {
    return this.feedbackFormGroup.controls;
  }

  public onSubmit() {

  }

  snackMsg(msg: string, type: string) {
    this.snackBar.open(msg, 'close', {
        duration: 2000, panelClass:type, horizontalPosition: 'end', verticalPosition: 'top'
    });
  }

  close() {
    this.dialog.close();
  }


  attachmentsload(res: boolean) {
    this.getFeedback();
  }

  save() {
    // let isSubAsset = false;
    // const assets:ITreeResponse[] = this.dataSource['_flattenedData'].value; // this.subAssetsTree;
    // assets.forEach((item)=>{
    //   if(!item.assetNo || !item.oemSerialNo) {
    //     isSubAsset = true;
    //     return;
    //   }
    // })
    // if(isSubAsset) {
    //   this.snackMsg('Please enter all sub asset fileds (Asset No and OEM Serail Number)', 'error');
    // } else {
    // try {
    //   this.addEditRequest = Object.assign({}, this.assetRegForm.value);
    //   this.getAssetdataMap();
    //   this.addEditRequest.isAssembly = 0;
    //   // this.addEditRequest.glAccountId = 0;
    //   this.addEditRequest.assetModelId = 0;
    //   this.addEditRequest.id = this.assetId;
    //   this.addEditRequest.statusId = 1;
    //   this.addEditRequest.assets = this.mapSubAssetsTree;  // this.subAssetsTree;
    //   this.addEditRequest.assetParentId = this.addEditRequest.assetParentId ? this.addEditRequest.assetParentId : 0;
    //   this.assetService.addEditAssetregistry(this.addEditRequest).subscribe((res) => {
    //     this.addEditResponse = res;
    //     if(res.status > 0) {
    //       if(this.assetId == 0) {
    //         this.snackMsg(Constants.addAssetRegistrySuccess, 'success');
    //       } else {
    //         this.snackMsg(Constants.updateAssetRegistrySuccess, 'success');
    //       }
    //     } else {
    //       this.snackMsg(Constants.assetRegistryError, 'error');
    //     }
    //     if(res.status > 0) {
    //       this.message.emit(res.status)
    //     }
    //   },
    //   (err) => {
    //     this.snackMsg(Constants.assetRegistryError, 'error');
    //   }
    //   );
    //   } catch (error) {
    //     this.snackMsg(Constants.assetRegistryError, 'error');
    //   }
    // }
  }

  clear() {
   /*  this.assetRegForm.reset();
    this.validatAssetRegSave(); */
  }

}
