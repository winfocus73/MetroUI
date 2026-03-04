import { Component, Inject, Input, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IDropdown } from "@shared/models";
import { IUploadRequest } from "@shared/models/upload-request";
import { UploadService } from "@shared/services/upload.Service";


@Component({
    selector: 'nxasm-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
  })
  export class UploadComponent implements OnInit {
    objectId = '';
    kind:string = '';
    objectNo = '';
    file: any = null;
    selectedFile!: File;
    selectedFiles!: any;
    Description:string = '';
    isButtonDisabled:boolean=false;
    UserInfo: any;
    formData = new FormData();
    isBtnClick: boolean = false;
    assetId: any = null;
    loginLoading = false;
    @Input() assetItems: IDropdown[] =[];


    constructor(private dialog: MatDialogRef<UploadComponent>,
        private snackBar: MatSnackBar,
        private uploadService:UploadService,
        @Inject(MAT_DIALOG_DATA) modeldata: any
        ){
        this.objectId = modeldata.kindId;
        this.kind = modeldata.kind;
        this.objectNo = modeldata.objectNo;
        // this.items = modeldata.itmes;

    }
    ngOnInit() {
        let userData = sessionStorage.getItem('sessionData');

        if (userData) {
        this.UserInfo = JSON.parse(atob(userData));
        }
    }
    close() {
      this.dialog.close();
    }
    onFileChange(event:any){

        let fileName=event.target.files[0]?.name;
        if(this.isValid(fileName.substr(fileName.lastIndexOf('.') + 1))){
            this.file=event.target.files[0];
            this.selectedFile = this.file;
            this.selectedFiles = event.target.files;
            //this.selectedFiles = event.target.files;
            //this.currentFileUpload = this.selectedFiles.item(0);


            //console.log(this.currentFileUpload)
            this.formData.append('file', this.file);
            //console.log(JSON.stringify(formData);
        }
        else{
            this.snackBar.open('Invalid File Format', 'close', {
                duration: 2000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
              });
            this.file=null;
        }
        this.buttonValidation(null);
    }

    isValid(extension:string){
        let fileExtensions=['jpg','jpeg','png','svg','pdf', 'xls','xlsx', 'doc', 'docx','mp4', 'ts'];
        if(fileExtensions.indexOf(extension.toLocaleLowerCase()) > -1){
            return true;
        }
        return false;
    }
    buttonValidation(event:any){
        this.isButtonDisabled = true;
        if(this.file!==null&&this.Description){
            this.isButtonDisabled= false;
        }
    }
    UploadDocuments(){
        let reqdata: IUploadRequest = {} as IUploadRequest;
        //let reqdata: IUploadRequest = {
        // reqdata.id = 0;
        // reqdata.createdBy =this.UserInfo.id?.toString();
        // reqdata.Description = this.Description;
        // reqdata.files = formData;
        // reqdata.Kind = this.kind;
        // reqdata.Name = (this.file!=null)?this.file.name:'';
        // reqdata.extension = (this.file!=null)?this.file.type:'';
        // reqdata.size = (this.file!=null)?this.file.size:null;
        // reqdata.Tags = '';
        // reqdata.UnitId = this.UserInfo.unitId;
        // reqdata.objectId = this.objectId.toString();

        const formData = new FormData();
        this.isButtonDisabled = true;
        this.loginLoading = true;
        formData.append('Name', (this.file!=null)?this.file.name:'');
        formData.append('id', '0');
        formData.append('extension', (this.file!=null)?this.file.type:'');
        formData.append('size', (this.file!=null)?this.file.size:null);
        formData.append('description', this.Description);
        formData.append('kind', this.kind);
        formData.append('tags', (this.file!=null)?this.file.name:"tag123");
        formData.append('unitId', this.UserInfo.unitId);
        formData.append('objectId', this.objectId?.toString());
        formData.append('objectNo', this.objectNo ? this.objectNo?.toString(): 'NA');
        formData.append('createdBy', this.UserInfo?.id?.toString());
        formData.append('userName', this.UserInfo?.userName?.toString());
        if(this.assetId) {
            formData.append('assetId', this.assetId.toString());
            const assetNo = this.assetItems.find(x => x.value == this.assetId);
            if(assetNo?.value) {
                formData.append('assetNo', assetNo?.code ?? 'NA');
            }
        } else {
          formData.append('assetId', this.objectId.toString());
          formData.append('assetNo', this.objectNo ? this.objectNo?.toString(): 'NA');
        }

        Object.values(this.selectedFiles).forEach(function (file:any, index:any) {
            formData.append('files', file);
        });
        try {
            this.uploadService.UploadDocument(formData).subscribe((res)=>{
                if(res.code){
                    this.snackBar.open('Document Uploaded Successfully', 'close', {
                        duration: 2000, panelClass:'success', horizontalPosition: 'end', verticalPosition: 'top'
                      });
                      this.dialog.close();
                } else {
                    this.snackBar.open('Document Uploaded failed', 'close', {
                        duration: 2000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
                      });
                }
                this.isButtonDisabled = false;
                this.loginLoading = false;
            },
            err => {
                this.snackBar.open('Document Upload failed', 'close', {
                    duration: 2000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
                });
                this.isButtonDisabled = false;
                this.loginLoading = false;
            }
            )
        } catch (error) {
            this.snackBar.open('Document Upload failed', 'close', {
                duration: 2000, panelClass:'error', horizontalPosition: 'end', verticalPosition: 'top'
            });
            this.isButtonDisabled = false;
            this.loginLoading = false;
        }

    }
  }
