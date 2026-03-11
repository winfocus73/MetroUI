export class Constants {
  // static SHIPMENT_SEARCH_LIST(SHIPMENT_SEARCH_LIST: any, objSearch: any) {
  //   throw new Error('Method not implemented.');
  // }
  static LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'sp', name: 'Español' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'te', name: 'తెలుగు' },
  ];

  // Regular expressions
  static emailRegx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  //cash purches
  static CASH_PURCHASE_LIST_FILTER_OBJECT = 'cashPurchaseListFilterObject';
  //Material issue
  static MATERIAL_ISSUE_LIST_FILTER_OBJECT = 'materialIssueListFilterObject';
  static SHIPMENT_SEARCH_LIST="SHIPMENT_LIST_SEARCH";
   static MATERIAL_REQUISITION_FILTER_OBJECT = 'materialRequisitionFilterOptions';

  static success = 'success';
  static error = 'error';
  static warning = 'warning';
  // User
  static addUsertitle = 'Add user';
  static updateUsertitle = 'Update user';
  static addUserSuccess = 'User added successfully';
  static updateUserSuccess = 'User updated successfully';
  static userError = 'User adding/updating failed';

  //vendor
  static addVendorSuccess = 'Vendor added successfully';
  static updateVendorSuccess = 'Vendor updated successfully';
  static vendorError = 'Vendor adding/updating failed';
  //fault
  static addFaultCodeSuccess = 'Fault Code added successfully';
  static updateFaultCodeSuccess = 'Fault Code updated successfully';
  static faultCodeError = 'Fault Code adding/updating failed';

  //oem
  static addOEMSuccess = 'OEM added successfully';
  static updateOEMSuccess = 'OEM updated successfully';
  static oemAddOrUpdateError = 'OEM adding/updating failed';

  // staff
  static addStafftitle = 'Add staff';
  static updateStafftitle = 'Update staff';
  static addStaffSuccess = 'Staff added successfully';
  static updateStaffSuccess = 'Staff updated successfully';
  static staffError = 'Staff adding/updating failed';
  static addStaffQualSuccess = 'Staff Qualification added successfully';
  static updateStaffQualSuccess = 'Staff Qualification updated successfully';
  static StaffQualError = 'Staff Qualification adding/updating failed';

  // staff
  static addRoutetitle = 'Add Route';
  static updateRoutetitle = 'Update Route';
  static addRouteSuccess = 'Route added successfully';
  static updateRouteSuccess = 'Route updated successfully';
  static routeError = 'Route adding/updating failed';

  // role
  static addRoletitle = 'Add role';
  static updateRoletitle = 'Update role';
  static addRoleSuccess = 'Role added successfully';
  static updateRoleSuccess = 'Role updated successfully';
  static roleError = 'Role adding/updating failed';

  //craft
  static addCraftSuccess = 'Craft added successfully';
  static updateCraftSuccess = 'Craft updated successfully';
  static craftAddEditError = 'Craft adding/updating failed';

  //location
  static addLocationSuccess = 'Location added successfully';
  static updateLocationSuccess = 'Location updated successfully';
  static locationError = 'Location adding/updating failed';

  // Asset Location
  static addAssetLocationtitle = 'Add Asset Location';
  static updateAssetLocationtitle = 'Update Asset Location';
  static addAssetLocationSuccess = 'Asset Location added successfully';
  static updateAssetLocationSuccess = 'Asset Location updated successfully';
  static assetLocationError = 'Asset Location adding/updating failed';

  // Asset Part Type
  static addAssetPartTypetitle = 'Add Asset PartType';
  static updateAssetPartTypetitle = 'Update Asset PartType';
  static addAssetPartTypeSuccess = 'Asset PartType added successfully';
  static updateAssetPartTypeSuccess = 'Asset PartType updated successfully';
  static assetPartTypeError = 'Asset PartType adding/updating failed';
  static assetUnderMonitoringRemarkUpdateError =
    'AssetS under monitoring adding/updating failed';
  static assetUnderMonitoringRemarkUpdateSuccess =
    'AssetS under monitoring remark updated successfully';

  // Asset Type
  static addAssetTypetitle = 'Add Asset Type';
  static updateAssetTypetitle = 'Update Asset Type';
  static addAssetTypeSuccess = 'Asset Type added successfully';
  static updateAssetTypeSuccess = 'Asset Type updated successfully';
  static assetTypeError = 'Asset Type adding/updating failed';

  // WorkFlow Template
  static addWFTtitle = 'Add WorkFlow Template';
  static updateWFTtitle = 'Update WorkFlow Template';
  static addWFTSuccess = 'WorkFlow Template added successfully';
  static updateWFTSuccess = 'WorkFlow Template updated successfully';
  static WFTError = 'WorkFlow Template adding/updating failed';

  // WorkFlow Template
  static addMMSTtitle = 'Add Master Maintenance Plan';
  static updateMMStitle = 'Update Master Maintenance Plan';
  static addMMSSuccess = 'Master Maintenance Plan added successfully';
  static updateMMSSuccess = 'Master Maintenance Plan updated successfully';
  static MMSError = 'Master Maintenance Plan adding/updating failed';

  static addJobSuccess = 'JobPlan added successfully';
  static updateJobSuccess = 'JobPlan updated successfully';
  static addJobError = 'JobPlan adding failed';

  static addSafetySuccess = 'SafetyPlan added successfully';
  static updateSafetySuccess = 'SafetyPlan updated successfully';
  static addSafetyError = 'SafetyPlan adding failed';
  // WorkOrder
  static submitWorkorderSuccess = 'Workorder Submitted successfully';
  static submitWorkorderError = 'Workorder Submitting failed';
  static approvedWorkorderSuccess = 'Workorder Approved successfully';
  static approvedWorkorderError = 'Workorder Approving failed';
  static startWorkorderSuccess = 'Workorder request Started successfully';
  static assignWorkorderSuccess = 'Workorder request Assigned successfully';
  static startWorkorderError = 'Workorder Start request failed';
  static assignWorkorderError = 'Workorder Assign request failed';
  static completeWorkorderSuccess = 'Workorder request Completed successfully';
  static completeWorkorderError = 'Workorder Complete request failed';
  static closeWorkorderSuccess = 'Workorder request Closed successfully';
  static closeWorkorderError = 'Workorder Close request failed';
  static materialSuccess = 'Material details saved successfully';
  static laborSuccess = 'Labor details saved successfully';
  static materialError = 'Material details saving failed';
  static laborError = 'Labor details saving failed';
  static toolSuccess = 'Tool details saved successfully';
  static toolError = 'Tool details saving failed';

  // Asset Registry
  static addAssetRegistrytitle = 'Add Asset Registry';
  static updateAssetRegistrytitle = 'Update Asset Registry';
  static addAssetRegistrySuccess = 'Asset Registry added successfully';
  static updateAssetRegistrySuccess = 'Asset Registry updated successfully';
  static assetRegistryError = 'Asset Registry adding/updating failed';
  static assetProvideSuccess = 'Asset Provided added successfully';
  static assetProvideFailed = 'Asset Providing failed';
  static assetRemoveSuccess = 'Asset Removed successfully';
  static assetRemoveFailed = 'Asset Removing failed';

  static regenerateSaveSuccess = 'Regenerate Saved successfully';
  static regenerateSaveFailed = 'Regenerate Save failed';

  static meterSuccess = 'Meter readings saved successfully';
  static meterError = 'Meter readings saving failed';

  // role
  static addPTWRequesttitle = 'Add role';
  //PTW
  static addPTWSuccess = 'PTW Submit request added successfully';
  static PTWError = 'PTW Submit request adding failed';
  static SearchDateError = 'From Date is lessthan or equal to ToDate';

  static ApprovePTWSuccess = 'PTW Approval request Approved successfully';
  static PTWApproveError = 'PTW Approval request failed';

  static ReturnApprovePTWSuccess =
    'Retuen PTW Approval request Approved successfully';
  static ReturnPTWApproveError = 'Return PTW Approval request failed';

  static StartPTWSuccess = 'PTW  request Started successfully';
  static PTWStartError = 'PTW Start request failed';
  static PICSucces = 'PIC Updated successfully';
  static PICError = 'PIC Updating failed';
  static workOrderRestrictCancel =
    ' This workorder cancellation is not allowed as the associted PTW is either started or completed.';

  static FinishPTWSuccess = 'PTW  request Completed successfully';
  static PTWFinishError = 'PTW Complete request failed';

  static ClosePTWSuccess = 'PTW  request Closed successfully';
  static PTWCloseError = 'PTW Close request failed';

  //SR
  static addSRSuccess = 'SR Submit request added successfully';
  static SRSubmitError = 'SR Submit request adding failed';

  static ScheduleSRSuccess = 'Service Request Scheduled successfully';
  static SRScheduleError = 'Service Request Schedule failed';

  static AssignSRSuccess = 'Service Request Assigned successfully';
  static SRAssignError = 'Service Request Assign failed';

  static ExecuteSRSuccess = 'Service Request Executed successfully';
  static SRExecuteError = 'Service Request Execute failed';

  static WorkOrderSRSuccess = 'Service Request Scheduled successfully';
  static SRIssueWOError = 'Service Request Schedule failed';

  static ServiceRequestWFMSuccess = 'Waiting For Material Saved successfully';
  static WorkOrderWFMSuccess = 'Waiting For Material Saved successfully';

  static AssetParamChangeError = 'Asset Param change failed';

  // Filter Object Name for each grid
  static PURCHASE_ORDER_LIST_FILTER_OBJECT = 'purhaseOrderListFilterObject';
  static ASSETS_LIST_FILTER_OBJECT = 'assetListFilterOptions';
  static WORK_ORDER_LIST_FILTER = 'workOrderListFilterOptions';
  static WORK_ORDER_LIST_HISTORY_FILTER = 'workOrderListHistoryFilterOptions';
  static SERVICE_REQUEST_LIST_FILTER = 'workOrderListFilterOptions';
  static LOCATION_LIST_FILTER = 'locationListFilterOptions';
  static ROUTES_LIST_FILTER = 'routesListFilterOptions';
  static ASSET_TYPES_LIST_FILTER = 'assetTypeListFilterOptions';
  static STAFF_LIST_FILTER = 'staffListFilterOptions';
  static CONFIG_LOCATION_LIST_FILTER = 'configLocationListFilterOptions';
  static UNIT_EXCHANGE_SPARE_LIST_FILTER = 'unitExchangeSpareListFilterOptions';
  static ASSET_CHANGES_LIST_FILTER = 'assetChangesListFilterOptions';
  static ASSET_UNDER_MONITORING_LIST_FILTER = 'assetChangesListFilterOptions';
  static PM_PLANS_LIST_FILTER = 'pmPlansListFilterOptions';
  static WO_ADD_LIST_FILTER = 'pmPlansListFilterOptions';
  static WO_LIST_POPUP_FILTER = 'WOListPopupFilterOptions';
  static JOB_PLANS_LIST_FILTER = 'jobPlansListFilterOptions';
  static PS_PERMIT_TO_WORK_LIST_FILTER = 'PS_PERMIT_TO_WORK_LIST_FILTER';
  static PS_PERMIT_TO_WORK_HIST_FILTER = 'PS_PERMIT_TO_WORK_HIST_FILTER';
  static NXASM_CONFIG_SETUP_WORK_FLOW_FILTER =
    'NXASM_CONFIG_SETUP_WORK_FLOW_FILTER';
  static NXASM_CONFIG_MAINTENANCE_ASSET_PART_TYPES_FILTER =
    'NXASM_CONFIG_MAINTENANCE_ASSET_PART_TYPES_FILTER';
  static CONFIG_MAINTENANCE_ASSET_PART_TYPES =
    'CONFIG_MAINTENANCE_ASSET_PART_TYPES';
  static STAFF_QUALIFICATION_LIST_FILTER_OBJECT =
    'staffQualificationListFilterOptions';
  static USER_LIST_SEARCH = 'UserListSearch';
  static FAULT_CODE_LIST_SEARCH = 'FAULT_CODE_LIST_SEARCH';
  static WHEEL_MEASUREMENTS_LIST_SEARCH = 'WHEEL_MEASUREMENTS_LIST_SEARCH';

  // form fields
  static plannedDate = 'Planned Date';
  static PlannedFrom = 'Planned From';
  static PlannedTo = 'Planned To';
  static PlannedUpto = 'Planned To';
  static GeneratedDate = 'Generated Date';

  static ScheduledFrom = 'Scheduled From';
  static ScheduledUpto = 'Scheduled To';
  static maxTargetDate = 'Finish Date';

  static TargetStart = 'Target Start';
  static TargetEnd = 'Target End';

  static ActualStart = 'Actual Start';
  static ActualEnd = 'Actual End';

  static reqStart = 'Request Start';
  static reqEnd = 'Request End';

  static aprStart = 'Scheduled Start';
  static aprEnd = 'Scheduled End';

  static addMsgGroupSuccess = 'MsgGroup added successfully';
  static updateMsgGroupSuccess = 'MsgGroup updated successfully';
  static msgGroupError = 'MsgGroup updating/Adding failed';
  static updateAssocSuccess = 'Meter reading added successfully';
  static updateAssocError = 'Meter reading adding failed';
  static wm = {
    ft: { min: 25, max: 33 },
    dif: { min: 1358, max: 1360 },
    daf: { min: 1408, max: 1425 },
  };
}
