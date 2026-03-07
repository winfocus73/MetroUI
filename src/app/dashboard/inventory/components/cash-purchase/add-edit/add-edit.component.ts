import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { ILoginData } from '@auth/models/login.response';
import { IAssetRegAddEdit, IAssetEditTreeResponse } from '@dashboard/asset-registry/models/asset-add-edit';
import { IOEM } from '@dashboard/asset-registry/models/oem';
import { IAssetCategories } from '@dashboard/config-assets/models/asset-categories';
import { IAssetType } from '@dashboard/config-assets/models/asset-types/asset-type';
import { IAssetLocation } from '@dashboard/config-assets/models/locations/location';
import { AssetService } from '@dashboard/config-assets/services/asset.service';
import { ILocationSearchList } from '@dashboard/configuration-setup/models/location/location';
import { LocationService } from '@dashboard/configuration-setup/services/location.service';
import { IUnit } from '@dashboard/configuration/models/units/unit';
import { UnitService } from '@dashboard/configuration/services/unit.service';
import {ILocation, IItemType, ICategory, IItemTypeData, ICPList } from '@dashboard/inventory/models/cashpurchase';
import { InventoryService } from '@dashboard/inventory/services/inventory.service';
import { PermittoWorkService } from '@dashboard/planning-scheduling/permit-to-work/services/permit-to-work.service';
import { LocationsDialogComponent } from '@shared/components/location-dialog/location-dialog.component';
import { IGetSearchRequest, IGetAddEditResponse, IDropdown, ITreeResponse, ExampleFlatNode, ICommonRequest, IRequest } from '@shared/models';
import { IAttachement } from '@shared/models/attachment';
import { IFormCheck } from '@shared/models/role-check';
import { CommonService } from '@shared/services/common.service';
import { LoadingService } from '@shared/services/spinner.service';
import * as moment from 'moment';
import { Observable, startWith, map } from 'rxjs';
import { Constants } from 'src/app/core/http/constant';
import { CashPurchaseDialogComponent } from '../cash-purchase-dialog/cash-purchase-dialog.component';
import { IVendor } from '@dashboard/planning-scheduling/permit-to-work/models/vendor';

