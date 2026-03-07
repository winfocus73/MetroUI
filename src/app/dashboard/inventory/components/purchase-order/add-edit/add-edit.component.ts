import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { IDropdown } from '@shared/models/dropdown';
import { IFormCheck } from '@shared/models/role-check';
import { ILoginData } from '@auth/models/login.response';
import { CommonService } from '@shared/services/common.service';
import { LoadingService } from '@shared/services/spinner.service';
import * as moment from 'moment';
import { ICommonRequest, IRequest } from '@shared/models';
import { IAssetCategories } from '@dashboard/config-assets/models/asset-categories';
import { AssetService } from '@dashboard/config-assets/services/asset.service';
import { WorkflowService } from '@shared/services/workflow.service';
import { IWorkflowConfig, IWorkflowDetails } from '@shared/models/workflow.model';

import { ICategory, IItemType, IPurchaseOrderAddEdit, IPurchaseOrderLineItem, IPurchaseOrderDetailsResponse, IVendor, IPurchaseOrderStatus, IPriority, ILocation } from '@dashboard/inventory/models/purchase-order';
import { InventoryService } from '@dashboard/inventory/services/inventory.service';
import { IItemTypeData } from '@dashboard/inventory/models/purchase-order';
import { ScreenLabelService, IScreenLabelResponse } from '@shared/services/screen-label.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'nxasm-po-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class PurchaseOrderAddEditComponent implements OnInit, OnChanges {
  @Input() purchaseOrderId!: number;
  @Input() objForm: IFormCheck = {} as IFormCheck;
  @Output() message = new EventEmitter();
  @Input() labels: { [key: string]: string } = {};

  today = new Date();
  purchaseOrderForm!: UntypedFormGroup;
  addEditRequest: IPurchaseOrderAddEdit = {} as IPurchaseOrderAddEdit;
  categoryId = 0;
  isPOCreated = false;
  isSubmitted: boolean = false;
  LoginUserInfo: ILoginData = {} as ILoginData;
  showSaveButtons = false;

  itemTypeData: IItemTypeData[] = [];
  filteredItems: IDropdown[] = [];
  currentItemTypeData: IItemTypeData[] = [];
  
  workflowDetails!: IWorkflowDetails;
  workflowConfig!: IWorkflowConfig;
  vendors: IVendor[] = [];
    
  purchaseOrderStatuses: IPurchaseOrderStatus[] = [];
  priorities: IPriority[] = [];
  locations: ILocation[] = [];
  itemTypes: IItemType[] = [];
  categories: ICategory[] = [];
  vendorItems: IDropdown[] = [];
  statusItems: IDropdown[] = [];
  priorityItems: IDropdown[] = [];
  locationItems: IDropdown[] = [];
  itemTypeItems: IDropdown[] = [];
  categoryItems: IDropdown[] = [];
    
  displayedColumns: string[] = ['sno', 'itemType', 'category', 'itemName', 'description', 'uom', 'testLab', 'quantity', 'unitCost', 'totalAmount', 'action'];
  lineItemsDataSource = new MatTableDataSource<IPurchaseOrderLineItem>();
  lineItems: IPurchaseOrderLineItem[] = [];
  dialogRef!: MatDialogRef<any>;
  loginData: ILoginData = {} as ILoginData;
  lineItemForm!: UntypedFormGroup;
  showLineItemDialog = false;
  editLineItemIndex = -1;
  
  dateFormat = 'YYYY-MM-DDTHH:mm:ss';
  assetCategories: IAssetCategories[] = [];
  items: IDropdown[] = [];
  poNumberDisplay: string = '';
  //for labels
  private destroy$ = new Subject<void>();
  private _selectedLanguage: string = 'en';
  constructor(private snackBar: MatSnackBar, public dialog: MatDialog, private fb: UntypedFormBuilder, private commonService: CommonService,
    private _loading: LoadingService, private assetService: AssetService, private workflowService: WorkflowService,
    private inventoryService: InventoryService,
    private screenLabelService: ScreenLabelService 
  ){}
  
  ngOnInit(): void {
    this.loadScreenLabels();
    this.initializeForms();
    // this.loginData = this.commonService.loginStorageData;
    const loginStorage: any = this.commonService.loginStorageData;
    const userName = loginStorage?.loginData?.userName || '';
    this.purchaseOrderForm.get('userName')?.setValue(userName);
    this.loadAllDropdownData();
    this.setDefaultValues();
    if (this.purchaseOrderId > 0) {
      this.getPurchaseOrderDetails();
    } 
    else {
      this.poNumberDisplay = 'Auto-generated';
    }
    this.getAssetCategories();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['purchaseOrderId'] && changes['purchaseOrderId'].currentValue > 0) {
      setTimeout(() => {
        this.getPurchaseOrderDetails();
      }, 1000);
    }
    if (changes['selectedLanguage'] && !changes['selectedLanguage'].firstChange) {
      this.loadScreenLabels();
    }
  }

  @Input() set selectedLanguage(lang: string) {
    this._selectedLanguage = lang;
    this.loadScreenLabels(); 
  }

  get selectedLanguage(): string {
    return this._selectedLanguage;
  }
  loadScreenLabels(): void {
    this._loading._loading.next(true);
    this.screenLabelService.getScreenLabels('PURCHASE_ORDER_ADD_EDIT', this.selectedLanguage)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: IScreenLabelResponse) => {
      this._loading._loading.next(false);
          
      if (response.success && response.data && response.data.length > 0) {// Convert array to key-value object
        const newLabels: { [key: string]: string } = {};
        response.data.forEach(item => {
        newLabels[item.lbl_name] = item.lbl_value;
        });
        this.labels = newLabels;
      }
      },
    });
  }
  getLabel(key: string, fallback: string): string {
     return this.labels[key] || fallback;
  }
  initializeForms(): void {
    this.purchaseOrderForm = this.fb.group({
      poNumber: [{value: '', disabled: true}],
      poDate: ['', Validators.required],
      poRequiredDate: [''],
      poVendorId: [null, Validators.required],
      poStatusId: [],
      poPriorityId: [null,Validators.required],
      poLocationId: [null, Validators.required],
      poEstimateCost: [0],
      poRemarks: [''],
      poShipTo: [''],
      poBillTo: [''],
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
    this.purchaseOrderForm.controls['poDate'].setValue(moment().format('YYYY-MM-DD'));
    if (this.purchaseOrderId === 0) {
      this.poNumberDisplay = 'Auto-generated';
      }
  }
  getPurchaseOrderDetails(): void {
    if (!this.purchaseOrderId || this.purchaseOrderId === 0) {
      return;
    }
    this._loading._loading.next(true);
    const request = {
      Params: [
        { Key: 'POId', Value: this.purchaseOrderId.toString() }
      ]
    };
    this.inventoryService.getPurchaseOrderDetails(request).subscribe({
      next: (res: IPurchaseOrderDetailsResponse) => {
        this._loading._loading.next(false);
        this.loadFormDataFromResponse(res);
        this.showSaveButtons = this.lineItems.length > 0;
      },
    });
  }
  loadFormDataFromResponse(response: IPurchaseOrderDetailsResponse): void {
    const header = response.header;
    this.poNumberDisplay = header.poNumber;
    const statusId = header.statusId && header.statusId > 0 
    ? header.statusId.toString() 
    : null;
      
    this.purchaseOrderForm.patchValue({
      poNumber: header.poNumber,
      poDate: header.orderDate,
      poRequiredDate: header.requiredDate,
      poVendorId: header.vendorId?.toString(),
      poStatusId: header.statusId ? header.statusId.toString() : null,
      poPriorityId: header.priorityId?.toString(),
      poLocationId: header.locationId?.toString(),
      poEstimateCost: header.estimateCost,
      poRemarks: header.remarks,
      poShipTo: header.shipTo,
    });// Load line items
    this.lineItems = response.lineItems.map(item => ({
      id: item.poliId || item.id,
      poliId: item.poliId,
      Id: item.Id,
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
      testLab: item.isSerialized || false,
      quantity: item.orderedQty || item.quantity,
      orderedQty: item.orderedQty,
      unitCost: item.unitCost,
      totalAmount: item.totalPrice || item.totalAmount,
      totalPrice: item.totalPrice,
      remarks: item.remarks || '',
      createdUserId: item.createdUserId,
      createdUserName: item.createdUserName,
      updatedUserId: item.updatedUserId,
      updatedUserName: item.updatedUserName,
      updatedDatetime: item.updatedDatetime,
      isSerialized: item.isSerialized
    }));
    this.lineItemsDataSource.data = this.lineItems;
    this.calculateTotalEstimateCost();
    if (header.statusId) {
      this.isSubmitted = true;
    }
  }
  
  closeLineItemDialog(): void {
    this.showLineItemDialog = false;
    this.editLineItemIndex = -1;
    this.lineItemForm.reset();
  }
  calculateTotalAmount(): void {
    const quantity = this.lineItemForm.controls['quantity'].value || 0;
    const unitCost = this.lineItemForm.controls['unitCost'].value || 0;
    const totalAmount = quantity * unitCost;
    this.lineItemForm.controls['totalAmount'].setValue(totalAmount);
  }
  calculateTotalEstimateCost(): void {
    const total = this.lineItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    this.purchaseOrderForm.controls['poEstimateCost'].setValue(total);
  }
  editLineItem(index: number): void {
    this.openLineItemDialog(index);
  }
  deleteLineItem(index: number): void {
    if (confirm('Are you sure you want to delete this line item?')) {
      this.lineItems.splice(index, 1);
      this.lineItemsDataSource.data = [...this.lineItems];
      this.calculateTotalEstimateCost();
      this.showSaveButtons = this.lineItems.length > 0;
      this.snackMsg('Line item deleted successfully', 'success');
    }
  }
  clear(): void {
    if (confirm('Are you sure you want to reset all data? This will clear all header and line item information.')) {
      if (this.purchaseOrderId === 0) {
        this.purchaseOrderForm.reset();
        this.setDefaultValues();
        this.lineItems = [];
        this.lineItemsDataSource.data = [];
        this.showSaveButtons = false;
        this.poNumberDisplay = 'Auto-generated';
      } 
      else {
        this.getPurchaseOrderDetails();
      }
      this.snackMsg('Form reset successfully', 'success');
    }
  }
  snackMsg(msg: string, type: string): void {
    const displayMsg = this.labels[msg] || msg;
    this.snackBar.open(displayMsg, this.getLabel('close', 'close'), {
    duration: 2000,
    panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar',
    horizontalPosition: 'end',
    verticalPosition: 'top'
    });
  }
  isStatusSelected(): boolean {
    const statusValue = this.purchaseOrderForm.get('poStatusId')?.value;
      return statusValue && statusValue !== '';
  }
  
  preparePOData(isDraft: number): any {
    const formValue = this.purchaseOrderForm.getRawValue();

    const loginStorage: any = this.commonService.loginStorageData;
    const userId = loginStorage?.loginData?.id || 1;
    const userName = loginStorage?.loginData?.userName || '';
    const poData = {
      Id: this.purchaseOrderId || 0,  
      Draft: isDraft,
      VendorId: Number(formValue.poVendorId),
      PODate: formValue.poDate ? moment(formValue.poDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      StatusId: formValue.poStatusId ? Number(formValue.poStatusId) : null,
      PriorityId: Number(formValue.poPriorityId),
      LocationId: Number(formValue.poLocationId),
      RequiredDate: formValue.poRequiredDate ? moment(formValue.poRequiredDate).format('YYYY-MM-DD') : null,
      EstimateCost: Number(formValue.poEstimateCost),
      CreatedUser: userId,
      Remarks: formValue.poRemarks || "",
      ShipTo: formValue.poShipTo || "",
      BillTo: formValue.poBillTo || "",
      LineItems: this.lineItems.map(item => ({
        Id: item.id && item.id > 0 ? item.id : 0,
        ItemTypeId: Number(item.itemTypeId),
        CategoryId: Number(item.categoryId),
        ItemId: Number(item.itemId),
        Qty: Number(item.quantity),
        UnitPrice: Number(item.unitCost),
        TotalAmt: Number(item.totalAmount),
        CreatedUser: userId,
        Remarks: item.remarks || ""
      }))
    };
    return poData;
  }
  save(): void {
    if (!this.purchaseOrderForm.get('poVendorId')?.value || 
        !this.purchaseOrderForm.get('poPriorityId')?.value || 
        !this.purchaseOrderForm.get('poLocationId')?.value) {
        this.snackMsg('Please fill Vendor, Priority and Location fields', 'error');
        return;
    }
    if (this.lineItems.length === 0) {
      this.snackMsg('Please add at least one line item', 'error');
      return;
    }
    const poData = this.preparePOData(1);
    this.submitPOData(poData, 'saved');
  }
  submit(): void {
    if (this.purchaseOrderForm.invalid) {
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
    this.onStatusChange();
    const poData = this.preparePOData(0);
    this.submitPOData(poData, 'submitted'); 
  }
  submitPOData(poData: any, action: string): void {
    this._loading._loading.next(true);
    this.inventoryService.submitPurchaseOrder(poData).subscribe({
      next: (response: any) => {
        this._loading._loading.next(false);
        if (response && response.message === 'Success') {
          this.snackMsg(`Purchase Order ${action} successfully`, 'success');
          this.isPOCreated = true;
          if (this.purchaseOrderId === 0 && response.poId) {
            this.purchaseOrderId = response.poId;
          }
          if (response.poNumber) {
            this.poNumberDisplay = response.poNumber;
            this.purchaseOrderForm.controls['poNumber'].setValue(response.poNumber);
          }
          if (action === 'submitted') {
            this.isSubmitted = true;
          }
          this.message.emit(1);
        } else {
          this.snackMsg(`Error ${action} Purchase Order`, 'error');
        }
      },
    });
  }
  onStatusChange(): void {
    const statusId = this.purchaseOrderForm.get('poStatusId')?.value;
    if (statusId) {
      const currentDetails = this.workflowService.getWorkflowFromForm(this.purchaseOrderForm);
      this.workflowDetails = this.workflowService.updateWorkflowDetails(
        Number(statusId),
        this.purchaseOrderStatuses,
        currentDetails,
        this.loginData
      );
      this.workflowService.updateFormGroup(this.purchaseOrderForm, this.workflowDetails);
      this.workflowConfig = this.workflowService.getWorkflowVisibility(
        this.workflowDetails,
        this.purchaseOrderStatuses,
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
    this.inventoryService.getItemTypes().subscribe({
      next: (res: IItemType[]) => {
        this.itemTypes = res;
        this.itemTypeItems = res.map(x => ({ code: x.id.toString(), value: x.name }));
      },
        
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
      this.inventoryService.getItemsByCategoryAndType(request).subscribe({
        next: (res: IItemTypeData[]) => {
          this.currentItemTypeData = res;
          this.filteredItems = res.map(item => ({
            code: item.itemtype_id.toString(),
            value: item.itemtype_name
          }));
        },
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
    if (index >= 0) {
      const item = this.lineItems[index];
      this.lineItemForm.patchValue({
        itemTypeId: item.itemTypeId?.toString(),
        categoryId: item.categoryId?.toString(),
        itemName: item.itemId?.toString() || item.itemName,
        description: item.description || '',
        uom: item.uom || '',
        testLab: item.testLab || false,
        quantity: item.quantity || 0,
        unitCost: item.unitCost || 0,
        totalAmount: item.totalAmount || 0,
        remarks: item.remarks || ''
      });
      const itemTypeId = item.itemTypeId?.toString();
      const categoryId = item.categoryId?.toString();
      if (itemTypeId && categoryId) {
          this.loadItemsForEdit(itemTypeId, categoryId);
      }
    } 
    else {
      this.lineItemForm.reset({
        testLab: false,
        quantity: 0,
        unitCost: 0,
        totalAmount: 0,
        remarks: ''
      });
    }
    this.updateCategoriesByItemType();
  }

  loadItemsForEdit(itemTypeId: string, categoryId: string): void {
    const request = { 
      Params: [
        { key: 'ItemTypeId', value: itemTypeId },
        { key: 'CategoryId', value: categoryId }
      ]
    };
    this.inventoryService.getItemsByCategoryAndType(request).subscribe({
      next: (res: IItemTypeData[]) => {
        this.currentItemTypeData = res;
        this.filteredItems = res.map(item => ({
          code: item.itemtype_id.toString(),
          value: item.itemtype_name
        }));
      },
    });
  }
  
  updateCategoriesByItemType(): void {
    this.categoryItems = this.categories.map(c => ({ 
      code: c.id.toString(), 
      value: c.name 
    }));
    const currentItemTypeId = this.lineItemForm.get('itemTypeId')?.value;
    const originalItemTypeId = this.editLineItemIndex >= 0 
      ? this.lineItems[this.editLineItemIndex].itemTypeId?.toString() 
      : null;
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
    } 
    else {
      this.filteredItems = [];
    }
  }
  getCategories(): void {
    this.inventoryService.getCategories().subscribe({
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
    const lineItem: IPurchaseOrderLineItem = {
      id: this.editLineItemIndex >= 0 ? this.lineItems[this.editLineItemIndex].id : this.generateTempId(),
      Id: this.purchaseOrderId,
      itemTypeId: Number(formValue.itemTypeId),
      itemTypeName: this.itemTypes.find(t => t.id === Number(formValue.itemTypeId))?.name || '',
      categoryId: Number(formValue.categoryId),
      categoryName: this.categories.find(c => c.id === Number(formValue.categoryId))?.name || '',
      itemId: Number(formValue.itemName),
      itemName: selectedItem?.itemtype_name || formValue.itemName,
      description: formValue.description || selectedItem?.itemtype_desc || '',
      uom: formValue.uom || selectedItem?.itemtype_uom || '',
      testLab: formValue.testLab,
      quantity: formValue.quantity,
      unitCost: formValue.unitCost,
      totalAmount: totalAmount,
      remarks: formValue.remarks || ''
    };
    if (this.editLineItemIndex >= 0) {
      this.lineItems[this.editLineItemIndex] = lineItem;
    } else {
      this.lineItems.push(lineItem);
    }
    this.lineItemsDataSource.data = [...this.lineItems];
    this.calculateTotalEstimateCost();
    this.closeLineItemDialog();
    this.showSaveButtons = this.lineItems.length > 0;
    this.snackMsg('Line item saved successfully', 'success');
  }
  generateTempId(): number {
    return -1 * (this.lineItems.length + 1);
  }
  getVendors(): void {
    this.inventoryService.getVendors().subscribe({
      next: (res: any[]) => {
        this.vendors = res;
        this.vendorItems = res.map(x => ({ code: x.id.toString(), value: x.name }));
      },
    });
  }
  getLocations(): void {
    this.inventoryService.getLocations().subscribe({
      next: (res: any[]) => {
        this.locations = res;
        this.locationItems = res.map(x => ({ code: x.id.toString(), value: x.name }));
      },
    });
  }
  getPOStatusTypes(): void {
    this.inventoryService.getPoStatus().subscribe({
      next: (res: any[]) => {
        this.purchaseOrderStatuses = res;
        this.statusItems = res.map(x => ({ code: x.id.toString(), value: x.name }));
      },
    });
  }
  getPriorities(): void {
    this.inventoryService.getPriorities().subscribe({
      next: (res: any[]) => {
        this.priorities = res;
        this.priorityItems = res.map(x => ({ code: x.id.toString(), value: x.name }));
      },
    });
  }
  loadAllDropdownData(): void {
    this.getVendors();
    this.getLocations();
    this.getPOStatusTypes();
    this.getPriorities();
    this.getItemTypes();
    this.getCategories();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}