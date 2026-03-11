import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { IAssetCategories } from '@dashboard/config-assets/models/asset-categories';
import { Column, ICommonRequest, IDropdown, IGetSearchRequest, ILookupData, ILookupValue, IRequest } from '@shared/models';
import { IFormCheck } from '@shared/models/role-check';
import { CommonService } from '@shared/services/common.service';
import { ILoginData } from '@auth/models/login.response';
import { ILocation } from '@dashboard/configuration-setup/models/location/location';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssetService } from '@dashboard/config-assets/services/asset.service';
import { LoadingService } from '@shared/services/spinner.service';
import * as moment from 'moment';
import { IWorkflowConfig, IWorkflowDetails } from '@shared/models/workflow.model';
import { WorkflowService } from '@shared/services/workflow.service';
import { IUnit } from '@dashboard/configuration/models/units/unit';
import { UnitService } from '@dashboard/configuration/services/unit.service';
import { IMaterialRequisitionAddEdit, IItemTypeData, IVendor, IMaterialRequisitionStatus, IPriority, IItemType, ICategory, IMaterialRequisitionLineItem, ISessionsList, IMaterialRequisitionDetailsResponse } from '@dashboard/inventory/models/material-requisition';
import { InventoryService } from '@dashboard/inventory/services/inventory.service';
import { ISectionList } from '@dashboard/inventory/models/material-issue';

