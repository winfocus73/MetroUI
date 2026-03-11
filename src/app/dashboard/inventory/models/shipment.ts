export interface IShipment{
    invoiceNum:string;
    poNumber:string;
    carrierName:string;
    receivedDate:string;
    vendor:string;
    vehicleNum:string;
    location:string;
    status:string;

}

// export interface IShipment {
//   shipmentId: number;
//   invoiceNum: string;
//   poNumber: string;
//   vendor: number;
//   vendorName?: string;
//   carrierName: string;
//   vehicleNum: string;
//   driverName: string;
//   mobile: string;
//   recivedDate: Date;
//   status: number;
//   statusName?: string;
//   locationName?: string;
//   remarks: string;
//   preparedBy: string;
//   preparedDate: Date;
//   reviewedBy: string;
//   reviewedDate: Date;
//   approvedBy: string;
//   approvedDate: Date;
// }


export interface IShipmentSearchList{
 totalRows: number;
    pageNo: number;
    results: IShipment[];
}
export interface IPONumberDropdown {
  name: string;
  id?: number;
  poNumber?: string;
}
export interface IShpList {
  id: number;
  name: string;
}
export interface IVoicList {
  id: number;
  name: string;
}