import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { IWorkorderDetails } from "../../../dashboard/planning-scheduling/work-order/models/work-order-details";
import { ICommonRequest, IGetAddEditResponse, ILookupValue, IRequest } from "@shared/models";
import { WorkOrderService } from "../../../dashboard/planning-scheduling/work-order/services/work-order.service";
import { IWLabor } from "../../../dashboard/planning-scheduling/work-order/models/labor";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Constants } from "src/app/core/http/constant";
import { IAssetPartType } from "@dashboard/config-assets/models/part-types/part-type";
import { AssetService } from "@dashboard/config-assets/services/asset.service";
import { CommonService } from "@shared/services/common.service";
import { MaintenanceConfigService } from "@dashboard/configuration-maintenance/services/maintenanceconfig.service";
import { ICarft } from "@dashboard/configuration-maintenance/models/carft";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AssetPartTypesComponent } from "@dashboard/config-assets/components/part-types/part-types.component";
import { AssetPartTypesPopupComponent } from "@dashboard/config-assets/components/part-types/popup/part-types-popup.component";
import { IWNotes } from "../../../dashboard/planning-scheduling/work-order/models/wo-notes";
import * as moment from "moment";
import { ILoginData } from "@auth/models/login.response";

@Component({
  selector: 'nxasm-work-order-notes',
  templateUrl: './work-order-notes.component.html',
  styleUrls: ['./work-order-notes.component.scss'],
})
export class WorkorderNotesComponent implements OnChanges {
  @Input() WorkorderId!: number;
  @Input() objectId!: number; // objid is  wo id / sr id / ptw id
  @Input() type!: string;
  @Input() workOrderDetails: IWorkorderDetails = {} as IWorkorderDetails;
  //@Input() userRoleId!: number;
  //@Input() UserInfo: any;
  @Output() backtoEditForm = new EventEmitter();
  @Input() isNoteBtn = false;
  notesData: IWNotes[] = [];
  dateFormat = 'YYYY-MM-DDTHH:mm:ss';
  maddEditResponse: IGetAddEditResponse = {} as IGetAddEditResponse;
  laddEditResponse: IGetAddEditResponse = {} as IGetAddEditResponse;
  assetpartTypes: IAssetPartType[] = [];
  dropMeasureUnit: ILookupValue[] = [];
  dropSkillLevels: ILookupValue[] = [];
  dropCarfts: ICarft[] = [];
  dialogRef!: MatDialogRef<AssetPartTypesPopupComponent>;
  LoginUserInfo: ILoginData = {} as ILoginData;
  constructor(private workorderService: WorkOrderService, private snackBar: MatSnackBar,
    private commonService: CommonService, private assetService: AssetService, private dialog: MatDialog,
    private maintenanceConfigService: MaintenanceConfigService) { }

  

  ngOnChanges() {
    this.LoginUserInfo = this.commonService.loginStorageData;
    if (this.objectId && this.objectId > 0) {
      //if (this.workOrderDetails.id > 0) {
        this.getNotesData();
        //this.getAssetPartTypesData();
      //}
    }
  }


  getNotesData() {
    let workorderRequest: ICommonRequest = {} as ICommonRequest;    
    const reqdata: IRequest[] = [
      { key: "ObjectId", value: this.objectId > 0 ? this.objectId.toString() : '' },
      { key: "Kind", value: this.type}      
    ]
    workorderRequest.Params = reqdata;
    this.workorderService.getWorkorderNotesDetails(workorderRequest).subscribe((res) => {
      if (res) {
        this.notesData = res;
      }
    });
  }
  
  saveData() {
    this.notesDateSave();
  }

  notesDateSave() {
    try {           
      let woNote = this.notesData.find(e => e.id == 0)
      if (!woNote || !woNote.comment ) return;
      woNote.date = moment(woNote.date).format(this.dateFormat);
      woNote.commentorName = this.LoginUserInfo.loginData.userName || this.LoginUserInfo.loginData.staffName;
      woNote.type = this.type;
      woNote.objectId = this.objectId; // objid is  wo id / sr id / ptw id
      console.log("lsaveData..", woNote);
      this.workorderService.saveWorkorderNote(woNote).subscribe((res) => {
        this.maddEditResponse = res;
        if (res.status > 0) {
          if (this.objectId > 0) {
            this.snackMsg(Constants.materialSuccess, 'success');
            this.backtoEditForm.emit('success');
            this.getNotesData();
          }
        } else {
          this.snackMsg(Constants.materialError, 'error');
        }
      },
        (err) => {
          this.snackMsg(Constants.materialError, 'error');
        });
    } catch (error) {
      this.snackMsg(Constants.materialError, 'error');
    }
  }

  snackMsg(msg: string, type: string) {
    this.snackBar.open(msg, 'close', {
      duration: 2000, panelClass: type, horizontalPosition: 'end', verticalPosition: 'top'
    });
  }

  addNote() {
    if( this.notesData.some(e => e.id == 0)) return;
    let noteItem: IWNotes = {
      id: 0,
      date:  moment().toString(),
      commentedBy: this.LoginUserInfo.loginData.id,
      commentorName: this.LoginUserInfo.loginData.userName || this.LoginUserInfo.loginData.staffName,
      comment: '',
      type: '',
      objectId: 0
    }
    this.notesData.push(noteItem);
  }
editNotes(id:number, comment:string){
    try {           
      //this.notesData.find(e => e.id == 0)
      //if (!woNote || !woNote.comment ) return;
      let noteItem: IWNotes = {
      id: id,
      date: moment().format(this.dateFormat).toString(),
      commentedBy: this.LoginUserInfo.loginData.id,
      commentorName: this.LoginUserInfo.loginData.userName || this.LoginUserInfo.loginData.staffName,
      comment: comment,
      type: this.type,
      objectId: this.objectId
      }
      console.log("lsaveData..", noteItem);
      this.workorderService.editWorkorderNote(noteItem).subscribe((res) => {
        this.maddEditResponse = res;
        if (res.status > 0) {
          if (this.objectId > 0) {
            this.snackMsg(Constants.materialSuccess, 'success');
            this.backtoEditForm.emit('success');
            this.getNotesData();
          }
        } else {
          this.snackMsg(Constants.materialError, 'error');
        }
      },
        (err) => {
          this.snackMsg(Constants.materialError, 'error');
        });
    } catch (error) {
      this.snackMsg(Constants.materialError, 'error');
    }
  }
}