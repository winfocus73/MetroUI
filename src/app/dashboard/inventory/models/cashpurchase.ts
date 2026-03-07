// In your purchase-order.model.ts file
export interface IPurchaseOrderLineItem {
    id?: number; // poliId from API
    poliId?: number; // Add this to match API
    poId: number;
    itemTypeId: number;
    itemTypeName: string;
    categoryId: number;
    categoryName: string;
    itemId: number;
    itemName: string;
    description?: string;
    uom?: string;
    uomId?: number; // Add this
    uomName?: string; // Add this
    testLab?: boolean;
    quantity: number;
    orderedQty?: number; // Add this to match API
    unitCost: number;
    totalAmount: number;
    totalPrice?: number; // Add this to match API
    remarks?: string;
    createdUserId?: number;
    createdUserName?: string;
    updatedUserId?: number;
    updatedUserName?: string;
    updatedDatetime?: string;
    isSerialized?: boolean;
}

export interface IPurchaseOrderHeader {
    poID: number;
    poNumber: string;
    orderDate: string;
    statusId: number;
    statusName: string;
    requiredDate: string;
    remarks: string;
    vendorId: number;
    vendorName: string;
    priorityId: number;
    priorityName: string;
    locationId: number;
    locationName: string;
    estimateCost: number;
    createdUserId: number;
    createdUserName: string;
    createdDatetime: string;
    shipTo: string;
    isComplete: boolean;
}

export interface IPurchaseOrderDetailsResponse {
    header: IPurchaseOrderHeader;
    lineItems: IPurchaseOrderLineItem[];
}

export interface IPurchaseOrderAddEdit {
  id: number;
  poNumber: string;
  poRemarks: string | null;
  poDate: string | null;
  poRequiredDate: string | null;
  poVendorId: number;
  poStatusId: number;
  poPriorityId: number;
  poEstimateCost: number;
  poLocationId: number;
  poCreatedUserId: number;
  poCreatedDatetime: string;
  poUpdatedUserId: number;
  poUpdatedDatetime: string;
  poFrightTerms: number | null;
  poPaymentTerms: number | null;
  poShipTo: string | null;
  poBillTo: string | null;
  vendorName?: string;
  statusName?: string;
  priorityName?: string;
  locationName?: string;
  lineItems: IPurchaseOrderLineItem[];
}

export interface IItemType {
  id: number;
  name: string;
  code: string;
}

export interface ICategory {
  id: number;
  name: string;
  code: string;
  itemTypeId: number;
}

export interface IPurchaseOrder {
  id: number;
  poNumber: string;
  poDate: string;
  poRequiredDate: string;
  vendorId: number;
  vendorName: string;
  statusId: number;
  statusName: string;
  priorityId: number;
  priorityName: string;
  locationId: number;
  locationName: string;
  estimateCost: number;
  remarks: string;
  createdUserId: number;
  createdDatetime: string;
  updatedUserId: number;
  updatedDatetime: string;
  frightTerms: number;
  paymentTerms: number;
  shipTo: string;
  billTo: string;
}

export interface IPurchaseOrderSearchList {
  results: string;
  totalRows: number;
}

export interface IVendor {
  id: number;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface IPurchaseOrderStatus {
  id: number;
  name: string;
}

export interface IPriority {
  id: number;
  name: string;
  code: string;
}

export interface ILocation {
  locationName: any;
  id: number;
  name: string;
  code: string;
  address: string;
}


export interface IItemType {
  id: number;
  name: string;
}

export interface ICategory {
  id: number;
  name: string;
  // Add other properties if needed
}

export interface IItemTypeData {
  itemtype_id: number;
  itemtype_name: string;
  itemtype_desc: string;
  itemtype_uom: number;
  // Add categoryId if it's returned from API
  categoryId?: number;
  itemTypeId?: number;
  itemtype_uom_name: string; 
  itemtype_uom_id:number
}

//Cash Purchases Iterfaces


 export interface ICashPurchaseSearchList{
  results: ICashPurchase[];   
  totalRows: number;
}
 export interface ICashPurchase {
  recId: number;
  recSourcetype: string;
  recSourceNum: string;
  recTranstype: number;
  recTransDate: string;
  recRefId: number;
  recInvoicenum: string;
  recVendorId: number;
  recItemType: number;
  recCatId: number;
  recItemId: number;
  recUom: number;
  recBatchno: string;
  recQty: number;
  recUnitcost: number;
  recLinecost: number;
  recIsserialized: boolean;
  recSerialno: string;
  recMfgDate: string;
  recMake: string;
  recWarrentyDate: string;
  recLocation: number;
  recRemarks: string;
  recWoNum: string;
  recCreatedUser: number;
  recCreateDatetime: string;
  recUpdatedUser: string;
  recUpdatedDatetime: string;
}
export interface ICPNumList {
  rec_id: number;
  rec_source_num: string;
}
export interface ICPList{
   header: ICashPurchaseHeader;
}

export interface ICashPurchaseHeader {
 recId: number;
  recSourcetype: string;
  recSourceNum: string;
  recTranstype: number;
  recTransDate: string;
  recRefId: number;
  rec_invoicenum: string;
  recVendorId: number;
  recItemType: number;
  recCatId: number;
  recItemId: number;
  recUom: number;
  recBatchno: string;
  recQty: number;
  recUnitcost: number;
  recLinecost: number;
  recIsserialized: boolean;
  recSerialno: string;
  recMfgDate: string;
  recMake: string;
  recWarrentyDate: string;
  recLocation: number;
  recRemarks: string;
  recWoNum: string;
  recCreatedUser: number;
  recCreateDatetime: string;
  recUpdatedUser: string;
  recUpdatedDatetime: string;
}
export interface ICashRequest{


}