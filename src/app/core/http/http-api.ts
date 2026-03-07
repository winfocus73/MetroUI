import { IDropdown } from 'src/app/shared/models/dropdown';
import { environment } from '../../../environments/environment';

export class HttpApi {
  // static readonly baseUrl = `${environment.backend.host}`;//https://nxasm.winfocus.co.in/services';

  // Base URL - use environment variable
  static readonly baseUrl = `${environment.backend.host}`;

  // Inventory API base
  static readonly inventoryBaseUrl = 'http://192.168.14.155:4604/api/inventory';

  static readonly nationalityData: IDropdown[] = [
    { value: 'India', code: '1' },
  ];

  static readonly statusData: IDropdown[] = [
    { value: 'Active', code: '1' },
    { value: 'InActive', code: '2' },
  ];
  static readonly yesnoData: IDropdown[] = [
    { value: 'Yes', code: '1' },
    { value: 'No', code: '0' },
  ];

  // Inventory endpoints - use full URL since it's on different port
  //material issue
  //sections
  static readonly getSectionList = 'inventory/api/inventory/get-section-list';
  static readonly getMINumbers = 'inventory/api/inventory/get-issuenumber-list';
  static readonly getAllIssueList = '/MaterialIssue/GetAllIssueList';
  static readonly getMaterialIssueDetails =
    '/MaterialIssue/GetMaterialIssueDetails';
  static readonly getMaterialIssueSearchList = `inventory/api/inventory/search-issue`;
  static readonly getMaterialIssueStatuses = `/MaterialIssue/GetStatuses`;
  static readonly getDepartmentsList = `/MaterialIssue/GetDepartments`;
  static readonly saveMaterialIssue = `/MaterialIssue/SaveMaterialIssue`;
  static readonly updateMaterialIssue = `/MaterialIssue/UpdateMaterialIssue`;
  static readonly deleteMaterialIssue = `/MaterialIssue/DeleteMaterialIssue`;
  static readonly getItemsForMaterialIssue = `/MaterialIssue/GetItems`;
  static readonly searchDepartments = `/MaterialIssue/SearchDepartments`;
  static readonly getIssueTypes = `/MaterialIssue/GetIssueTypes`;

  static readonly getCashPurchaseSearchList =
    'inventory/api/inventory/search-cashpurchase';
  static readonly getCashPurchaseList =
    'inventory/api/inventory/get-cpnumbers-list';
  static readonly getCashPurchaseById =
    'inventory/api/inventory/get-cashpurchase-by-id';
  static readonly SaveCashPurchase =
    'inventory/api/inventory/save-cash-purchase';
  static readonly UpdateCashPurchase =
    'inventory/api/inventory/update-cash-purchase';

  static readonly getScreenLabels = 'inventory/api/inventory/get-screen-labels';
  static readonly getScreenLabelsDictionary =
    'inventory/api/inventory/get-screen-labels-dictionary';

  static readonly getPurchaseOrderSearchList =
    'inventory/api/inventory/search-purchaseorder';
  static readonly getPoDetails =
    'inventory/api/inventory/get-ponumbers-for-posearch';
  static readonly getPurchaseOrderStatuses =
    'inventory/api/inventory/get-inv-status-types';
  static readonly getAllPriorities = 'inventory/api/inventory/get-priorities';

  static readonly getPoStatus = 'inventory/api/inventory/get-po-status-types';
  static readonly getAllLocations = 'inventory/api/inventory/get-locations';
  static readonly getItemTypes = 'inventory/api/inventory/get-itemtype';
  static readonly getAllCategories = 'inventory/api/inventory/get-categories';
  static readonly getItemsByCategoryAndType =
    'inventory/api/inventory/get-item-type-data';
  static readonly getPOVendors = 'inventory/api/inventory/get-vendors';
  static readonly getPurchaseOrderDetails =
    'inventory/api/inventory/get-po-details';
  static readonly savePurhaseOrder =
    'inventory/api/inventory/submit-purchaseorder';

