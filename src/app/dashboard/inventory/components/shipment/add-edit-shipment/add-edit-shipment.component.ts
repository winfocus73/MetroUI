import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/shared/services/common.service';
import { IDesignation } from 'src/app/dashboard/configuration-setup/models/designation/designation';
import { IDropdown } from 'src/app/shared/models/dropdown';
import { HttpApi } from 'src/app/core/http/http-api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICommonRequest } from 'src/app/shared/models/common-request';
import { ILookupData, ILookupValue } from 'src/app/shared/models/lookup-data';
import { IFormCheck } from '@shared/models/role-check';
import { LocationsDialogComponent } from '@shared/components/location-dialog/location-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PermittoWorkService } from '@dashboard/planning-scheduling/permit-to-work/services/permit-to-work.service';
import { Column } from '@shared/models';
import { IVendor } from '@dashboard/planning-scheduling/permit-to-work/models/vendor';
import { ShipmentSerialNoComponent } from './shipment-serial-no/shipment-serial-no.component';
import { ShipmentService } from '../services/shipment.service';
import { addEditShipmentResponse } from '../../models/add-edit-shipmentResponse';
import { IPONumberDropdown } from '../../models/shipment';
import { ActivatedRoute } from '@angular/router';
import { IRequest } from '@shared/models/common-request';

@Component({
  selector: 'app-add-edit-shipment',
  templateUrl: './add-edit-shipment.component.html',
  styleUrls: ['./add-edit-shipment.component.scss']
})
export class AddEditShipmentComponent implements OnInit {
isShipmentSaved: boolean = false;
isSaving: boolean = false;
  private editShipmentIdFromRoute = 0;
  private pendingPoNumberToPatch = '';
  private isEditMode = false;
  private autoLoadEditLineItemsPending = false;
  private savedShipmentLineItems: any[] = [];
  private rowUidCounter = 1;
  @Input() staffId!: number;
  @Input() objForm: IFormCheck = {} as IFormCheck;
  dropdown: IDropdown[] = [];
  status: IDropdown[] = HttpApi.statusData;
  designations: IDesignation[] =[];
  shipmentForm!: UntypedFormGroup ;
  @Output() message = new EventEmitter();
  request: ICommonRequest = {} as ICommonRequest;
  lookupData: ILookupData[] =[];
  agencyNames: IVendor[] = [];
  locationDialogRef!: MatDialogRef<LocationsDialogComponent>;
  vendorNames: IVendor[] | any;
  statuses!: ILookupValue[];
  PoData: IPONumberDropdown[] = [];
  shipmentDetailsTableRef!: ElementRef;
  actionTemplate!: TemplateRef<any>;
  objSearch = {
      PageNo: 1,
      PageSize: 1,
      TotalRecords: 0
     }
  shipmentId: number = 0;
  shipmentDetailId:any;
  isNotFound = false;
  showShipmentTable: boolean = false;
  addEditShipmentResponse!: { status: number };
  locations: any[] = [];
  constructor(private fb: UntypedFormBuilder, private shipmentService: ShipmentService,
  private commonService: CommonService, private snackBar: MatSnackBar, private dialog: MatDialog,
  private permitService: PermittoWorkService, private route: ActivatedRoute) {}
  shipmentDetail: any[] = [];
  recivedShipmentDetails: any[] = [];
  addEditShipmentRequest: any = {
  shipment: {}
  };
  header: any = {
  invoiceNumber: 'SHIP001',
  poNumber: 'PO10001',
  vendor: 'C K Enterprises'
  };

  poLineItems:any[] = [];
  lineItems:any[] = [];
  tableColumns: Array<Column> = [
    {
      columnDef: 'index',
      header: 'S No',
      cell: (element: Record<string, any>) => ''
    },
    {
      columnDef: 'itemTypeName',
      header: 'Item Type Name',
      cell: (element: Record<string, any>) => `${element['itemTypeName']}`
    },
    {
      columnDef: 'categoryName',
      header: 'Item Category',
      cell: (element: Record<string, any>) => `${element['categoryName']}`
    },
    {
      columnDef: 'itemNum',
      header: 'Item Name',
      cell: (element: Record<string, any>) => `${element['itemNum']}`
    },
    {
      columnDef: 'uomName',
      header: 'UOM',
      cell: (element: Record<string, any>) => `${element['uomName']}`
    },
    {
      columnDef: 'orderQty',
      header: 'Order Qty',
      cell: (element: Record<string, any>) => `${element['orderQty']}`
    },
    {
      columnDef: 'sendToTestLab',
      header: 'Test Lab',
      cell: (element: Record<string, any>) => `${element['sendToTestLab']}`
    },
    {
      columnDef: 'Choose',
      header: 'Select',
      cell: (element: Record<string, any>)  => `${element['rowUid'] ?? element['poLineItemId'] ?? element['id']}`,
      // isEditbtn:true,
       isEditbtn: true,
      className:'btn btn-sm btn-primary' 
    }
  ];

