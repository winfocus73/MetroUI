import { Component, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Column } from 'src/app/shared/models/column';
import { ICommonRequest, IRequest } from '@shared/models';
import { AssetService } from '@dashboard/config-assets/services/asset.service';
import { IAssetHistoryModel } from '@shared/models/asset-history';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IAssetDetails } from '@dashboard/asset-registry/models/assets';

@Component({
  selector: 'nxasm-asset-hisoty-common',
  templateUrl: './asset-history.component.html',
  styleUrls: ['./asset-history.component.scss']
})
export class AssetHistoryComponent implements OnInit {
  @Input() assetId = 0;
  assetHistoryData: IAssetHistoryModel[] =[];
  rowData: any;
  @ViewChild('numberTpl', { static: true }) numberTpl!: TemplateRef<any>;
  tableColumns: Array<Column> = [];
  constructor(private assetService: AssetService, @Inject(MAT_DIALOG_DATA) public data: any,
  private dialog: MatDialogRef<AssetHistoryComponent>, private snackBar: MatSnackBar,
  private router: Router) {
    this.assetId = data.id;
    this.rowData = data.rowData;
  }
  assetDetailsData: IAssetDetails = {} as IAssetDetails;
  isNoHistory = false;
  isProGressNoHistory = false;
  ngOnInit(): void {
    this.tableColumns =  [
      {
        columnDef: 'index',
        header: 'No',
        cell: (element: Record<string, any>) => ''
      },
      {
        columnDef: 'HistDate',
        header: 'Date',
        isDateTime: true,
        cell: (element: Record<string, any>) => `${element['HistDate']}`
      },
      {
        columnDef: 'Activity',
        header: 'Kind',
        cell: (element: Record<string, any>) => `${element['Activity']}`
      },
      {
        columnDef: 'WoNo',
        header: 'Ref.No',
        template: this.numberTpl,
        cell: (element: Record<string, any>) => `${element['WoNo']}`
      },
      {
        columnDef: 'Schedule',
        header: 'Schedule ',
        cell: (element: Record<string, any>) => `${element['Schedule']}`
      },
      {
        columnDef: 'Location',
        header: 'Location ',
        cell: (element: Record<string, any>) => `${element['Location']}`
      },
      {
        columnDef: 'Remarks',
        header: 'Remarks ',
        cell: (element: Record<string, any>) => `${element['Remarks']}`
      },

    ]
      this.getAssetsData();
  }


  getAssetsData() {
    this.isNoHistory = false;
    const request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
        {
          key: 'AssetId', value: this.assetId > 0 ? this.assetId.toString() : ''
        }
    ]
    request.Params = reqdata;
    this.assetService.getAssetDetailsbyID(request).subscribe((res) => {
      this.assetDetailsData = res;
      if(res && res.history) {
        this.assetDetailsData.objHistory = JSON.parse(res.history);
      } else {
        this.isNoHistory = true;
      }
      if(res && res.progressHistory) {
        this.assetDetailsData.progressHistory = JSON.parse(<any>res.progressHistory);
      } else {
        this.isProGressNoHistory = true;
      }
      if(res && res.nextSchDue) {
        this.assetDetailsData.objNextSchDue = JSON.parse(res.nextSchDue);
      }
      if(res && res.lastSch) {
        this.assetDetailsData.objlastSch = JSON.parse(res.lastSch);
      }
      if(res && res.lastMinor) {
        this.assetDetailsData.lastMinorSch = JSON.parse(res.lastMinor);
      }
  });
    // this.assetService.getAssetHistory(request).subscribe((res) => {
    //   this.assetHistoryData = res;
    //   if(this.assetHistoryData.length ==0) {
    //     this.close();
    //     this.snackBar.open('No Records Found', 'close', {
    //         duration: 2000, panelClass:'success', horizontalPosition: 'end', verticalPosition: 'top'
    //     });
    //   }
    // });
  }

  edit(event: any, context?:any) {
    // alert(event);

     if(context.row.Activity === 'SR') {
      this.dialog.close();
       this.router.navigate(['/dashboard/s-r/service-requests'], { state: event });
     } else if(context.row.Activity === 'WO') {
      this.dialog.close();
       this.router.navigate(['dashboard/p-s/work-orders/open'], { state: event });
       //this.router.navigate(['dashboard/p-s/work-orders', {woid: clickInfo.event.id }, ]);
     } else if(context.row.Activity === 'PTW') {
      this.dialog.close();
       this.router.navigate(['dashboard/p-s/permit-to-work'], { state: event });
     }
   }

  close() {
    this.dialog.close();
  }
}