  static readonly tokenApi = 'authservice/api/auth/authenticate';
  static readonly menus = 'adminService/api/Admin/role-menu';
  static readonly validateOTP = 'adminService/api/Admin/validate-OTP';
  static readonly resendOTP = 'adminService/api/Admin/resend-OTP';
  static readonly reportMenus = 'adminService/api/Admin/role-reports-menu';
  static readonly searchGlobal = 'adminService/api/Admin/search-global';
  // OAuth
  static readonly oauthLogin = 'adminService/api/Admin/login';
  static readonly oauthLogout = 'adminService/api/Admin/logout';

  // Start Mutual Auth
  static readonly userRegister = 'adminService/api/user/register';

  // users
  static readonly getUsers = 'adminService/api/Admin/users';
  static readonly addEditUser = 'adminService/api/Admin/add-update-user';
  static readonly getUserDetails = 'adminService/api/Admin/get-user-details';
  static readonly getSearchUser = 'adminService/api/Admin/search-users';

  //adding the Po end points

  // locations
  static readonly getLocations = 'adminService/api/Admin/locations';
  static readonly getLocationsSearch =
    'adminService/api/Admin/search-locations';
  static readonly addEditLocation = 'adminService/api/Admin/add-edit-location';
  static readonly getLocationDetails =
    'adminService/api/Admin/get-location-details-breakup';

  static readonly passwordChange = 'adminService/api/Admin/change-password';
  static readonly restPasswordChange = 'adminService/api/Admin/reset-password';
  static readonly locationTypes = 'adminService/api/Admin/LocationTypes';
  static readonly getPwdExceptionList =
    'adminService/api/Admin/get-pwd-exception-list';

  //feedback
  static readonly addUpdateFeedback =
    'adminService/api/Admin/add-update-feedback';
  static readonly searchFeedback = 'adminService/api/Admin/search-feedback';
  static readonly getFeedbackDetails =
    'adminService/api/Admin/get-feedback-details';
  static readonly modulesFormsList =
    'adminService/api/Admin/modules-forms-list';

  //Organization

  static readonly getOrganizations = 'adminService/api/Admin/get-org-list';

  // roles
  static readonly getRoles = 'adminService/api/Admin/roles';
  static readonly getRoleDetails = 'adminService/api/Admin/get-role-details';
  static readonly addEditRole = 'adminService/api/Admin/add-update-role';

  // units
  static readonly getUnits = 'adminService/api/Admin/units';

  // staff
  static readonly getStaff = 'adminService/api/Admin/staff';
  static readonly getSearchStaff = 'adminService/api/Admin/search-staff';
  static readonly addEditStaff = 'adminService/api/Admin/add-update-staff';
  static readonly getStaffDetails = 'adminService/api/Admin/get-staff-details';
  static readonly getFormPriviliges =
    'adminService/api/Admin/get-form-priviliges';
  static readonly updateProfile = 'adminService/api/Admin/update-profile';

  // Designation
  static readonly getDesignations = 'adminService/api/Admin/designations';
  static readonly zones = 'adminService/api/Admin/zones';
  static readonly getStations = 'adminService/api/Admin/get-stations';

  //tree Data
  static readonly getroleTreeData = 'adminService/api/Admin/role-tree';
  static readonly getUnitTreeData = 'adminService/api/Admin/unit-tree';

  static readonly getVendorList = 'adminService/api/Admin/get-vendor-list';
  static readonly getSatas = 'inventory/api/inventory/get-po-status-types';
  static readonly getVendorDetails =
    'adminService/api/Admin/get-vendor-details';

  static readonly getCorridorList = 'adminService/api/Admin/get-corridor-list';
  static readonly getQualificationList =
    'adminService/api/Admin/get-qualification-list';
  static readonly searchStaffQualification =
    'adminService/api/Admin/search-staff-qualification';
  static readonly addEdiStaffQualifications =
    'adminService/api/Admin/add-edit-staff-qualifications';
  static readonly getStaffQualificationDetails =
    'adminService/api/Admin/get-staff-qualification-details';
  static readonly requestResetPwd = 'adminService/api/Admin/request-reset-pwd';
  static readonly requestUpdatePwd =
    'adminService/api/Admin/request-update-pwd';

