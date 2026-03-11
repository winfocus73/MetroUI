export interface IMaterialRequisitionReg {
//   id: number;
  mrId: number;
  mrNumber: string;
  mrDate: string;
  requiredDate: string;
  mrDeptId: number;
  unitName: string;
  mrStatusId: number;
  statusName: string;
  priorityId: number;
  priorityName: string;
  locationId: number;
  locationName: string;
  woNUm: string;
  remarks: string;
  createdUserId: number;
  createdDatetime: string;
  updatedUserId: number;
  updatedDatetime: string;
  createdOn: string;
  createdbyName : string;
  createdby_id : number;
}

 export interface IMaterialRequisitionSearchList{
    totalRows: number;
    pageNo: number;
    results: IMaterialRequisitionReg[];
 }
 export interface IMaterialRequisitionLineItem {
  id: number;
  mrId: number;
  itemTypeId: number;
  itemTypeName: string;
  categoryId: number;
  categoryName: string;
  itemName: string;
  description: string;
  mrliId: number;
  itemId: number;
  itemTypeUomId?: number;
  uom: string;
  uomName: string;
  uomId: number;
  quantity: number;
  remarks: string;
createdUserId: number;
createdUserName: string;
updatedUserId: number;
updatedUserName: string;
updatedDatetime: string;
//requestedQty: number;
isSerialized?: string | undefined;
  action?: string;
}

export interface IMaterialRequisitionAddEdit {
  id: number;
  mrNumber: string;
  mrRemarks: string | null;
  mrDate: string | null;
  requiredDate: string | null;
  mrDeptId: number;
  StatusId: number;
  PriorityId: number;
  woNum: string;
  LocationId: number;
  CreatedUserId: number;
  CreatedDate: string;
  UpdatedUserId: number;
  UpdatedDatetime: string;
  unitName?: string;
  statusName?: string;
  priorityName?: string;
  locationName?: string;
  lineItems: IMaterialRequisitionLineItem[];
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
export interface IMaterialRequisition {
  id: number;
  mrNumber: string;
  mrDate: string;
  mrRequiredDate: Date;
  mrRequestedDate: Date;
  mrDeptId: number;
  mrDeptName: string;
  statusId: number;
  statusName: string;
  priorityId: number;
  priorityName: string;
  locationId: number;
  locationName: string;
  remarks: string;
  createdUserId: number;
  createdDate: string;
  updatedUserId: number;
  updatedDate: string; 
}

export interface IVendor {
  id: number;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface IMRStatus {
  id: number;
  name: string;
}

export interface IPriority {
  id: number;
  name: string;
  code: string;
}

export interface ILocation {
  id: number;
  name: string;
  code: string;
  address: string;
}
export interface ISesstionList {

}
export interface IItemTypeData {
  itemtype_id: number;
  itemtype_name: string;
  itemtype_desc: string;
  itemtype_uom: string;
  categoryId?: number;
  itemTypeId?: number;
  itemtype_uom_id?: number;
}
export interface IMaterialRequisitionHeader {
    mrID: number;
    mrNumber: string;
    mrDate: string;
    mrstatusId: number;
    statusName: string;
    requiredDate: string;
    remarks: string;
    unitId: number;
    unitName: string;
    priorityId: number;
    priorityName: string;
    locationId: number;
    sectionCategoryId: number;
    receivedQty: number;
    locationName: string;
    sectionId:string;
    woNum: string;
    categoryId: number;
    createdUserId: string;
    createdUserName: string;
    createdDatetime: string;
    isComplete: boolean;
    departmentId:number;
    departmentName:string;
    statusId:number;
    requestedDate:string;
}

export interface IMaterialRequisitionDetailsResponse {
    header: IMaterialRequisitionHeader;
    lineItems: IMaterialRequisitionLineItem[];
}
export interface IMaterialRequisitionStatus {
  id: number;
  name: string;
}
export interface IMRNumberDropdown {
  name: string;
  id?: number;
  mrNumber?: string;
}
export interface ISessionsList {
  code: string;
  value: string;
}