@Component({
  selector: 'nxasm-cp-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class AddEditCashPurchaseComponent implements OnInit, OnChanges {
  @Input() rec_id!: number;
  @Input() objForm: IFormCheck = {} as IFormCheck;
  @Input() oems: IOEM[] = [];
  @Output() message = new EventEmitter();
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  today = new Date();
  cashPurchaseForm!: UntypedFormGroup;
  public files: any[] = [];
  assetTypes: IAssetType[] = [];
  assetLocations: IAssetLocation[] = [];
  assetCategories: IAssetCategories[] = [];
  agencyNames: IVendor[] = [];
  unitsrequest!: IGetSearchRequest;
  units: IUnit[] = [];
  serialList: any[] = [];
  LoginUserInfo: ILoginData = {} as ILoginData;
  addEditRequest: IAssetRegAddEdit = {} as IAssetRegAddEdit;
  addEditResponse: IGetAddEditResponse = {} as IGetAddEditResponse;
  locationRequest!: IGetSearchRequest;
  locations: ILocation[] = [];
  itemTypes: IItemType[] = [];
  categories: ICategory[] = [];
  locationItems: IDropdown[] = [];
  itemTypeItems: IDropdown[] = [];
  categoryItems: IDropdown[] = [];
  filteredItems: IDropdown[] = [];
  currentItemTypeData: IItemTypeData[] = [];
  locationSearch: ILocationSearchList = {} as ILocationSearchList;
  name!: string;
  pageNo = 1;
  pageSize = 10;
  isNotFound = false;
  totalRecords!: number;
  selecetedLocations: ILocation[] = [];
  dialogRef!: MatDialogRef<CashPurchaseDialogComponent>;
  lookDialogRef!: MatDialogRef<LocationsDialogComponent>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  oemsTplRef!: MatDialogRef<any>;
  filteredOptions: Observable<ILocation[]> = new Observable<ILocation[]>();
  myControl = new UntypedFormControl();
  isLoading = false;
  typeaheadLoading!: boolean;
  typeaheadNoResults!: boolean;
  subAssetsTree: ITreeResponse[] = [];
  mapSubAssetsTree: ITreeResponse[] = [];
  subAssetsTreeArray: ITreeResponse[] = [];
  attachments: IAttachement[] = [];
  displayedColumns: string[] = [
    'name',
    'position',
    'code',
    'assetNo',
    'oemSerialNo',
    'make',
    'integrationAssetId',
  ];
  displayedColumnsLocation: string[] = [
    'select',
    'locationName',
    'locationCode',
    'locationKind',
    'parentLocationName',
  ];
  displayedColumnsAssets: string[] = [
    'select',
    'assetName',
    'locationCode',
    'locationKind',
    'parentLocationName',
  ];
  @ViewChild('locationdialogRef') locationDialogRef!: TemplateRef<any>;
  dateFormat = 'YYYY-MM-DDTHH:mm:ss';
  loginData: ILoginData = {} as ILoginData;
  aseetNo!: string;
  private transformer = (node: ITreeResponse, level: number) => {
    return {
      expandable: !!node.Children && node.Children.length > 0,
      name: node.name,
      code: node.code,
      position: node.position,
      assetNo: node.assetNo,
      oemSerialNo: node.oemSerialNo,
      assetTreeId: node.assetTreeId,
      integrationAssetId: node.integrationAssetId,
      make: node.make,
      id: node.id,
      level: level,
    };
  };
  private Edittransformer = (node: IAssetEditTreeResponse, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      code: node.code,
      position: node.position,
      assetNo: node.assetNo,
      oemSerialNo: node.oemSerialNo,
      assetTreeId: node.assetTreeId,
      integrationAssetId: node.integrationAssetId,
      make: node.make,
      id: node.id,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  treeFlattener: any = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.Children,
  );
  EdittreeFlattener: any = new MatTreeFlattener(
    this.Edittransformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );
  dataSource: any;
  locationDataSource: MatTableDataSource<ILocation> = new MatTableDataSource();
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  status: string = '';
  objSearch = {
    CategoryId: '',
    AssetName: '',
    AssetNo: '',
    Status: '',
    Linear: '',
    PageNo: 1,
    PageSize: 10,
    TotalRecords: 0,
    Station: '',
    Participation: '',
    Corridor: '',
    Stage: '',
    Location: '',
    TopAssetNo: '',
    Description: '',
    IntegrationAssetNo: '',
    Make: '',
  };
  tableColumns: any;
  items: any;
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private locationService: LocationService,
    private assetService: AssetService,
    private permitService: PermittoWorkService,
    private unitService: UnitService,
    private commonService: CommonService,
    private inventoryService: InventoryService,
    private _loading: LoadingService,
  ) {}

  ngOnInit() {
    // const loginStorage: any = this.commonService.loginStorageData;
    //  const userName = loginStorage?.loginData?.userName || '';
    //  this.cashPurchaseForm.get('userName')?.setValue(userName);
    console.log('ngOnInit rec_id =>', this.rec_id);
    this.validatAssetRegSave();
    this.calculateTotal();
    this.loadAllDropdownData();
    this.getFormPriviliges();
    this.getVendorsList();
    // this.getLocationsData();
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.rec_id === 0 || this.rec_id === undefined
        ? this.treeFlattener
        : this.EdittreeFlattener,
    );
    this.getassetLocationsData();

    if (this.rec_id && this.rec_id > 0) {
      this.getCashPurchaseById();
    }
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => <ILocation[]>this._filter(value)),
    );
    this.loginData = this.commonService.loginStorageData;
    this.LoginUserInfo = this.commonService.loginStorageData;

    //this.assetRegForm.controls['unitId'].setValue(this.loginData.loginData.unitId.toString());
    // this.cashPurchaseForm.controls['categoryId'].setValue(this.loginData.loginData.assetCategoryId > 0 ? this.loginData.loginData.assetCategoryId.toString() : '');
    if (this.loginData?.loginData?.assetCategoryId > 0) {
      this.cashPurchaseForm.patchValue({
        categoryId: this.loginData.loginData.assetCategoryId.toString(),
      });
    }
  }
  calculateTotal() {
    this.cashPurchaseForm.get('quantity')?.valueChanges.subscribe(() => {
      this.updateTotal();
    });
    this.cashPurchaseForm.get('unitCost')?.valueChanges.subscribe(() => {
      this.updateTotal();
    });
  }
  updateTotal() {
    const qty = this.cashPurchaseForm.get('quantity')?.value || 0;
    const cost = this.cashPurchaseForm.get('unitCost')?.value || 0;
    const total = qty * cost;
    this.cashPurchaseForm
      .get('totalAmount')
      ?.setValue(total, { emitEvent: false });
  }

  private _filter(value: string): ILocation[] {
    const filterValue = value.toLowerCase();

    return this.locations.filter((option) =>
      option.locationName.toLowerCase().includes(filterValue),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rec_id']) {
      console.log('rec_id changed =>', changes['rec_id'].currentValue);
    }

    if (changes['rec_id']?.currentValue > 0) {
      this.rec_id = changes['rec_id'].currentValue;
      this.getCashPurchaseById();
    }
  }

 validatAssetRegSave() {
  this.cashPurchaseForm = this.fb.group({
    sourceType: [''],
    sourceNum: new FormControl({ value: '', disabled: true }),
    transType: [''],
    CPDate: [null, Validators.required],

    rec_invoicenum: ['', [Validators.pattern('^[a-zA-Z0-9_-]*$')]],
    vendorId: [null, Validators.required],

    itemTypeId: [null, Validators.required],
    categoryId: [null, Validators.required],
    itemName: [null, Validators.required],

    description: new FormControl({ value: '', disabled: true }),

    quantity: [0, [Validators.required, Validators.min(1)]],

    uom: new FormControl({ value: '', disabled: true }), //  Display only
    uomId: [null],                                       //  Actual ID

    unitCost: [0, [Validators.required, Validators.min(1)]],
    totalAmount: new FormControl({ value: '', disabled: true }),

    batchNo: ['', [Validators.pattern('^[a-zA-Z0-9_-]*$')]],
    mfgDate: [''],
    inventoryType: [''],
    locationId: [null, Validators.required],
    remarks: [''],
   // serialNo: new FormControl('', Validators.required),
  });
}

  onFileChange(pFileList: File[]) {
    this.files = Object.keys(pFileList).map((key) => pFileList[key as any]);
    this.snackBar.open('Successfully upload!', 'Close', {
      duration: 2000,
    });
  }

  get isEditMode(): boolean {
    return this.rec_id > 0;
  }

  getassetLocationsData() {
    let assetRequestLoc: ICommonRequest = {} as ICommonRequest;
    this.assetLocations = [];
    const reqdata: IRequest[] = [
      {
        key: 'name',
        value: '',
      },
      {
        key: 'id',
        value: '',
      },
    ];
    assetRequestLoc.Params = reqdata;
    this.assetService.getAssetLocations(assetRequestLoc).subscribe((res) => {
      this.assetLocations = res;
      console.log('location data====>' + JSON.stringify(this.assetLocations));
    });
  }

  save() {
    if (this.cashPurchaseForm.invalid) {
      this.snackMsg('Please fill all required fields', 'error');
      return;
    }
    const formValue = this.cashPurchaseForm.getRawValue();

    if (
      formValue.inventoryType === 'Serialized' &&
      this.serialList.length === 0
    ) {
      this.snackMsg('Please add serial numbers', 'error');
      return;
    }
    const request = {
      rec_id: this.rec_id ? Number(this.rec_id) : 0,
      rec_sourcetype: 'CP',
      rec_source_num: formValue.sourceNum || '',
      rec_transtype: 'IN',
      rec_trans_date: formValue.CPDate
        ? moment(formValue.CPDate).format('YYYY-MM-DDTHH:mm:ss')
        : null,

      rec_ref_id: 1, // if required

      rec_invoicenum: formValue.rec_invoicenum || '',
      rec_vendor_id: Number(formValue.vendorId),
      rec_item_type: Number(formValue.itemTypeId),
      rec_cat_id: Number(formValue.categoryId),
      rec_item_id: Number(formValue.itemName),
      rec_uom: Number(formValue.uomId),
      rec_batchno: formValue.batchNo || '',
      rec_qty: Number(formValue.quantity),
      rec_unitcost: Number(formValue.unitCost),
      rec_linecost: Number(formValue.totalAmount),
      rec_isserialized: formValue.inventoryType === 'Serialized',
      rec_serialno: null,

      rec_mfg_date: formValue.mfgDate
        ? moment(formValue.mfgDate).format('YYYY-MM-DDTHH:mm:ss')
        : null,

      rec_location_id: Number(formValue.locationId),
      rec_remarks: formValue.remarks || '',
      rec_created_user_id: Number(this.loginData?.loginData?.id),
      rec_create_datetime: new Date().toISOString(),

      // IMPORTANT
      serials: this.serialList,
    };

    console.log('FINAL FULL REQUEST =>', JSON.stringify(request));

    this.inventoryService.saveCashPurchase(request).subscribe({
      next: (res: any) => {
        this.snackMsg('Saved Successfully', 'success');
        this.clear();
        this.serialList = [];
      },
      error: () => {
        this.snackMsg('Error while saving', 'error');
      },
    });
  }

  update() {
    if (this.cashPurchaseForm.invalid) {
      this.snackMsg('Please fill all required fields', 'error');
      return;
    }

    const formValue = this.cashPurchaseForm.getRawValue();

    const request = {
      rec_id: Number(this.rec_id),

      rec_trans_date: formValue.CPDate
        ? moment(formValue.CPDate).format('YYYY-MM-DDTHH:mm:ss')
        : null,

      rec_invoicenum: formValue.rec_invoicenum || '',

      rec_modified_user_id: Number(this.loginData?.loginData?.id),
      rec_modified_datetime: new Date().toISOString(),
    };

    console.log('UPDATE REQUEST =>', request);

    this.inventoryService.updateCashPurchase(request).subscribe({
      next: () => {
        this.snackMsg('Updated Successfully', 'success');
        this.clear(); // reset form
        this.rec_id = 0; // switch to Save mode
      },
      error: () => {
        this.snackMsg('Error while updating', 'error');
      },
    });
  }

  clear() {
    this.cashPurchaseForm.reset();
    this.validatAssetRegSave();
  }
  displayFn(user: any) {
    if (user) {
      console.log(user);
    }
  }

  updateFormLocation(e: any, name: string, id: number) {
    this.cashPurchaseForm.controls['locationId'].setValue(id);
  }

  snackMsg(msg: string, type: string) {
    this.snackBar.open(msg, 'close', {
      duration: 2000,
      panelClass: type,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  pageLoad() {
    if (this.commonService.filterObjects[Constants.ASSETS_LIST_FILTER_OBJECT]) {
      this.objSearch =
        this.commonService.filterObjects[Constants.ASSETS_LIST_FILTER_OBJECT];
    }
    this.LoginUserInfo = this.commonService.loginStorageData;
    if (this.LoginUserInfo.loginData.assetCategoryId > 0) {
      this.objSearch.CategoryId =
        this.LoginUserInfo.loginData.assetCategoryId.toString();
    }
    this.getAssetCategories();
  }
  getFormPriviliges() {
    //this._loading._loading.next(true);
    this.commonService.getFormPriviliges.subscribe((x) => {
      this.objForm = x[0];
      if (this.objForm.list == 1) {
        this.pageLoad();
      }
      if (this.objForm.edit == 1) {
        this.tableColumns.filter(
          (x: { columnDef: string }) => x.columnDef == 'actions',
        )[0].isEditbtn = true;
      }
    });
  }
  getAssetCategories() {
    let request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
      {
        key: 'name',
        value: '',
      },
      {
        key: 'id',
        value: '',
      },
    ];
    request.Params = reqdata;
    this.assetService.getAssetCategories(request).subscribe((res) => {
      this.assetCategories = res;
      console.log('asset category list====>' + this.assetCategories);
      this.items = this.assetCategories.map((x) => ({
        code: x.assetCategoryId.toString(),
        value: x.assetCategoryCode,
      }));
    });
  }
  getItemTypes() {
    this.inventoryService.getItemTypes().subscribe({
      next: (res: IItemType[]) => {
        this.itemTypes = res;
        console.log('item type data' + this.itemTypes);
        this.itemTypeItems = res.map((x) => ({
          code: x.id.toString(),
          value: x.name,
        }));
      },
      error: (error) => console.error('Error loading item types:', error),
    });
  }
  getCategories() {
    this.inventoryService.getCategories().subscribe({
      next: (res: ICategory[]) => {
        this.categories = res;
        this.categoryItems = res.map((x) => ({
          code: x.id.toString(),
          value: x.name,
        }));
      },
    });
  }
  updateCategoriesByItemType() {
    this.categoryItems = this.categories.map((c) => ({
      code: c.id.toString(),
      value: c.name,
    }));
    this.cashPurchaseForm.patchValue({
      categoryId: '',
      itemName: '',
      description: '',
      uom: '',
      uomId: null,
    });
    this.filteredItems = [];
  }
  onCategoryChange() {
    const itemTypeId = this.cashPurchaseForm.get('itemTypeId')?.value;
    const categoryId = this.cashPurchaseForm.get('categoryId')?.value;
    this.cashPurchaseForm.patchValue({
      itemName: '',
      description: '',
      uom: '',
      uomId: null,
    });
    if (itemTypeId && categoryId) {
      this.loadItems();
    } else {
      this.filteredItems = [];
    }
  }
  loadItems() {
    const itemTypeId = this.cashPurchaseForm.get('itemTypeId')?.value;
    const categoryId = this.cashPurchaseForm.get('categoryId')?.value;

    if (itemTypeId && categoryId) {
      const request = {
        Params: [
          { key: 'ItemTypeId', value: itemTypeId },
          { key: 'CategoryId', value: categoryId },
        ],
      };
      this.inventoryService.getItemsByCategoryAndType(request).subscribe({
        next: (res: IItemTypeData[]) => {
          this.currentItemTypeData = res;
          console.log('this data for item name===>' + this.currentItemTypeData);
          this.filteredItems = res.map((item) => ({
            code: item.itemtype_id.toString(),
            value: item.itemtype_name,
          }));
        },
        error: (error) => console.error('Error loading items:', error),
      });
    }
  }
  //  onItemNameChange(){
  //   const selectedItemId = this.cashPurchaseForm.get('itemName')?.value;
  //   if (selectedItemId && this.currentItemTypeData) {
  //     const selected = this.currentItemTypeData.find(x => x.itemtype_id.toString() === selectedItemId);
  //     if (selected) {
  //       this.cashPurchaseForm.patchValue({
  //         description: selected.itemtype_desc || '',
  //         uom: selected.itemtype_uom || ''
  //       });
  //     }
  //   }
  //   console.log("data for uom id====>"+JSON.stringify(this.cashPurchaseForm));
  // }

  onItemNameChange() {
    const selectedItemId = this.cashPurchaseForm.get('itemName')?.value;

    if (!selectedItemId || !this.currentItemTypeData?.length) return;

    const selected = this.currentItemTypeData.find(
      (x) => x.itemtype_id.toString() === selectedItemId,
    );

    if (!selected) return;

    this.cashPurchaseForm.patchValue({
      description: selected.itemtype_desc || '',
      uom: selected.itemtype_uom, // Showing ID (3)
      uomId: selected.itemtype_uom_id, // Storing ID for save
    });

    console.log('After Selecting Item =>', this.cashPurchaseForm.getRawValue());
  }

  getVendorsList() {
    this.permitService.getVendorList().subscribe((res) => {
      this.agencyNames = res;
    });
  }
  getLocations() {
    this.inventoryService.getLocations().subscribe({
      next: (res: any[]) => {
        this.locations = res;
        this.locationItems = res.map((x) => ({
          code: x.id.toString(),
          value: x.name,
        }));
      },
    });
  }

  openCachPurchaseDialog() {
    const quantity = Number(this.cashPurchaseForm.get('quantity')?.value);
    const itemCode = this.cashPurchaseForm.get('itemName')?.value;

    // Find selected item from dropdown list
    const selectedItem = this.filteredItems.find((x) => x.code === itemCode);

    const itemName = selectedItem?.value; //Get item display name

    const dialogRef = this.dialog.open(CashPurchaseDialogComponent, {
      width: '70%',
      height: '60%',
      disableClose: true,
      data: {
        quantity: quantity,
        itemName: itemName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('MAIN RECEIVED =>', result);

      if (!result) return;

      this.serialList = [...result];

      console.log('SERIAL LIST STORED =>', this.serialList);

      //Automatically trigger main save
      this.save();
    });
  }
  loadAllDropdownData() {
    this.getItemTypes();
    this.getCategories();
    this.getLocations();
  }

  getCashPurchaseById() {
    if (!this.rec_id || this.rec_id === 0) {
      console.log('Invalid rec_id:', this.rec_id);
      return;
    }
    this._loading._loading.next(true);
    const request = {
      Params: [
        {
          Key: 'rec_id',
          Value: this.rec_id.toString(),
        },
      ],
    };
    console.log('Sending request =>', request);

    this.inventoryService.getCashPurchaseById(request).subscribe({
      next: (res: ICPList) => {
        console.log('API Response =>', res);
        this._loading._loading.next(false);
        this.loadFormDataFromResponse(res);
      },
      error: (error) => {
        this._loading._loading.next(false);
        console.error('Error loading CP details:', error);
      },
    });
  }
  loadFormDataFromResponse(response: any) {
    if (!response) return;

    // STEP 1: Patch basic fields first
    this.cashPurchaseForm.patchValue({
      sourceType: response.rec_sourcetype ?? '',
      sourceNum: response.rec_source_num ?? '',
      CPDate: response.rec_trans_date
        ? new Date(response.rec_trans_date)
        : null,
      rec_invoicenum: response.rec_invoicenum ?? '',
      vendorId: response.rec_vendor_id ?? null,
      itemTypeId: response.rec_item_type?.toString() ?? '',
      categoryId: response.rec_cat_id?.toString() ?? '',
      description: response.rec_description ?? '',
      batchNo: response.rec_batchno ?? '',
      quantity: response.rec_qty ?? 0,
      unitCost: response.rec_unitcost ?? 0,
      totalAmount: response.rec_linecost ?? 0,
      mfgDate: response.rec_mfg_date ? new Date(response.rec_mfg_date) : null,
      locationId: response.rec_location_id?.toString() ?? '',
      remarks: response.rec_remarks ?? '',
      inventoryType: response.rec_isserialized
        ? 'Serialized'
        : 'Non-Serialized',
    });

    // STEP 2: LOAD ITEMS FIRST
    this.loadItems();

    setTimeout(() => {
      const selectedItem = this.currentItemTypeData?.find(
        (item) => Number(item.itemtype_id) === Number(response.rec_item_id),
      );

      console.log('Selected Item =>', selectedItem); // debug

      this.cashPurchaseForm.patchValue({
        itemName: response.rec_item_id?.toString() ?? '',
        description: selectedItem?.itemtype_desc ?? '',
        uom: selectedItem?.itemtype_uom_name ?? response.rec_uom_name ?? '',
        uomId: selectedItem?.itemtype_uom_id ?? response.rec_uom ?? null,
      });
    }, 300);
  }
}