@Component({
  selector: 'nxasm-inventory-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class AddEditComponent implements  OnInit, OnChanges {
    @Output() message = new EventEmitter();
    @Input() mrId!:number;
    @Input() objForm: IFormCheck = {} as IFormCheck;
    today = new Date();
    materialRequisitionForm!: UntypedFormGroup;
    addEditRequest: IMaterialRequisitionAddEdit = {} as IMaterialRequisitionAddEdit;
    categoryId = 0;
    isMRCreated = false;
    isSubmitted: boolean = false;
    LoginUserInfo: ILoginData = {} as ILoginData;
    showSaveButtons = false;
    itemTypeData: IItemTypeData[] = [];
    filteredItems: IDropdown[] = [];
    currentItemTypeData: IItemTypeData[] = [];
    workflowDetails!: IWorkflowDetails;
    workflowConfig!: IWorkflowConfig;
    vendors: IVendor[] = [];
    materialRequisitionStatuses: IMaterialRequisitionStatus[] = [];
    priorities: IPriority[] = [];
    locations: ILocation[] = [];
    itemTypes: IItemType[] = [];
    categories: ICategory[] = [];
    deptItems: IUnit[] = [];
    statusItems: IDropdown[] = [];
    priorityItems: IDropdown[] = [];
    locationItems: IDropdown[] = [];
    itemTypeItems: IDropdown[] = [];
    categoryItems: IDropdown[] = [];
    displayedColumns: string[] = ['sno', 'itemType', 'category', 'itemName', 'description', 'uom',  'quantity',  'action'];
    lineItemsDataSource = new MatTableDataSource<IMaterialRequisitionLineItem>();
    lineItems: IMaterialRequisitionLineItem[] = [];
    dialogRef!: MatDialogRef<any>;
    loginData: ILoginData = {} as ILoginData;
    sessionList: ISessionsList[] = [];
    lineItemForm!: UntypedFormGroup;
    showLineItemDialog = false;
    editLineItemIndex = -1;
    dateFormat = 'YYYY-MM-DDTHH:mm:ss';
    assetCategories: IAssetCategories[] = [];
    items: IDropdown[] = [];
     mrNumberDisplay: string = ''; // Store the MR number 
  sessionData: any[]=[];
    constructor(private snackBar: MatSnackBar, public dialog: MatDialog, private fb: UntypedFormBuilder, private commonService: CommonService,
      private _loading: LoadingService, private assetService: AssetService, private workflowService: WorkflowService,
      private inventoryServices: InventoryService, private unitService: UnitService
    ) {}
  
    ngOnInit(): void {
      this.initializeForms();
      // this.loginData = this.commonService.loginStorageData;
      const loginStorage: any = this.commonService.loginStorageData;
      console.log('Login Storage Data:', loginStorage);
         const userName = loginStorage?.loginData?.userName || '';
          this.materialRequisitionForm.get('userName')?.setValue(userName);
      this.loadAllDropdownData();
      this.setDefaultValues();
      if (this.mrId > 0) {
        this.getMaterialRequisitionDetails();
      } else {
        // For new MR, don't show MR number until saved
        this.mrNumberDisplay = 'Auto-generated';
      }
       this.materialRequisitionForm.get('categoryId')?.valueChanges.subscribe((categoryId: string) => {
      console.log("Selected CategoryId:", categoryId);

      if (categoryId) {

        this.getSessionList(categoryId);

      } else {

        this.sessionList = [];
        this.materialRequisitionForm.get('sessionId')?.setValue(null);

      }

    });

    }

  ngOnChanges(changes: SimpleChanges): void {
      this.mrId = changes['mrId']?.currentValue;
      if (this.mrId > 0) {
        setTimeout(() => {
          this.getMaterialRequisitionDetails();
        }, 1000);
      }
    }
    initializeForms(): void {
      this.materialRequisitionForm = this.fb.group({
        // Remove MRNumber from form controls for new records
        mrNumber: [{value: '', disabled: true}],
        mrDate: ['', Validators.required],
        requiredDate: [''],
        mrStatusId: [null, Validators.required],
        PriorityId: [null,Validators.required],
        LocationId: [null, Validators.required],
        categoryId: [null, Validators.required],
        sectionId: [null, Validators.required],   // ✅ ADD THIS
        woNum: [''],
        mrRemarks: [''],
        userName: [{ value: '', disabled: true }],
        ...this.workflowService.initializeWorkflowControls(this.fb)
      });
      
      this.lineItemForm = this.fb.group({
        itemTypeId: ['', Validators.required],
        categoryId: [null, Validators.required],
        itemName: [null, Validators.required],
        description: new FormControl({ value: '', disabled: true }, Validators.required),
        uom: new FormControl({value:'',disabled:true}),
        testLab: [false],
        quantity: [0, [Validators.required, Validators.min(1)]],
        unitCost: [0, [Validators.required, Validators.min(0)]],
        totalAmount: [{value: 0, disabled: true}],
        remarks: ['']
      });
    }
    setDefaultValues(): void {
      // Set current date as MR Date
      this.materialRequisitionForm.controls['mrDate'].setValue(moment().format('YYYY-MM-DD'));
      
      // Don't set MR number for new records - it will be generated by backend
      if (this.mrId === 0) {
        this.mrNumberDisplay = 'Auto-generated';
      }
    }
    getMaterialRequisitionDetails(): void {
    console.log('Inside getMaterialRequisitionDetails()');
    console.log('Current mrId:', this.mrId);
        if (!this.mrId || this.mrId === 0) {
          return;
        }
        this._loading._loading.next(true);
        // Send request in the format expected by the API
        const request = {
          Params: [
            { Key: 'MRId', Value: this.mrId.toString() }
          ]
        };
        this.inventoryServices.getMaterialRequisitionDetails(request).subscribe({
          next: (res: IMaterialRequisitionDetailsResponse) => {
            this._loading._loading.next(false);
            this.loadFormDataFromResponse(res);
            this.showSaveButtons = this.lineItems.length > 0;
          },
          error: (error: any) => {
            this._loading._loading.next(false);
            console.error("Error loading MR details:", error);
            this.snackMsg('Error loading MR details', 'error');
          }
        });
    }
    loadFormDataFromResponse(response: IMaterialRequisitionDetailsResponse): void {
      // Load header data
      const header = response.header;
      this.mrNumberDisplay = header.mrNumber;
      const statusId = header.mrstatusId && header.mrstatusId > 0 
      ? header.mrstatusId.toString() 
      : null;
      this.materialRequisitionForm.patchValue({
        MRNumber: header.mrNumber,
        mrDate: header.requestedDate,
        requiredDate: header.requiredDate,
        mrStatusId: header.statusId?.toString(),
        PriorityId: header.priorityId?.toString(),
        LocationId: header.locationId?.toString(),
        categoryId: header.sectionCategoryId?.toString(),   // FIXED
        sectionId: header.sectionId?.toString(),
        receivedQty: header.receivedQty,
        woNum: header.woNum,
        poRemarks: header.remarks,
      });
      // Load line items
      this.lineItems = response.lineItems.map(item => ({
        id: item.mrliId || item.id,
        mrliId: item.mrliId,
        mrId: item.mrId,
        itemTypeId: item.itemTypeId,
        itemTypeName: item.itemTypeName,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        itemId: item.itemId,
        itemName: item.itemName,
        description: item.description || '',
        uom: item.uomName || item.uom,
        uomId: item.uomId,
        uomName: item.uomName,
        quantity: item.quantity || item.quantity,
        remarks: item.remarks || '',
        createdUserId: item.createdUserId,
        createdUserName: item.createdUserName,
        updatedUserId: item.updatedUserId,
        updatedUserName: item.updatedUserName,
        updatedDatetime: item.updatedDatetime,
        isSerialized: item.isSerialized
      }));
      this.lineItemsDataSource.data = this.lineItems;      
      if (header.mrstatusId) {
        this.isSubmitted = true;
      }
    }
    closeLineItemDialog(): void {
      this.showLineItemDialog = false;
      this.editLineItemIndex = -1;
      this.lineItemForm.reset();
    }
    editLineItem(index: number): void {
      this.openLineItemDialog(index);
    }
    deleteLineItem(index: number): void {
      if (confirm('Are you sure you want to delete this line item?')) {
        this.lineItems.splice(index, 1);
        this.lineItemsDataSource.data = [...this.lineItems];
        this.showSaveButtons = this.lineItems.length > 0;
        this.snackMsg('Line item deleted successfully', 'success');
      }
    }
    clear(): void {
      if (confirm('Are you sure you want to reset all data? This will clear all header and line item information.')) {
        if (this.mrId === 0) {
          this.materialRequisitionForm.reset();
          this.setDefaultValues();
          this.lineItems = [];
          this.lineItemsDataSource.data = [];
          this.showSaveButtons = false;
          this.mrNumberDisplay = 'Auto-generated';
        } else {
          this.getMaterialRequisitionDetails();
        }
        this.snackMsg('Form reset successfully', 'success');
      }
    }
    snackMsg(msg: string, type: string): void {
      this.snackBar.open(msg, 'close', {
        duration: 2000,
        panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar',
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
    isStatusSelected(): boolean {
        const statusValue = this.materialRequisitionForm.get('statusId')?.value;
        return statusValue && statusValue !== '';
    }
    prepareMRData(isDraft: number): any {
      const formValue = this.materialRequisitionForm.getRawValue();
      // Prepare the JSON structure as per the required format
      const mrData = {
        Id: this.mrId || 0,
        Draft: isDraft,
        MRDate: formValue.mrDate ? moment(formValue.mrDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        StatusId: formValue.mrStatusId ? Number(formValue.mrStatusId) : null,
        PriorityId: Number(formValue.PriorityId),
        LocationId: Number(formValue.LocationId),
        RequiredDate: formValue.requiredDate ? moment(formValue.requiredDate).format('YYYY-MM-DD') : null,
        WONum: formValue.woNum ? formValue.woNum : null,
        SectionId: Number(formValue.sectionId),
        sectionCategoryId: Number(formValue.categoryId),
        CreatedUser: this.commonService.loginStorageData.userId || 0,
        Remarks: formValue.mrRemarks || "",
        MRLineItems: this.lineItems.map(item => ({
          Id: item.id && item.id > 0 ? item.id : 0,
          ItemTypeId: Number(item.itemTypeId),
          CategoryId: Number(item.categoryId),
         UomId: Number(item.itemTypeUomId),  // ✅ ADD THIS
          ItemId: Number(item.itemId),
          Qty: Number(item.quantity),
          CreatedUser: this.commonService.loginStorageData.userId || 0,
          Remarks: item.remarks || ""
        }))
      };
      
      return mrData;
    }
    save(): void {
      if (!this.materialRequisitionForm.get('sectionId')?.value || 
          !this.materialRequisitionForm.get('PriorityId')?.value || 
          !this.materialRequisitionForm.get('LocationId')?.value) {
        this.snackMsg('Please fill Section, Priority and Location fields', 'error');
        return;
      }
      if (this.lineItems.length === 0) {
        this.snackMsg('Please add at least one line item', 'error');
        return;
      }
      try {
        const mrData = this.prepareMRData(1);
        this.submitMRData(mrData, 'saved');
      } catch (error) {
        this._loading._loading.next(false);
        this.snackMsg('Error saving Material Requisition', 'error');
      }
    }
    submit(): void {
      if (this.materialRequisitionForm.invalid) {
        this.snackMsg('Please fill all required fields', 'error');
        return;
      }
      if (this.lineItems.length === 0) {
        this.snackMsg('Please add at least one line item', 'error');
        return;
      }
      if (!this.isStatusSelected()) {
        this.snackMsg('Please select Status to submit', 'error');
        return;
      }
      try {
        this.onStatusChange();
        const mrData = this.prepareMRData(0);
        this.submitMRData(mrData, 'submitted');
      } catch (error) {
        this._loading._loading.next(false);
        this.snackMsg('Error submitting Material Requisition', 'error');
      }
    }
    submitMRData(mrData: any, action: string): void {
      this._loading._loading.next(true);
      this.inventoryServices.SubmitMaterialRequisition(mrData).subscribe({
        next: (response: any) => {
          this._loading._loading.next(false);
          if (response && response.message === 'Success') {
            this.snackMsg(`Material Requisition ${action} successfully`, 'success');
            this.isMRCreated = true;
            if (this.mrId === 0 && response.MRId) {
              this.mrId = response.MRId;
            }
            if (response.MRNumber) {
              this.mrNumberDisplay = response.MRNumber;
              this.materialRequisitionForm.controls['mrNumber'].setValue(response.MRNumber);
            }
            if (action === 'submitted') {
              this.isSubmitted = true;
            }
          this.message.emit(1);  // or response.status or any success value
          } else {
            this.snackMsg(`Error ${action} Material Requisition`, 'error');
          }
        },
        error: (error: { error: { message: any; }; message: any; }) => {
          this._loading._loading.next(false);
          console.error(`Error ${action} MR:`, error);
          this.snackMsg(`Error ${action} Material Requisition: ` + (error.error?.message || error.message || 'Unknown error'), 'error');
        }
      });
    }
    onStatusChange(): void {
      const statusId = this.materialRequisitionForm.get('mrStatusId')?.value;
      if (statusId) {
        const currentDetails = this.workflowService.getWorkflowFromForm(this.materialRequisitionForm);
        this.workflowDetails = this.workflowService.updateWorkflowDetails(
          Number(statusId),
          this.materialRequisitionStatuses,
          currentDetails,
          this.loginData
        );
        this.workflowService.updateFormGroup(this.materialRequisitionForm, this.workflowDetails);
        this.workflowConfig = this.workflowService.getWorkflowVisibility(
          this.workflowDetails,
          this.materialRequisitionStatuses,
          Number(statusId)
        );
      }
    }
    getAssetCategories() {
      let request: ICommonRequest = {} as ICommonRequest;
      const reqdata: IRequest[] = [
        { key: 'name', value: '' },
        { key: 'id', value: '' }
      ];
      request.Params = reqdata;
      this.assetService.getAssetCategories(request).subscribe((res: IAssetCategories[]) => {
        this.assetCategories = res;
        this.items = this.assetCategories.map(x => ({ code: x.assetCategoryId.toString(), value: x.assetCategoryCode }));
      });
    }
    getItemTypes(): void {
      this.inventoryServices.getItemTypes().subscribe({
        next: (res: IItemType[]) => {
          this.itemTypes = res;
          this.itemTypeItems = res.map(x => ({ code: x.id.toString(), value: x.name }));
        },
        error: (error: any) => console.error("Error loading item types:", error)
      });
    }
    loadItems(): void {
      const itemTypeId = this.lineItemForm.get('itemTypeId')?.value;
      const categoryId = this.lineItemForm.get('categoryId')?.value;
      if (itemTypeId && categoryId) {
        const request = { 
          Params: [
            { key: 'ItemTypeId', value: itemTypeId },
            { key: 'CategoryId', value: categoryId }
          ]
        };
        this.inventoryServices.getItemsByCategoryAndType(request).subscribe({
          next: (res: IItemTypeData[]) => {
            this.currentItemTypeData = res;
            this.filteredItems = res.map(item => ({
              code: item.itemtype_id.toString(),
              value: item.itemtype_name
            }));
          },
          error: (error: any) => console.error("Error loading items:", error)
        });
      }
    }
    onItemNameChange(): void {
      const selectedItemId = this.lineItemForm.get('itemName')?.value;
      if (selectedItemId && this.currentItemTypeData) {
        const selected = this.currentItemTypeData.find(x => x.itemtype_id.toString() === selectedItemId);
        if (selected) {
          this.lineItemForm.patchValue({
            description: selected.itemtype_desc || '',
            uom: selected.itemtype_uom || ''
          });
        }
      }
    }
    openLineItemDialog(index: number = -1): void {
      this.editLineItemIndex = index;
      this.showLineItemDialog = true;
      // First, populate the form with existing values
      if (index >= 0) {
        const item = this.lineItems[index];
        this.lineItemForm.patchValue({
          itemTypeId: item.itemTypeId?.toString(),
          categoryId: item.categoryId?.toString(),
          itemName: item.itemId?.toString() || item.itemName,
          description: item.description || '',
          uom: item.uom || '',
          quantity: item.quantity || 0,
          remarks: item.remarks || ''
        });
        // Then load the items based on itemType and category WITHOUT resetting
        const itemTypeId = item.itemTypeId?.toString();
        const categoryId = item.categoryId?.toString();
        if (itemTypeId && categoryId) {
          // Load items for this combination
          this.loadItemsForEdit(itemTypeId, categoryId);
        }
      } else {
        this.lineItemForm.reset({
          testLab: false,
          quantity: 0,
          unitCost: 0,
          totalAmount: 0,
          remarks: ''
        });
      }
      // Update categories dropdown
      this.updateCategoriesByItemType();
    }
    loadItemsForEdit(itemTypeId: string, categoryId: string): void {
      const request = { 
        Params: [
          { key: 'ItemTypeId', value: itemTypeId },
          { key: 'CategoryId', value: categoryId }
        ]
      };
      this.inventoryServices.getItemsByCategoryAndType(request).subscribe({
        next: (res: IItemTypeData[]) => {
          this.currentItemTypeData = res;
          this.filteredItems = res.map(item => ({
            code: item.itemtype_id.toString(),
            value: item.itemtype_name
          }));
        },
        error: (error: any) => console.error("Error loading items:", error)
      });
    }
    updateCategoriesByItemType(): void {
      this.categoryItems = this.categories.map(c => ({ 
        code: c.id.toString(), 
        value: c.name 
      }));
      // Only reset category, itemName, description, and uom if NOT in edit mode
      // or if itemTypeId has actually changed
      const currentItemTypeId = this.lineItemForm.get('itemTypeId')?.value;
      const originalItemTypeId = this.editLineItemIndex >= 0 
        ? this.lineItems[this.editLineItemIndex].itemTypeId?.toString() 
        : null;
      // Reset only if it's a new item OR the item type has changed
      if (this.editLineItemIndex === -1 || (originalItemTypeId && currentItemTypeId !== originalItemTypeId)) {
        this.lineItemForm.patchValue({ 
          categoryId: null, 
          itemName: null, 
          description: '', 
          uom: '' 
        });
        this.filteredItems = [];
      }
    }
    onCategoryChange(): void {
      const itemTypeId = this.lineItemForm.get('itemTypeId')?.value;
      const categoryId = this.lineItemForm.get('categoryId')?.value;
      this.lineItemForm.patchValue({ 
        itemName: '', 
        description: '', 
        uom: '' 
      });
      if (itemTypeId && categoryId) {
        this.loadItems();
      } else {
        this.filteredItems = [];
      }
    }
    getSessionList(categoryId: string): void {

      const request = {
        Params: [
          { key: 'CategoryId', value: categoryId }
        ]
      };

      this.inventoryServices.getSessionsList(request).subscribe({

        next: (res: ISectionList) => {

          console.log("API response received:", res);
          this.sessionList = res.map((session: any) => ({
            code: session.id?.toString(),
            value: session.name
          }));

          console.log("Mapped sessionList:", this.sessionList);

        },

        error: (error: any) => {
          console.error('Error loading sessions:', error);
        }

      });
    }
    onHeaderCategoryChange(): void {
      const categoryId = this.materialRequisitionForm.get('categoryId')?.value;
      console.log("Header Category Selected:", categoryId);
      if(categoryId){
      this.getSessionList(categoryId);
      }
    }
    getCategories(): void {
      this.inventoryServices.getCategories().subscribe({
        next: (res: ICategory[]) => {
          this.categories = res;
          this.categoryItems = res.map(x => ({ 
            code: x.id.toString(), 
            value: x.name 
          }));
        }
      });
    }
    saveLineItem(): void {
      if (this.lineItemForm.invalid) {
        this.snackMsg('Please fill all required fields', 'error');
        return;
      }
      const formValue = this.lineItemForm.getRawValue();
      const totalAmount = formValue.quantity * formValue.unitCost;
      const selectedItem = this.currentItemTypeData.find(
        x => x.itemtype_id.toString() === formValue.itemName
      );
      const lineItem: IMaterialRequisitionLineItem = {
        id: this.editLineItemIndex >= 0 ? this.lineItems[this.editLineItemIndex].id : this.generateTempId(),
        mrId: this.mrId,
        itemTypeId: Number(formValue.itemTypeId),
        itemTypeName: this.itemTypes.find(t => t.id === Number(formValue.itemTypeId))?.name || '',
        categoryId: Number(formValue.categoryId),
        categoryName: this.categories.find(c => c.id === Number(formValue.categoryId))?.name || '',
        itemId: Number(formValue.itemName),
        itemName: selectedItem?.itemtype_name || formValue.itemName,
        description: formValue.description || selectedItem?.itemtype_desc || '',
        // uom: formValue.uom || selectedItem?.itemtype_uom || '',
        uom: formValue.uom || selectedItem?.itemtype_uom || '',
        itemTypeUomId: selectedItem?.itemtype_uom_id || 0,   // ✅ ADD THIS
        quantity: formValue.quantity,
        remarks: formValue.remarks || '',
        mrliId: 0,
        uomName: '',
        uomId: 0,
        createdUserId: 0,
        createdUserName: '',
        updatedUserId: 0,
        updatedUserName: '',
        updatedDatetime: '',
        //requestedQty: 0
      };
      if (this.editLineItemIndex >= 0) {
        this.lineItems[this.editLineItemIndex] = lineItem;
      } else {
        this.lineItems.push(lineItem);
      }
      this.lineItemsDataSource.data = [...this.lineItems];
      this.closeLineItemDialog();
      this.showSaveButtons = this.lineItems.length > 0;
      this.snackMsg('Line item saved successfully', 'success');
    }
    generateTempId(): number {
      return -1 * (this.lineItems.length + 1);
    }
    getLocations(): void {
      this.inventoryServices.getLocations().subscribe({
        next: (res: any[]) => {
          this.locations = res;
          this.locationItems = res.map(x => ({ code: x.id.toString(), value: x.name }));
        },
      });
    }
    getMRStatusTypes(): void {
      this.inventoryServices.getMaterialRequisitionStatus().subscribe({
        next: (res: any[]) => {
          this.materialRequisitionStatuses = res;
          console.log(" get inv status" +JSON.stringify(this.materialRequisitionStatuses));
          this.statusItems = res.map(x => ({ code: x.id.toString(), value: x.name }));
        },
      });
    }
    getPriorities(): void {
      this.inventoryServices.getPriorities().subscribe({
        next: (res: any[]) => {
          this.priorities = res;
          this.priorityItems = res.map(x => ({ code: x.id.toString(), value: x.name }));
        },
      });
    }
  //   getUnits() {
  //     let unitsrequest: IGetSearchRequest = {} as IGetSearchRequest;
  //       unitsrequest = {
  //       SearchByName:  '',
  //       SearchByValue:  ''
  //     }
  //     this.commonService.getUnits(unitsrequest).subscribe((res: any) => {
  //       this.deptItems = res.map((x: any) => ({
  //       code: x.id.toString(),
  //       value: x.unitCode,
  //     }));
  //   });
  // }
  loadAllDropdownData(): void {
    // this.getUnits();
    this.getLocations();
    this.getMRStatusTypes();
    this.getPriorities();
    this.getItemTypes();
    this.getCategories();
  } 
}