  //Assets

  //Asset Types
  static readonly assetTypes = 'assetconfig/api/assetconfig/get-asset-types';
  static readonly searchAssetTypes =
    'assetconfig/api/assetconfig/search-asset-types';
  static readonly assetTypesAddEdit =
    'assetconfig/api/assetconfig/add-update-asset-type';
  static readonly getAssetTypeDetails =
    'assetconfig/api/assetconfig/get-asset-type-details';
  static readonly getAssetAssemblyTree =
    'assetconfig/api/assetconfig/get-asset-assembly-tree';
  static readonly getCarLayoutTree =
    'assetconfig/api/assetconfig/get-car-layout-tree';
  static readonly getCarLayoutTypes =
    'assetconfig/api/assetconfig/get-car-layout-types';
  static readonly getAssettypeParentsList =
    'assetconfig/api/assetconfig/get-assettype-parents-list';
  static readonly getCarsList = 'assetconfig/api/assetconfig/get-cars-list';
  static readonly getTrainsetList =
    'assetconfig/api/assetconfig/get-trainset-list';
  static readonly geCarLayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-car-layout-subsystem-assets';
  static readonly searchAssetGroups =
    'assetconfig/api/assetconfig/search-asset-groups';

  static readonly unReadNotificationCount =
    'messaging/api/messaging/get-notifications-count';
  static readonly getAssetDetailsforChanges =
    'assetregister/api/asset-register/get-asset-details-for-changes';
  static readonly assetUnitEchangePosition =
    'assetregister/api/asset-register/unit-exchange-position';
  static readonly getAssetRegistryList =
    'assetregister/api/asset-register/get-asset-list';
  static readonly addAssetregistry =
    'assetregister/api/asset-register/add-asset';
  static readonly getCarRegisterAssetTree =
    'assetregister/api/asset-register/get-car-register-asset-tree';
  static readonly getAssetRegistrySearchList =
    'assetregister/api/asset-register/search-assets';
  static readonly addEditAssetregistry =
    'assetregister/api/asset-register/add-edit-asset';
  static readonly getAssetRegistryDetailsByID =
    'assetregister/api/asset-register/get-asset-details';

  static readonly oems = 'assetregister/api/asset-register/oems';

  static readonly getAssetinfoDetails =
    'assetregister/api/asset-register/get-assetinfo-details';
  static readonly searchRoutes =
    'assetregister/api/asset-register/search-routes';
  static readonly getRouteDetails =
    'assetregister/api/asset-register/get-route-details';
  static readonly addRoute = 'assetregister/api/asset-register/add-route';
  static readonly getAssetHistory =
    'assetregister/api/asset-register/get-asset-history';
  static readonly assetLocationChange =
    'assetregister/api/asset-register/asset-location-change';

  static readonly getReadytoFitAssets =
    'assetregister/api/asset-register/get-ready-to-fit-assets';
  static readonly provideAssetinCar =
    'assetregister/api/asset-register/provide-asset-in-car';
  static readonly removeAssetfromCar =
    'assetregister/api/asset-register/remove-asset-from-car';
  static readonly removeAssetfromAssembly =
    'assetregister/api/asset-register/remove-sub-asset-from-assembly';
  static readonly provideAssetforCarAssembly =
    'assetregister/api/asset-register/provide-sub-asset-into-assembly';

  static readonly getAssetChangesList =
    'assetregister/api/asset-register/get-asset-changes-list';
  static readonly getAssetStatusTypes =
    'assetregister/api/asset-register/get-asset-status-types';

  static readonly addMeterreadings =
    'assetregister/api/asset-register/add-meterreadings';
  static readonly searchMeterreadings =
    'assetregister/api/asset-register/search-meterreadings';
  static readonly searchMeterregister =
    'assetregister/api/asset-register/search-meterregister';
  static readonly searchMetertypes =
    'assetregister/api/asset-register/search-metertypes';
  static readonly getTrainsetsMeterreading =
    'assetregister/api/asset-register/get-trainsets-meterreading';
  static readonly getTrainsetMeterlist =
    'assetregister/api/asset-register/get-trainset-meterlist';
  static readonly addTrainsetMeterReading =
    'assetregister/api/asset-register/add-trainset-meterreadings';

