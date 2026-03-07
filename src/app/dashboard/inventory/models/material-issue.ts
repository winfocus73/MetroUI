export interface IMaterialIssue {
  issueId?: number;
  issueNumber: string;
  issueDate: string | null;
  fromLocation: string;
  fromLocationName?: string;
  mrNumber: string;
  toDepartment: string;
  toDepartmentName?: string;
  status: string;
  statusName?: string;
  remarks?: string;
  preparedBy: string;
  preparedDate: string | null;
  approvedBy?: string;
  approvedDate?: string | null;
  items?: IMaterialIssueItem[];
  serialItems?: IMaterialIssueSerialItem[];
}

export interface IMaterialIssueItem {
  itemNum: string;
  itemDesc: string;
  uom: string;
  isSerialized: string;
  orderQty: number;
  selected?: boolean;
  batchNo?: string;
  qoh?: number | null;
  issuedQty?: number | null;
}

export interface IMaterialIssueSerialItem {
  sno?: number;
  item: string;
  serialNum: string;
  mfgDate?: string;
  modelNum?: string;
  make?: string;
}

// material-issue.model.ts

export interface IMaterialIssueLineItem {
  id?: number; // issueItemId from API
  issueItemId?: number;
  Id: number;
  itemTypeId: number;
  itemTypeName: string;
  categoryId: number;
  categoryName: string;
  itemId: number;
  itemName: string;
  description?: string;
  uom?: string;
  uomId?: number;
  uomName?: string;
  quantity: number;
  issuedQty?: number;
  unitCost: number;
  totalAmount: number;
  totalPrice?: number;
  remarks?: string;
  createdUserId?: number;
  createdUserName?: string;
  updatedUserId?: number;
  updatedUserName?: string;
  updatedDatetime?: string;
  isSerialized?: boolean;
  batchNumber?: string;
  expiryDate?: string;
}

export interface IMaterialIssueHeader {
  issueId: number;
  issueNumber: string;
  issueDate: string;
  statusId: number;
  statusName: string;
  departmentId: number;
  departmentName: string;
  locationId: number;
  locationName: string;
  remarks: string;
  requestedBy?: string;
  approvedBy?: string;
  createdUserId: number;
  createdUserName: string;
  createdDatetime: string;
  updatedUserId?: number;
  updatedUserName?: string;
  updatedDatetime?: string;
  isComplete: boolean;
}

export interface IMaterialIssueDetailsResponse {
  header: IMaterialIssueHeader;
  lineItems: IMaterialIssueLineItem[];
}

export interface IMaterialIssueAddEdit {
  id: number;
  issueNumber: string;
  issueRemarks: string | null;
  issueDate: string | null;
  departmentId: number;
  statusId: number;
  locationId: number;
  requestedBy?: string;
  approvedBy?: string;
  createdUserId: number;
  createdDatetime: string;
  updatedUserId?: number;
  updatedDatetime?: string;
  departmentName?: string;
  statusName?: string;
  locationName?: string;
  lineItems: IMaterialIssueLineItem[];
}

// In your material-issue.model.ts
export interface IMaterialIssueReg {
  issueId: number;
  id?: number;
  issueNumber: string;
  issueDate: string;
  issuedDate?: string; // Keep for compatibility
  statusId: number;
  statusName: string;
  locationId: number;
  locationName: string;
  sectionId: number; // Add this
  sectionName: string; // Add this (this is your department)
  mrId?: number;
  remarks?: string;
  createdBy?: number;
  createdDate?: string;
  // Keep these for backward compatibility
  departmentId?: number;
  departmentName?: string;
}

export interface IMaterialIssueSearchList {
  results: IMaterialIssueReg[] | any[];
  totalRows: number;
}

export interface IDepartment {
  id: number;
  departmentId?: number;
  departmentName: string;
  name?: string;
  code?: string;
  description?: string;
}

export interface IMaterialIssueStatus {
  id: number;
  name: string;
  code?: string;
}

export interface IIssueNumberDropdown {
  name: string;
  id?: number;
  issueNumber?: string;
  issueNum?: string;
}

export interface IItemTypeData {
  itemtype_id: number;
  itemtype_name: string;
  itemtype_desc: string;
  itemtype_uom: string;
  categoryId?: number;
  itemTypeId?: number;
}

// Additional interfaces for dropdowns and lookups
export interface IRequestedBy {
  id: number;
  name: string;
  userId?: number;
  userName?: string;
}

export interface IApprovedBy {
  id: number;
  name: string;
  userId?: number;
  userName?: string;
}

// Constants for Material Issue
export const MATERIAL_ISSUE_CONSTANTS = {
  STATUS: {
    PREPARED: 1,
    REVIEWED: 2,
    APPROVED: 3,
    REJECTED: 4,
    COMPLETED: 5,
    CANCELLED: 6,
  },
};
