import { Component } from '@angular/core';
import { Column } from '@shared/models';

@Component({
  selector: 'app-shipment-details',
  templateUrl: './shipment-details.component.html',
  styleUrls: ['./shipment-details.component.scss']
})
export class ShipmentDetailsComponent {


  shipmentDetail: Array<Record<string, any>> = [
  {
    index: 1,
    itemType: 'Electronics',
    itemCategory: 'Laptop',
    itemNum: 'LT1001',
    itemDesc: 'Dell Latitude 5420',
    uom: 'Nos',
    isSerialised: 'Yes',
    orderQty: 10,
    receivedQty: 8,
    testRequired: 'Yes',
    isLink: false
  },
  {
    index: 2,
    itemType: 'Electronics',
    itemCategory: 'Monitor',
    itemNum: 'MN2001',
    itemDesc: 'HP 24 inch Monitor',
    uom: 'Nos',
    isSerialised: 'Yes',
    orderQty: 15,
    receivedQty: 15,
    testRequired: 'No',
    isLink: false
  },
  {
    index: 3,
    itemType: 'Furniture',
    itemCategory: 'Chair',
    itemNum: 'CH3001',
    itemDesc: 'Office Ergonomic Chair',
    uom: 'Nos',
    isSerialised: 'No',
    orderQty: 20,
    receivedQty: 18,
    testRequired: 'No',
    isLink: false
  },
  {
    index: 4,
    itemType: 'Electronics',
    itemCategory: 'Printer',
    itemNum: 'PR4001',
    itemDesc: 'Canon Laser Printer',
    uom: 'Nos',
    isSerialised: 'Yes',
    orderQty: 5,
    receivedQty: 5,
    testRequired: 'Yes',
    isLink: false
  },
  {
    index: 5,
    itemType: 'Networking',
    itemCategory: 'Router',
    itemNum: 'RT5001',
    itemDesc: 'Cisco WiFi Router',
    uom: 'Nos',
    isSerialised: 'Yes',
    orderQty: 12,
    receivedQty: 10,
    testRequired: 'Yes',
    isLink: false
  }
];



//  shipmentDetail:any;
  shipmentDetailId:any;
  isNotFound = false;
  objSearch = {
      PageNo: 1,
      PageSize: 1,
      TotalRecords: 0
   }

  tableColumns: Array<Column> = [
      {
        columnDef: 'index',
        header: 'Receipt Num',
        cell: (element: Record<string, any>) => ''
      },
      {
        columnDef: 'itemType',
        header: 'Item Type',
        cell: (element: Record<string, any>) => `${element['itemType']}`
      },
      {
        columnDef: 'itemCategory',
        header: 'Item Category',
        cell: (element: Record<string, any>) => `${element['itemCategory']}`
      },
      {
        columnDef: 'itemNum',
        header: 'Item Num',
        cell: (element: Record<string, any>) => `${element['itemNum']}`
      },
      {
        columnDef: 'itemDesc',
        header: 'Item Desc',
        cell: (element: Record<string, any>) => `${element['itemDesc']}`
      },
      {
        columnDef: 'uom',
        header: 'UOM',
        cell: (element: Record<string, any>) => `${element['uom']}`
      },
      {
        columnDef: 'isSerialised',
        header: 'Is Serialised',
        cell: (element: Record<string, any>) => `${element['isSerialised']}`
      },
      {
        columnDef: 'orderQty',
        header: 'Order Qty',
        cell: (element: Record<string, any>) => `${element['orderQty']}`
      },
      {
        columnDef: 'receivedQty',
        header: 'Received Qty',
        cell: (element: Record<string, any>) => `${element['receivedQty']}`
      },
      {
        columnDef: 'testRequired',
        header: 'Test Required',
        cell: (element: Record<string, any>) => `${element['testRequired']}`
      },
      // {
      //   columnDef: 'isLink',
      //    header: 'Select',
      //   isEditbtn:true,
      //   cell: () => '',
      //    isEditLink: true,
      // }
    ];

    pageChanged(obj: any) {
      this.objSearch.PageSize =  obj.pageSize;
      this.objSearch.PageNo = obj.pageIndex;
      // this.getAssetRegistryList();
    }


    editAssetId(id: any) {
      // const asset = this.shipmentDetail.filter((x: { assetNo: any; })=>x.assetNo == id);
      // if(asset.length > 0) {
      //   this.shipmentDetailId = asset[0].id;
      // } else {
      //   this.shipmentDetailId = parseInt(id);
      // }
      // this.shipmentDetailId = true;
    }

    refreshTableData(e: any) {
     // this.getAssetRegistryList();
    }


}