  //Locations
  static readonly assetLocations =
    'assetconfig/api/assetconfig/get-asset-locations-list';
  static readonly assetLocationAddEdit =
    'assetconfig/api/assetconfig/add-update-asset-location';
  static readonly getAssetLocationDetails =
    'assetconfig/api/assetconfig/get-asset-location-details';
  static readonly getTrainsetTypes =
    'assetconfig/api/assetconfig/get-trainset-types';
  static readonly getCarTypes = 'assetconfig/api/assetconfig/get-car-types';
  static readonly getSigLayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-sig-layout-subsystem-assets';
  static readonly getTrackLayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-trw-layout-subsystem-assets';
  static readonly getPSSLayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-pss-layout-subsystem-assets';
  static readonly getOPELayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-ope-layout-subsystem-assets';
  static readonly getComLayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-com-layout-subsystem-assets';
  static readonly getAfcLayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-afc-layout-subsystem-assets';
  static readonly getDeeLayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-dee-layout-subsystem-assets';
  static readonly getmepLayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-mep-layout-subsystem-assets';
  static readonly getcivLayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-civ-layout-subsystem-assets';
  static readonly getohelayoutSubsystemAssets =
    'assetconfig/api/assetconfig/get-ohe-layout-subsystem-assets';
  static readonly getTSFormation =
    'assetconfig/api/assetconfig/get-ts-formation';

  //Part Types
  static readonly assetPartTypes =
    'assetconfig/api/assetconfig/get-part-type-list';
  static readonly assetPartTypeAddEdit =
    'assetconfig/api/assetconfig/add-update-part-type';
  static readonly getAssetPartTypeDetails =
    'assetconfig/api/assetconfig/get-part-type-details';

  //lookup
  static readonly getLookupList = 'assetconfig/api/assetconfig/get-lookups';
  static readonly getAssetCategories =
    'assetconfig/api/assetconfig/get-asset-categories';

  //messages
  static readonly getmessagingfolders =
    'messaging/api/messaging/get-messaging-folders';
  static readonly getMessageListbyFolder =
    'messaging/api/messaging/get-message-list-by-folder';
  static readonly getMessageDetails =
    'messaging/api/messaging/get-message-details';
  static readonly sendMessage = 'messaging/api/messaging/send-message';
  static readonly updateReadStatus =
    'messaging/api/messaging/update-read-status';
  static readonly unReadMessageCount =
    'messaging/api/messaging/unread-messages-count';
  static readonly getWorkorderNotesDetails =
    'messaging/api/messaging/get-work-comments';
  static readonly addWorkorderNotesDetails =
    'messaging/api/messaging/add-work-comment';
  static readonly editWorkorderNotesDetails =
    'messaging/api/messaging/edit-work-comment';

  // workflow
  static readonly getWorkflowObjectsTypes =
    'workflowService/api/workflow/get-workflow-objects-types';
  static readonly getWorkflowActions =
    'workflowService/api/workflow/get-workflow-actions';
  static readonly getWorkflowStates =
    'workflowService/api/workflow/get-workflow-states';
  static readonly getWorkflowConditions =
    'workflowService/api/workflow/get-workflow-conditions';
  static readonly getWorkflowTemplateList =
    'workflowService/api/workflow/get-workflow-template-list';
  static readonly addUpdateWorkflowTemplate =
    'workflowService/api/workflow/add-update-workflow-template';
  static readonly getWorkflowTemplateDetails =
    'workflowService/api/workflow/get-workflow-template-details';
  static readonly getAllowedActions =
    'workflowService/api/workflow/get-allowed-actions';
  //static readonly getWorkflows = 'workflowService/api/workflow/get-workflows';
  static readonly getWorkflows =
    'workflowService/api/workflow/search-workflows';
  static readonly getworkflowHistory =
    'workflowService/api/workflow/get-workflow-history';
  static readonly rollbackWorkflowHistory =
    'workflowService/api/workflow/rollback-workflow';