  get isUpdateMode(): boolean {
    return this.isEditMode || Number(this.shipmentId) > 0;
  }

  ngOnInit(): void {
        this.validateStaffdSave();
        this.getLookUpData();
         this.getVendors();
         this.getLocations();
         this.getStatusTypes();
         this.getPoListByShipmentApprovedOrNotComplete();
         this.route.queryParams.subscribe((params: { [x: string]: any; }) => {
          const shipmentId = Number(params['id']) || 0;
          if (shipmentId > 0) {
            this.isEditMode = true;
            this.editShipmentIdFromRoute = shipmentId;
            this.loadShipmentById(shipmentId);
          }
         });
          this.shipmentForm.get('poNumber')?.valueChanges.subscribe((id: any) => {

    console.log("Selected PO ID:", id);

    if (!id) {
      this.poLineItems = [];
      this.lineItems = [];
      return;
    }

    this.onPoChange(id);

  });
  }

  editShipmentId(id: number | string): void {
    const numericId = Number(id);
    if (!numericId) {
      return;
    }

    const currentIndex = this.poLineItems.findIndex(
      x => Number(x.rowUid ?? x.poLineItemId ?? x.id) === numericId
    );

    if (currentIndex < 0) {
      this.snackBar.open('Unable to find selected line item', 'Close', { duration: 2500 });
      return;
    }

    const selectedItem = this.poLineItems[currentIndex];
    const newBatchRow = {
      ...selectedItem,
      rowUid: this.getNextRowUid(),
      batchNo: '',
      receivedQty: null,
      isSerialized: selectedItem.isSerialized ?? 'NonSerialized',
      isSerialCompleted: false,
      isBatchDuplicate: false,
      serialCount: 0
    };

    this.lineItems.push(newBatchRow);
    this.lineItems = [...this.lineItems];
  }

  private getNextRowUid(): number {
    return this.rowUidCounter++;
  }

  refreshTableData(e: any) {
      // this.getAssetRegistryList();
  }

  getVendorsList() {
      this.permitService.getVendorList().subscribe((res: any) => {
        this.vendorNames = res;
      });
  }

  onRowCheck(row: any) {
    console.log('Checked row:', row);
  }

