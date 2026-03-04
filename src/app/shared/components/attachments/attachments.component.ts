import { Component, Input, Output, EventEmitter } from "@angular/core";
import { environment } from "src/environments/environment";
import { IAttachement } from "@shared/models/attachment";
import { UploadComponent } from "../upload/upload.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { PdfviewComponent } from "./pdfview/pdfview.component";
import { IDropdown } from "@shared/models";
import { ConfirmDialogComponent } from "@shared/utils/dialogs/confirm-dialog/confirm-dialog.component";
import { UploadService } from "@shared/services/upload.Service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'nxasm-attachements',
    templateUrl: './attachments.component.html',
    styleUrls: ['./attachments.component.scss'],
  })
  export class AttachmentsComponent {

    @Input() attachments: IAttachement[] =[];
    @Input() objectId: number = 0;
    @Input() kind!: string;
    @Input() status!: string;
    @Input() isUploadBtn = false;
    @Input() isDeleteBtn = false;
    @Input() objectNo!: string;
    @Output() attachemntload = new EventEmitter();
    @Input() assetItems!: IDropdown[];
    uploadDialogRef!: MatDialogRef<UploadComponent>;
    imagePath = `${environment.imagePath}`
    type!:string;
    data!: string;
    ackConfirmDialogRef!: MatDialogRef<ConfirmDialogComponent>;
    constructor(public dialog: MatDialog, private uploadService: UploadService, private snackBar: MatSnackBar) {}
    UploadDocuments(){
      this.uploadDialogRef = this.dialog.open(UploadComponent, {
        width: '50%',disableClose: true,
        data: {kindId: this.objectId.toString(), kind: this.kind, objectNo: this.objectNo }
      });
      this.uploadDialogRef.componentInstance.assetItems = this.assetItems?this.assetItems: <any>[];
      this.uploadDialogRef.afterClosed().subscribe(result => {
        this.uploadDialogRef.close();
        this.attachemntload.emit(true);
      });
    }

    view(name: string, data: string) {
      this.type =name.split('.')[1];
      this.data =  this.imagePath +  data;
      //const modalRef = this.dialog.open(content);
      //if(this.type=='pdf') {
      this.openDialog(this.data);
      //}
    }

    openDialog(data: any): void {
      const dialogRef = this.dialog.open(PdfviewComponent, {
        width: '100%',
        data: {
          url: data,
          type: this.type
        },
        hasBackdrop: true,

      });

      dialogRef.afterClosed().subscribe(result => {
        //this.read = result;
      });
    }

    deleteDoc(code: string) {
      this.ackConfirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          body: `Are you sure, you want to delete this document`,
          title: 'Delete Document',
        },
      });
      this.ackConfirmDialogRef.afterClosed().subscribe((res) => {
        console.log(res);
        if(res) {
          this.uploadService.DeleteDocument(code).subscribe((res) => {
            if(res && res.status == 1) {
              this.snackBar.open(res.message, 'close', {
                duration: 2000, panelClass:'success', horizontalPosition: 'end', verticalPosition: 'top'
              });
              this.attachemntload.emit(true);
            }
          })
        }
      });
    }

    // view(content: any) {
    //   //this.config.backdrop = 'static';
    //   //this.config.keyboard = false;
    //   const modalRef = this.dialog.open(content, { data: {id: this.permittoWorkId}, ariaLabelledBy: 'modal-basic-title' });
    // }
  }