  //WorkOrder
  static readonly getPermittoWorkList =
    'workorderservice/api/workorder/get-permit-list';
  static readonly getPermittoWorkDetails =
    'workorderservice/api/workorder/get-permit-details';
  static readonly submitPermittoWork =
    'workorderservice/api/workorder/submit-ptw';
  static readonly approvePermittoWork =
    'workorderservice/api/workorder/approve-ptw';
  static readonly returnApprovePermittoWork =
    'workorderservice/api/workorder/return-ptw';
  static readonly startPermittoWork =
    'workorderservice/api/workorder/start-ptw';
  static readonly CompletePermittoWork =
    'workorderservice/api/workorder/complete-ptw';
  static readonly ClosePermittoWork =
    'workorderservice/api/workorder/close-ptw';
  static readonly getWorkorderList =
    'workorderservice/api/workorder/get-workorder-list';
  static readonly getWorkorderSearchList =
    'workorderservice/api/workorder/search-workorders';
  static readonly getWorkorderSearchListHistory =
    'workorderservice/api/workorder/search-Work-Order-history';

  static readonly getWorkorderStatusTypes =
    'workorderservice/api/workorder/get-workorder-status-types';
  static readonly submitWorkorder =
    'workorderservice/api/workorder/submit-workorder';
  static readonly approveWorkorder =
    'workorderservice/api/workorder/approve-workorder';
  static readonly getWorkorderDetails =
    'workorderservice/api/workorder/get-workorder-details';
  static readonly executeWorkorder =
    'workorderservice/api/workorder/execute-workorder';
  static readonly getCalendarTasks =
    'workorderservice/api/workorder/get-calendar-tasks';
  static readonly getptwCalendarTasks =
    'workorderservice/api/workorder/get-ptw_calendar-tasks';
  static readonly getWorkorderChecklistDetails =
    'workorderservice/api/workorder/get-workorder-checklist-details';
  static readonly getWheelMeasurementDetails =
    'workorderservice/api/workorder/get-wo-wm';
  static readonly saveWheelMeasurementDetails =
    'workorderservice/api/workorder/save-wo-wm';

  static readonly getWorkOrderSummary =
    'workorderservice/api/workorder/get-wo-dashboard-summary';
  static readonly getWorkorderLaborDetails =
    'workorderservice/api/workorder/get-workorder-labor-details';
  static readonly getWorkorderMaterialDetails =
    'workorderservice/api/workorder/get-workorder-material-details';
  static readonly saveWorkorderMaterial =
    'workorderservice/api/workorder/save-workorder-material';
  static readonly saveWorkorderLabor =
    'workorderservice/api/workorder/save-workorder-labor';
  static readonly getPermittoWorkSummary =
    'workorderservice/api/workorder/get-ptw-dashboard-summary';
  static readonly getSearchPermittoWorks =
    'workorderservice/api/workorder/search-permits';
  static readonly getSearchPermittoWorksHistory =
    'workorderservice/api/workorder/search-ptw-history';
  static readonly saveRescheduleWorkorder =
    'workorderservice/api/workorder/reschedule-workorder';
  static readonly saveWorkorderChecksheet =
    'workorderservice/api/workorder/save-workorder-checksheet';
  static readonly updateWoChecksheetComments =
    'workorderservice/api/workorder/update-wo-checksheet-comment';
  static readonly ptwPrintParta =
    'workorderservice/api/workorder/ptw-print-parta';
  static readonly getAssetsUnderMonitoring =
    'workorderservice/api/workorder/get-assets-monitoring-list';
  static readonly updateAssetsUnderMonitoringRemark =
    'workorderservice/api/workorder/update-asset-monitoring-remark';
  static readonly saveAssetsMonitoring =
    'workorderservice/api/workorder/save-asset-monitoring';
  static readonly getPicList = 'workorderservice/api/workorder/get-pic-list';
  static readonly cancelWorkorder =
    'workorderservice/api/workorder/cancel-workorder';
  static readonly cancelPTW = 'workorderservice/api/workorder/cancel-ptw';
  static readonly searchWorkorderChecklist =
    'workorderservice/api/workorder/search-workorder-checklist';
  static readonly getWorkorderToolDetails =
    'workorderservice/api/workorder/get-workorder-tool-details';
  static readonly saveWorkorderTool =
    'workorderservice/api/workorder/save-workorder-tool';
  static readonly returnWorkorder =
    'workorderservice/api/workorder/return-workorder';
  static readonly workorderrequestsummary =
    'workorderservice/api/workorder/get-wo-dashboard-summary2';
  static readonly getWheelMeasurementsList =
    'workorderservice/api/workorder/search-ts-wm';
  static readonly getWheelMeasurementsDetails =
    'workorderservice/api/workorder/get-wheelset-wm';
  static readonly updateWoAssetComments =
    'workorderservice/api/workorder/update-wo-asset-comments';