  validateStaffdSave() {
     this.shipmentForm = this.fb.group({
      invoiceNum: ['', Validators.required],
      poNumber: ['', Validators.required],
      vendor: ['', Validators.required],
      carrierName: ['', Validators.required],
      vehicleNum: ['', Validators.required],
      driverName: ['', Validators.required],
      mobile:['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      recivedDate: ['', Validators.required],
      status:['', Validators.required],
      locationId:[''],  
      locationName:[''],
      remarks:['', Validators.required],
      preparedBy:['', Validators.required],
      preparedDate:['', Validators.required],
      reviewedBy:['', Validators.required],
      reviewedDate:['', Validators.required],
      approvedBy:['', Validators.required],
      approvedDate:['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.staffId = changes['staffId'].currentValue;
      if(this.staffId > 0) {
        setTimeout(() => {
        // this.getStaffDetails();
        }, 1000);

      }
  }
  
  getLookUpData() {
  }

  clear() {
      this.shipmentForm.reset();
      this.isShipmentSaved = false;
      this.shipmentId = 0;
      this.editShipmentIdFromRoute = 0;
      this.isEditMode = false;
      this.autoLoadEditLineItemsPending = false;
      this.savedShipmentLineItems = [];
  }

  private loadShipmentById(shipmentId: number): void {
    const requestBody = {
      Params: [
        { Key: 'sId', Value: shipmentId.toString() }
      ]
    };

    this.shipmentService.getShipmentById(requestBody).subscribe({
      next: (res: any) => {
        const { data, header, lineItems } = this.normalizeShipmentResponse(res);
        this.savedShipmentLineItems = lineItems;
        this.autoLoadEditLineItemsPending = this.isEditMode && this.savedShipmentLineItems.length > 0;

        if (!header || Object.keys(header).length === 0) {
          console.log('getShipmentById unexpected response:', data);
          this.snackBar.open('Shipment data not found for edit', 'Close', { duration: 3000 });
          return;
        }

        this.shipmentId = Number(header.id) || shipmentId;
        this.patchShipmentHeader(header);
        if (this.isEditMode && this.savedShipmentLineItems.length === 0) {
          this.tryLoadSavedLineItemsByShipmentId(this.shipmentId);
        }
      },
      error: (err: any) => {
        console.error('Error loading shipment by id', err);
        this.snackBar.open('Unable to load shipment details', 'Close', { duration: 3000 });
      }
    });
  }

  private patchShipmentHeader(header: any): void {
    const poNumberValue = header?.poNumber || header?.PONumber || '';
    const poId = Number(header?.poId ?? header?.POId ?? this.getPoIdFromNumber(poNumberValue)) || 0;
    if (!poId && poNumberValue) {
      this.pendingPoNumberToPatch = poNumberValue;
    }

    this.shipmentForm.patchValue({
      invoiceNum: header?.invoiceNumber || header?.InvoiceNumber || '',
      poNumber: poId || '',
      vendor: Number(header?.vendorId) || '',
      carrierName: header?.carrierName || header?.CarrierName || '',
      vehicleNum: header?.vehicleNumber || header?.vehicleNum || '',
      driverName: header?.driverName || header?.DriverName || '',
      mobile: header?.mobile || header?.Mobile || '',
      recivedDate: (header?.receivedDate || header?.recivedDate)
        ? new Date(header.receivedDate || header.recivedDate)
        : '',
      status: Number(header?.statusId) || '',
      locationId: header?.locationId ? header.locationId.toString() : ''
    }, { emitEvent: false });

    this.header = {
      invoiceNumber: header?.invoiceNumber || header?.InvoiceNumber || '',
      poNumber: header?.poNumber || header?.PONumber || '',
      vendor: header?.vendorName || header?.VendorName || ''
    };

    this.isShipmentSaved = true;
    this.shipmentForm.get('poNumber')?.disable();
    this.tryAutoLoadLineItemsForEdit();
  }

  private extractSavedShipmentLineItems(data: any): any[] {
    const sources = [
      data?.lineItems,
      data?.LineItems,
      data?.lineitems,
      data?.shipmentLineItems,
      data?.ShipmentLineItems,
      data?.shipmentDetails,
      data?.ShipmentDetails,
      data?.details,
      data?.Details
    ];

    const matched = sources.find(x => Array.isArray(x));
    return Array.isArray(matched) ? matched : [];
  }

  private normalizeShipmentResponse(res: any): { data: any; header: any; lineItems: any[] } {
    const parsed = typeof res === 'string' ? JSON.parse(res) : res;
    const data = parsed?.header
      ? parsed
      : (parsed?.response?.header
        ? parsed.response
        : (parsed?.data?.header ? parsed.data : parsed));
    const header = data?.header || data?.Header || {};
    const lineItems = this.extractSavedShipmentLineItems(data);
    return { data, header, lineItems };
  }

  private getShipmentIdFromSaveResponse(res: any): number {
    const parsed = typeof res === 'string' ? JSON.parse(res) : res;

    const candidates = [
      parsed?.shipmentId,
      parsed?.ShipmentId,
      parsed?.s_id,
      parsed?.SId,
      parsed?.id,
      parsed?.Id,
      parsed?.data?.shipmentId,
      parsed?.data?.ShipmentId,
      parsed?.data?.s_id,
      parsed?.data?.id,
      parsed?.model?.shipmentId,
      parsed?.model?.ShipmentId,
      parsed?.model?.s_id,
      parsed?.model?.id,
      parsed?.response?.shipmentId,
      parsed?.response?.ShipmentId,
      parsed?.response?.s_id,
      parsed?.response?.id,
      parsed?.header?.id,
      parsed?.header?.shipmentId
    ];

    const matched = candidates.find(value => Number(value) > 0);
    return Number(matched) || 0;
  }

  private getCurrentShipmentId(): number {
    return Number(this.shipmentId) || Number(this.editShipmentIdFromRoute) || 0;
  }

  private resolveShipmentIdFromSearch(modelPayload: any): void {
    const request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
      { key: 'ShipmentNumber', value: '' },
      { key: 'InvoiceNumber', value: String(modelPayload?.invoiceNum || '').trim() },
      { key: 'CarrierName', value: String(modelPayload?.carrierName || '').trim() },
      { key: 'Vendor', value: String(modelPayload?.vendor_id || '') },
      { key: 'ReceivedDateFrom', value: '' },
      { key: 'ReceivedDateTo', value: '' },
      { key: 'PageNo', value: '1' },
      { key: 'PageSize', value: '10' },
      { key: 'Pagenation', value: '1' }
    ];

    request.Params = reqdata;

    this.shipmentService.getShipmentSearchList(request).subscribe({
      next: (res: any) => {
        const results = typeof res?.results === 'string'
          ? JSON.parse(res.results)
          : (Array.isArray(res?.results) ? res.results : []);

        const matchedShipment = results.find((x: any) => {
          const invoiceMatch = String(x?.invoiceNumber ?? x?.invoiceNum ?? '').trim() === String(modelPayload?.invoiceNum || '').trim();
          const carrierMatch = String(x?.carrierName ?? '').trim() === String(modelPayload?.carrierName || '').trim();
          return invoiceMatch && carrierMatch;
        }) || results[0];

        const resolvedId = Number(
          matchedShipment?.shipmentId ??
          matchedShipment?.ShipmentId ??
          matchedShipment?.id ??
          matchedShipment?.Id
        ) || 0;

        if (resolvedId > 0) {
          this.shipmentId = resolvedId;
        }
      },
      error: (err: any) => {
        console.error('Unable to resolve shipment id after save', err);
      }
    });
  }

  private tryLoadSavedLineItemsByShipmentId(shipmentId: number): void {
    if (!shipmentId || !this.isEditMode || this.savedShipmentLineItems.length > 0) {
      return;
    }

    const requestBodies = [
      { Params: [{ Key: 'SId', Value: shipmentId.toString() }] },
      { params: [{ key: 'SId', value: shipmentId.toString() }] },
      { params: [{ key: 'sId', value: shipmentId.toString() }] },
      { shipmentId },
      { id: shipmentId }
    ];

    this.tryLoadSavedLineItemsByShipmentIdRequest(requestBodies, 0);
  }

  private tryLoadSavedLineItemsByShipmentIdRequest(requestBodies: any[], index: number): void {
    if (index >= requestBodies.length || this.savedShipmentLineItems.length > 0) {
      return;
    }

    this.shipmentService.getShipmentById(requestBodies[index]).subscribe({
      next: (res: any) => {
        const { lineItems } = this.normalizeShipmentResponse(res);
        if (Array.isArray(lineItems) && lineItems.length > 0) {
          this.savedShipmentLineItems = lineItems;
          this.autoLoadEditLineItemsPending = true;
          this.tryAutoLoadLineItemsForEdit();
          return;
        }

        this.tryLoadSavedLineItemsByShipmentIdRequest(requestBodies, index + 1);
      },
      error: () => {
        this.tryLoadSavedLineItemsByShipmentIdRequest(requestBodies, index + 1);
      }
    });
  }

  private getPoIdFromNumber(poNumber: string): any {
    if (!poNumber) {
      return 0;
    }

    const numericPo = Number(poNumber);
    if (!isNaN(numericPo) && numericPo > 0) {
      return numericPo;
    }

    const normalizedPoNumber = String(poNumber).trim().toLowerCase();
    const matchedPo = this.PoData.find(
      x => {
        const nameVal = String((x as any).name ?? '').trim().toLowerCase();
        const poNumVal = String((x as any).poNumber ?? (x as any).poNum ?? '').trim().toLowerCase();
        const valueVal = String((x as any).value ?? '').trim().toLowerCase();
        return nameVal === normalizedPoNumber ||
               poNumVal === normalizedPoNumber ||
               valueVal === normalizedPoNumber;
      }
    );

    return (matchedPo as any)?.id ?? 0;
  }

  private getPoDisplayNumber(poValue: any): string {
    if (poValue === null || poValue === undefined || poValue === '') {
      return '';
    }

    const matchedPo = this.PoData.find(
      x => Number((x as any)?.id) === Number(poValue)
    );

    if (!matchedPo) {
      return String(poValue);
    }

    return String((matchedPo as any).name ?? matchedPo.poNumber ?? poValue).trim();
  }

  private tryAutoLoadLineItemsForEdit(): void {
    if (!this.isEditMode || !this.autoLoadEditLineItemsPending) {
      return;
    }

    const poId = this.shipmentForm.get('poNumber')?.value;
    if (!poId) {
      return;
    }

    this.loadShipmentLineItems();
  }

  private patchSavedLineItemsForEdit(): void {
    if (!this.isEditMode || !Array.isArray(this.savedShipmentLineItems) || this.savedShipmentLineItems.length === 0) {
      return;
    }

    const mappedLineItems = this.savedShipmentLineItems.map((saved: any) => {
      const poLineId = Number(
        saved?.poLineId ??
        saved?.poLineItemId ??
        saved?.poliId ??
        saved?.poLineID ??
        saved?.POLineId ??
        0
      );

      const poLine = this.poLineItems.find(
        p => Number(p.poLineItemId ?? p.poliId) === poLineId
      );

      const itemSerials = Array.isArray(saved?.itemSerials)
        ? saved.itemSerials
        : (Array.isArray(saved?.serialized) ? saved.serialized : []);
      const receivedQty = Number(saved?.receivedQty ?? saved?.recivedQty ?? 0);
      const isSerialized = typeof saved?.isSerialized === 'string'
        ? saved.isSerialized.toLowerCase() === 'serialized' || saved.isSerialized.toLowerCase() === 'true'
        : !!saved?.isSerialized;
      const sendToTestLab = typeof saved?.sendToTestLab === 'string'
        ? saved.sendToTestLab.toLowerCase() === 'yes' || saved.sendToTestLab.toLowerCase() === 'true'
        : !!saved?.sendToTestLab;
      const serialCount = itemSerials.length;

      return {
        ...(poLine || {}),
        rowUid: this.getNextRowUid(),
        poId: Number(poLine?.poId) || Number(this.shipmentForm.get('poNumber')?.value) || 0,
        poLineItemId: poLineId || Number(poLine?.poLineItemId ?? poLine?.poliId) || 0,
        itemTypeId: Number(saved?.itemTypeId ?? saved?.itemtypeId) || Number(poLine?.itemTypeId) || 0,
        categoryId: Number(saved?.categoryId ?? saved?.itemCategoryId) || Number(poLine?.categoryId) || 0,
        itemId: Number(saved?.itemId ?? saved?.itemMasterId) || Number(poLine?.itemId) || 0,
        uomId: Number(poLine?.uomId) || 0,
        itemType: saved?.itemTypeName || saved?.itemType || poLine?.itemType || poLine?.itemTypeName || '',
        itemCategory: saved?.categoryName || saved?.itemCategory || poLine?.itemCategory || poLine?.categoryName || '',
        itemNum: saved?.itemName || saved?.itemNum || poLine?.itemNum || '',
        itemDesc: saved?.itemDesc || saved?.itemName || poLine?.itemDesc || poLine?.itemNum || '',
        uom: poLine?.uom || poLine?.uomName || '',
        testRequired: sendToTestLab ? 'Yes' : 'No',
        batchNo: saved?.batchNo || saved?.batchNumber || '',
        receivedQty: receivedQty || null,
        isSerialized: isSerialized ? 'Serialized' : 'NonSerialized',
        sendToTestLab,
        serialized: itemSerials,
        serialCount,
        isSerialCompleted: isSerialized ? receivedQty === serialCount : true,
        isBatchDuplicate: false
      };
    });

    this.lineItems = mappedLineItems;
    this.showShipmentTable = true;
    this.autoLoadEditLineItemsPending = false;
  }

  addItem(item: any) {
    if (!item) {
      this.snackBar.open('Line item data not found', 'Close', { duration: 3000 });
      return;
    }

    const currentShipmentId = this.getCurrentShipmentId();
    if (!currentShipmentId) {
      if (this.isShipmentSaved) {
        const formValue = this.shipmentForm.getRawValue();
        const vendorValue = Array.isArray(formValue.vendor) ? formValue.vendor[0] : formValue.vendor;
        this.resolveShipmentIdFromSearch({
          invoiceNum: formValue.invoiceNum,
          carrierName: formValue.carrierName,
          vendor_id: Number(vendorValue) || 0
        });
        this.snackBar.open('Shipment saved. Resolving shipment id, please try again.', 'Close', { duration: 3000 });
        return;
      }

      this.snackBar.open('Please save shipment header first', 'Close', { duration: 3000 });
      return;
    }

    const serialized = Array.isArray(item.serialized) ? item.serialized : [];
    const itemSerials = serialized.map((serial: any) => ({
      SerialNo: String(serial?.serialNo || '').trim(),
      Make: String(serial?.make || '').trim(),
      Model: String(serial?.model || '').trim(),
      WarrentyDate: serial?.warrentyDate || ''
    }));

    const payload = {
      ShipmentId: currentShipmentId,
      BatchNo: (item.batchNo || '').trim(),
      CategoryId: Number(item.categoryId) || 0,
      IsSerialized: item.isSerialized === 'Serialized',
      ItemId: Number(item.itemId) || 0,
      ItemTypeId: Number(item.itemTypeId) || 0,
      POLineId: Number(item.poLineItemId ?? item.poliId) || 0,
      ReceivedQty: Number(item.receivedQty) || 0,
      SendToTestLab: !!item.sendToTestLab,
      UomId: Number(item.uomId) || 0,
      ItemSerials: itemSerials
    };

    this.shipmentService.saveShipmentLineItems(payload).subscribe({
      next: (res: any) => {
        if (res?.status > 0) {
          this.recivedShipmentDetails.push(payload);
          this.snackBar.open('Shipment line item saved successfully', 'close', {
            duration: 3000,
            panelClass: 'success'
          });
        } else {
          this.snackBar.open('Error while saving shipment line item', 'close', {
            duration: 4000,
            panelClass: 'error'
          });
        }
        console.log('Add clicked payload:', payload, 'API response:', res);
      },
      error: (err: any) => {
        console.error('API ERROR:', err);
        this.snackBar.open('Error while saving shipment line item', 'close', {
          duration: 4000,
          panelClass: 'error'
        });
      }
    });
  }

 /* save() {

  if (this.shipmentForm.invalid) {
    this.shipmentForm.markAllAsTouched();
    return;
  }

  const formValue = this.shipmentForm.value;

const payload = {
  ...formValue,
  s_id: this.shipmentId ?? 0,

  // Convert to numbers
  vendor_id: Number(formValue.vendor),
  status_id: Number(formValue.status),
  location_id: formValue.locationId
    ? Number(formValue.locationId)
    : 0,

  // Convert Moment to ISO string
  recivedDate: formValue.recivedDate
    ? formValue.recivedDate.format('YYYY-MM-DD')
    : null
};

this.addEditShipmentRequest.shipment = payload;

console.log("FINAL CLEAN PAYLOAD:", payload);

  this.shipmentService.addEditShipment(this.addEditShipmentRequest)
    .subscribe({
      next: (res: any) => {
        console.log("SUCCESS:", res);

        if (res.status > 0) {
          this.snackBar.open(
            this.shipmentId === 0
              ? 'Shipment Added Successfully'
              : 'Shipment Updated Successfully',
            'close',
            { duration: 2000, panelClass: 'success' }
          );
        } else {
          this.snackBar.open('Error while saving shipment', 'close', {
            duration: 4000, panelClass: 'error'
          });
        }
      },
      error: (err) => {
        console.error("API ERROR:", err);
        this.snackBar.open('Error while saving shipment', 'close', {
          duration: 4000, panelClass: 'error'
        });
      }
    });
} */


  save() {
    if (this.isSaving) {
      return;
    }

    if (this.shipmentForm.invalid) {
      this.shipmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.shipmentForm.getRawValue();
    const vendorValue = Array.isArray(formValue.vendor) ? formValue.vendor[0] : formValue.vendor;
    const poValue = Array.isArray(formValue.poNumber) ? formValue.poNumber[0] : formValue.poNumber;
    const locationValue = Array.isArray(formValue.locationId) ? formValue.locationId[0] : formValue.locationId;
    const selectedPoNumber = this.getPoDisplayNumber(poValue);

    let receivedDate = '';
    if (formValue.recivedDate?.format) {
      receivedDate = formValue.recivedDate.format('YYYY-MM-DDTHH:mm:ss');
    } else if (formValue.recivedDate) {
      const dt = new Date(formValue.recivedDate);
      if (!isNaN(dt.getTime())) {
        receivedDate = dt.toISOString().slice(0, 19);
      }
    }

    const modelPayload = {
      ...formValue,
      s_id: Number(this.shipmentId) || 0,
      invoiceNum: (formValue.invoiceNum || '').trim(),
      poNumber: selectedPoNumber,
      po_id: Number(poValue) || 0,
      vendor_id: Number(vendorValue) || 0,
      carrierName: (formValue.carrierName || '').trim(),
      vehicleNum: (formValue.vehicleNum || '').trim(),
      driverName: (formValue.driverName || '').trim(),
      mobile: (formValue.mobile || '').trim(),
      recivedDate: receivedDate,
      status_id: Number(formValue.status) || 0,
      location_id: Number(locationValue) || 0,
      remarks: (formValue.remarks || '').trim()
    };

    const requestPayload = {
      model: modelPayload,
      ...modelPayload
    };

    console.log('FINAL SCREEN PAYLOAD:', requestPayload);
    this.isSaving = true;

    this.shipmentService.addEditShipment(requestPayload).subscribe({
      next: (res: any) => {
        console.log('SUCCESS:', res);

        if (res.status > 0) {
          const savedShipmentId = this.getShipmentIdFromSaveResponse(res);
          this.shipmentId = savedShipmentId || this.getCurrentShipmentId();
          if (!this.shipmentId && modelPayload.s_id === 0) {
            this.resolveShipmentIdFromSearch(modelPayload);
          }
          this.isShipmentSaved = true;
          this.shipmentForm.get('poNumber')?.disable();
          this.snackBar.open(
            modelPayload.s_id === 0 ? 'Shipment Added Successfully' : 'Shipment Updated Successfully',
            'close',
            { duration: 4000, panelClass: 'success' }
          );
        } else {
          this.snackBar.open('Error while saving shipment', 'close', {
            duration: 4000, panelClass: 'error'
          });
        }
      },
      error: (err: any) => {
        console.error('API ERROR:', err);
        this.snackBar.open('Error while saving shipment', 'close', {
          duration: 4000, panelClass: 'error'
        });
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  loadShipmentLineItems() {
  if (!this.isShipmentSaved) {
    this.snackBar.open('Please save shipment first', 'Close', { duration: 3000 });
    return;
  }

  const poId = this.shipmentForm.get('poNumber')?.value;

  if (!poId) {
    this.snackBar.open('Please select PO Number first', 'Close', { duration: 3000 });
    return;
  }

  const requestBody = { params: [{ key: "POId", value: poId.toString() }] };

  this.shipmentService.getPoLineItemsByPOID(requestBody).subscribe({
    next: (res: any[]) => {
      if (!res || res.length === 0) {
        this.poLineItems = [];
        this.lineItems = [];
        this.isNotFound = true;
        this.showShipmentTable = false;
        return;
      }

      this.isNotFound = false;
      this.poLineItems = res.map(x => ({
        rowUid: this.getNextRowUid(),
        poId: x.poId,
        poLineItemId: x.poLineItemId ?? x.poliId,
        itemTypeId: x.itemTypeId,
        categoryId: x.categoryId,
        itemId: x.itemId,
        uomId: x.uomId,
        itemTypeName: x.itemTypeName,
        categoryName: x.categoryName ?? x.itemCategoryName,
        itemNum: x.itemName ?? x.itemNum,
        uomName: x.uomName,
        orderQty: x.orderedQty ?? x.orderQty,
        alreadyDoneQty: x.alreadyDoneQty,
        sendToTestLab: x.sendToTestLab,
        itemType: x.itemTypeName,
        itemCategory: x.categoryName ?? x.itemCategoryName,
        itemDesc: x.itemDesc ?? x.itemName ?? x.itemNum,
        uom: x.uomName,
        testRequired: x.sendToTestLab ? 'Yes' : 'No',
        batchNo: '',
        receivedQty: null,
        isSerialized: x.isSerialized ? 'Serialized' : 'NonSerialized',
        isSerialCompleted: false
      }));
      this.lineItems = [];
      this.patchSavedLineItemsForEdit();
      this.showShipmentTable = true;
    },
    error: (err: any) => {
      console.error("Error loading PO items", err);
      this.poLineItems = [];
      this.lineItems = [];
      this.showShipmentTable = false;
    }
  });
  }
  
  pageChanged(obj: any) {
    this.objSearch.PageSize =  obj.pageSize;
    this.objSearch.PageNo = obj.pageIndex;
      // this.getAssetRegistryList();
  }

  addSerialNo(item: any) {
  if (item.isSerialized !== 'Serialized') return;

  const dialogRef = this.dialog.open(ShipmentSerialNoComponent, {
    width: '1200px',
    maxHeight: '80vh',
    data: {
      receivedQty: item.receivedQty,
      itemNum: item.itemNum
    }
  });

  dialogRef.afterClosed().subscribe((result: { serialCount: undefined; serialized: any; }) => {
    if (result && result.serialCount !== undefined) {

      item.serialCount = result.serialCount;
      item.serialized = Array.isArray(result.serialized) ? result.serialized : [];

      item.isSerialCompleted =
        Number(result.serialCount) === Number(item.receivedQty);
    }
  });
  }

  deleteItem(index: number) {
    this.lineItems.splice(index, 1);
  }

  onQtyChange(item: any, index: number) {

    const allowedQty =
      Number(item.orderQty || 0) - Number(item.alreadyDoneQty || 0);

    // Sum qty of SAME ITEM except current row
    const existingQty = this.lineItems
      .filter((x, i) => x.itemNum === item.itemNum && i !== index)
      .reduce((sum, x) => sum + Number(x.receivedQty || 0), 0);

    const totalQty = existingQty + Number(item.receivedQty || 0);

    if (totalQty > allowedQty) {

      alert(
        `Total received qty cannot exceed ${allowedQty}.
  Remaining allowed qty is ${allowedQty - existingQty}`
      );

      item.receivedQty = null;
    }
  }

  onBatchChange(item: any, index: number) {

  if (!item.batchNo) {
    item.isBatchDuplicate = false;
    return;
  }

  const currentBatch = item.batchNo.trim().toLowerCase();

  const duplicate = this.lineItems.some((x, i) =>
    i !== index &&
    x.itemNum === item.itemNum &&
    x.batchNo &&
    x.batchNo.trim().toLowerCase() === currentBatch
  );

  item.isBatchDuplicate = duplicate;  // 👈 store validation state

  if (duplicate) {
    this.snackBar.open(
      `Batch Number must be unique for Item ${item.itemNum}`,
      'Close',
      { duration: 3000 }
    );
  }
  }

  getPoListByShipmentApprovedOrNotComplete() {
      this.shipmentService.getPoListByShipmentApprovedOrNotComplete().subscribe((res: any) => {
        this.PoData = res;
        console.log("PO Data for dropdown:", this.PoData);
        if (this.pendingPoNumberToPatch) {
          const poId = this.getPoIdFromNumber(this.pendingPoNumberToPatch);
          if (poId) {
            this.shipmentForm.get('poNumber')?.setValue(poId, { emitEvent: false });
            this.pendingPoNumberToPatch = '';
            this.tryAutoLoadLineItemsForEdit();
          }
        }
      });
  }

 onPoChange(selectedPo: any) {
  console.log("Selected PO:", selectedPo);

  const poId = typeof selectedPo === 'object' ? selectedPo?.id : selectedPo;
  if (!poId) {
    this.poLineItems = [];
    this.lineItems = [];
    return;
  }

  const requestBody = {
    params: [
      {
        key: "POId",
        value: poId.toString()
      }
    ]
  };

  this.shipmentService.getPoLineItemsByPOID(requestBody)
    .subscribe({
      next: (res: any[]) => {

        if (!res || res.length === 0) {
          this.poLineItems = [];
          this.lineItems = [];
          this.isNotFound = true;
          return;
        }

        this.isNotFound = false;

        this.poLineItems = res.map(x => ({
          rowUid: this.getNextRowUid(),
          poId: x.poId,
          poLineItemId: x.poLineItemId ?? x.poliId,
          itemTypeId: x.itemTypeId,
          categoryId: x.categoryId,
          itemId: x.itemId,
          uomId: x.uomId,
          itemTypeName: x.itemTypeName,
          categoryName: x.categoryName ?? x.itemCategoryName,
          itemNum: x.itemName ?? x.itemNum,
          uomName: x.uomName,
          orderQty: x.orderedQty ?? x.orderQty,
          alreadyDoneQty: x.alreadyDoneQty,
          sendToTestLab: x.sendToTestLab,
          itemType: x.itemTypeName,
          itemCategory: x.categoryName ?? x.itemCategoryName,
          itemDesc: x.itemDesc ?? x.itemName ?? x.itemNum,
          uom: x.uomName,
          testRequired: x.sendToTestLab ? 'Yes' : 'No',
          batchNo: '',
          receivedQty: null,
          isSerialized: x.isSerialized ? 'Serialized' : 'NonSerialized',
          isSerialCompleted: false
        }));
        this.lineItems = [];
        this.patchSavedLineItemsForEdit();

      },
      error: (err: any) => {
        console.error("Error loading PO items", err);
        this.poLineItems = [];
        this.lineItems = [];
      }
    });
 }

  getVendors(): void {
    this.shipmentService.getVendors().subscribe({
      next: (res: any[]) => {
        this.vendorNames = res.map(x => ({
          vendorId: x.id,
          vendorName: x.name
        }));
        console.log(this.vendorNames);
      },
      error: (err: any) => {
        console.error('Error loading vendors', err);
      }
    });
  }

  getLocations(){
      this.shipmentService.getLocations().subscribe({
        next: (res: any[]) => {
          this.locations = res;
          this.locations = res.map(x => ({ code: x.id.toString(), value: x.name }));
        },
      });
    }

  getStatusTypes(): void {
      this.shipmentService.getPoStatus().subscribe({
        next: (res: any[]) => {
          this.statuses = res;
          this.status = res.map(x => ({ code: x.id.toString(), value: x.name }));
        },
      });
    } 

}