  // statuses
  static readonly statuses =
    'workorderservice/api/workorder/get-ptw-status-types';
  static readonly changePTWPic =
    'workorderservice/api/workorder/change-ptw-pic';
  static readonly getPTWCivilPurposeList =
    'workorderservice/api/workorder/get-ptw-civil-purpose-list';

  //maintenanceconfig
  static readonly getMMSList =
    'maintenanceconfig/api/maintenanceconfig/get-master-plan-list';
  static readonly getScheduleTypes =
    'maintenanceconfig/api/maintenanceconfig/get-schedule-types';
  static readonly getSafetyPlans =
    'maintenanceconfig/api/maintenanceconfig/get-safety-plans';
  static readonly getJoPlansDrop =
    'maintenanceconfig/api/maintenanceconfig/get-job-plans';
  static readonly getMMSDetails =
    'maintenanceconfig/api/maintenanceconfig/get-master-plan-details';
  static readonly addMasterPlan =
    'maintenanceconfig/api/maintenanceconfig/add-master-plan';
  static readonly getMMSDetailsView =
    'maintenanceconfig/api/maintenanceconfig/get-master-plan-detailed';
  static readonly getJobplanList =
    'maintenanceconfig/api/maintenanceconfig/get-jobplan-list';
  static readonly getSafetyplanList =
    'maintenanceconfig/api/maintenanceconfig/get-safety-plan-list';
  static readonly getPMSchedulesList =
    'maintenanceconfig/api/maintenanceconfig/get-pm-schedules-list';
  static readonly getPMSchedulesHistoryList =
    'maintenanceconfig/api/maintenanceconfig/get-pm-schedules-history';
  static readonly getJobplanDetails =
    'maintenanceconfig/api/maintenanceconfig/get-jobplan-details';
  static readonly addJobplan =
    'maintenanceconfig/api/maintenanceconfig/add-jobplan';
  static readonly getSafetyplanDetails =
    'maintenanceconfig/api/maintenanceconfig/get-safetyplan-details';
  static readonly addSafetyPlan =
    'maintenanceconfig/api/maintenanceconfig/add-safety-plan';
  static readonly getCraftList =
    'maintenanceconfig/api/maintenanceconfig/get-craft-list';
  static readonly addEditCraft =
    'maintenanceconfig/api/maintenanceconfig/add-craft';
  static readonly getToolsList =
    'maintenanceconfig/api/maintenanceconfig/get-tools-list';
  static readonly getScheduleChecklist =
    'maintenanceconfig/api/maintenanceconfig/get-schedule-checklist';
  static readonly getChecklistDetails =
    'maintenanceconfig/api/maintenanceconfig/get-checklist-details';
  static readonly getFaultCodes =
    'maintenanceconfig/api/maintenanceconfig/get-faultcode-list';
  static readonly addOrUpdateFaultCode =
    'maintenanceconfig/api/maintenanceconfig/add-update-fault-code';
  static readonly addAssetPMMaster =
    'maintenanceconfig/api/maintenanceconfig/add-asset-pm-master';
  static readonly getAssetPMMaster =
    'maintenanceconfig/api/maintenanceconfig/get-asset-pm-master';
  static readonly regenerateAssetPMMaster =
    'maintenanceconfig/api/maintenanceconfig/regenerate-asset-pm-master';
  static readonly forecastAssetPMMaster =
    'maintenanceconfig/api/maintenanceconfig/forecast-pm';

  static readonly getoemsDetails =
    'maintenanceconfig/api/maintenanceconfig/get-mfg-details';
  static readonly addEditoemsDetails =
    'maintenanceconfig/api/maintenanceconfig/add-update-mfg';

  static readonly addEditVendorDetails =
    'maintenanceconfig/api/maintenanceconfig/add-update-vendor';

  //Service Request
  static readonly getServiceRequestList =
    'servicerequest/api/servicerequest/get-servicerequest-list';
  static readonly getServiceRequestStatusTypes =
    'servicerequest/api/servicerequest/get-servicerequest-status-types';
  static readonly searchServiceRequestList =
    'servicerequest/api/servicerequest/search-service-requests'; //get-servicerequest-list';
  static readonly searchServiceRequestHistoryList =
    'servicerequest/api/servicerequest/search-service-requests-history'; //get-servicerequest-list';

  static readonly getServiceRequestDetails =
    'servicerequest/api/servicerequest/get-servicerequest-details';
  static readonly SubmitServiceRequest =
    'servicerequest/api/servicerequest/submit-service-request';
  static readonly ScheduleServiceRequest =
    'servicerequest/api/servicerequest/schedule-service-request';
  static readonly assignServiceRequest =
    'servicerequest/api/servicerequest/assign-service-request';
  static readonly ExecuteServiceRequest =
    'servicerequest/api/servicerequest/execute-service-request';
  static readonly getSRDashBoardSummary =
    'servicerequest/api/servicerequest/get-sr-dashboard-summary';
  static readonly getFaultSystems =
    'servicerequest/api/servicerequest/get-fault-systems';
  static readonly getFaultSubSystems =
    'servicerequest/api/servicerequest/get-fault-sub-systems';
  static readonly getSystemFaults =
    'servicerequest/api/servicerequest/get-system-faults';
  static readonly getSRImpactList =
    'servicerequest/api/servicerequest/get-sr-impact-list';
  static readonly IssueWorkOrder =
    'servicerequest/api/servicerequest/issue-sr-workorder';
  static readonly cancelServiceRequest =
    'servicerequest/api/servicerequest/cancel-servicerequest';
  static readonly returnServiceRequest =
    'servicerequest/api/servicerequest/return-sr';
  static readonly checkAssetSRPending =
    'servicerequest/api/servicerequest/check-asset-sr-pending';
  static readonly changeAssetParams =
    'servicerequest/api/servicerequest/change-sr-params';
  static readonly updateFailureCodeRequest =
    'servicerequest/api/servicerequest/update-sr-fault-code';
  static readonly getSubsystemFailureSummary =
    'servicerequest/api/servicerequest/get-subsystem-failure-summary';
  static readonly saveWaitingForMaterial =
    'servicerequest/api/servicerequest/save-WaitingFor-Material';
  static readonly getWaitingForMaterial =
    'servicerequest/api/servicerequest/get-WaitingFor-Material';

  static readonly uploadDocument = 'documentservice/api/docs/upload';
  static readonly downloadDocument = 'documentservice/docs/view';
  static readonly DeleteDocument = 'documentservice/api/docs/delete';

  static readonly getMsggroupDetails =
    'messaging/api/messaging/get-msggroup-details';
  static readonly getMsggroupList = 'messaging/api/messaging/get-msggroup-list';
  static readonly addEditMsggroup = 'messaging/api/messaging/add-edit-msggroup';
  static readonly getEmailList = 'messaging/api/mailing/get-email-list';
  static readonly searchAuditLog = 'adminService/api/Admin/search-audit-log';
  static readonly getNotifications =
    'messaging/api/messaging/get-notifications';
  static readonly updateWoFailureCodeRequest =
    'WorkOrderService/api/WorkOrder/update-wo-asset-fault-code';
  static priorityData: any;
  static workStatusData: any;
  static LocationData: any;
  static ItemTypeData: any;
}
