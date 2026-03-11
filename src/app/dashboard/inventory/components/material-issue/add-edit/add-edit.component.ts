import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  Input,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ILoginData } from '@auth/models/login.response';
import { IUnit } from '@dashboard/configuration/models/units/unit';
import { InventoryService } from '@dashboard/inventory/services/inventory.service';
import { IDropdown, IGetSearchRequest, ICommonRequest } from '@shared/models';
import { CommonService } from '@shared/services/common.service';
import { LoadingService } from '@shared/services/spinner.service';
import {
  ScreenLabelService,
  IScreenLabelResponse,
} from '@shared/services/screen-label.service';
import { Constants } from 'src/app/core/http/constant';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';

export interface ILocation {
  value: string;
  name: string;
}

export interface IDepartment {
  value: string;
  name: string;
  categoryId?: number;
}

export interface IStatus {
  value: string;
  name: string;
}

export interface ISerializedOption {
  value: string;
  name: string;
}

export interface ILineItem {
  id?: number;
  itemNum: string;
  itemDesc: string;
  uom: string;
  isSerialized: string;
  orderQty: number;
  batchNo?: string;
  qoh?: number;
  issuedQty?: number;
  serialEntries?: ISerialEntry[];
  rowId?: string;
}

export interface ISerialEntry {
  sNo?: number;
  item: string;
  serialNum: string;
  mfgDate: Date | null;
  modelNum: string;
  make: string;
  itemId?: number;
  id?: string;
}

export interface ICategory {
  id: number;
  name: string;
  code?: string;
  description?: string;
}
export interface MRNumbers {
  id: number;
  name: string;
  code?: String;
  description?: string;
}

export interface IDepartmentWithCategory extends IUnit {
  categoryId?: number;
}

@Component({
  selector: 'nxasm-material-issue-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditMaterialIssueComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Output() message = new EventEmitter();
  @Input() labels: { [key: string]: string } = {};
  @Input() objForm: any;
  @Input() materialIssueId: number = 0;
  @Input() selectedLanguage: string = 'en';

  languages = Constants.LANGUAGES;
  private destroy$ = new Subject<void>();

  headerForm!: UntypedFormGroup;
  headerSubmitted = false;
  lineItemsDisplayed = false;

  locationItems: IDropdown[] = [];
  statusItems: IDropdown[] = [];
  allDepartments: IDepartmentWithCategory[] = [];
  filteredDepartments: IDropdown[] = [];
  deptItems: IUnit[] = [];

  serializedOptions: ISerializedOption[] = [
    { value: 'SERIALIZED', name: 'SERIALIZED' },
    { value: 'NON SERIALIZED', name: 'NON SERIALIZED' },
  ];

  lineItems: ILineItem[] = [];

  selectedSerializedItem: ILineItem | null = null;
  serializedEntries: ISerialEntry[] = [];

  loginData: ILoginData = {} as ILoginData;

  today = new Date();
  categories: ICategory[] = [];
  MRNumbers: MRNumbers[] = [];
  categoryItems: { code: any; value: any }[] = [];
  MRNumbersDetails: { code: any; value: any }[] = [];

  selectedCategoryId: number | null = null;

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private inventoryService: InventoryService,
    private screenLabelService: ScreenLabelService,
    private _loading: LoadingService,
  ) {}

  ngOnInit(): void {
    this.loadScreenLabels();
    this.loginData = this.commonService.loginStorageData;
    this.initForm();
    this.setAutoFields();
    this.getLocations();
    this.getMRStatusTypes();
    this.getCategories();
    this.getMRNumbers();

    this.headerForm
      .get('categoryId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((categoryId: string) => {
        this.onCategoryChange(categoryId);
      });

    // Load data if editing existing record
    if (this.materialIssueId && this.materialIssueId > 0) {
      this.loadMaterialIssueData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['materialIssueId'] &&
      changes['materialIssueId'].currentValue > 0 &&
      !changes['materialIssueId'].firstChange
    ) {
      this.loadMaterialIssueData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadScreenLabels(): void {
    this._loading._loading.next(true);

    this.screenLabelService
      .getScreenLabels('MATERIAL_ISSUE_ADD_EDIT', this.selectedLanguage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: IScreenLabelResponse) => {
          this._loading._loading.next(false);

          if (response.success && response.data && response.data.length > 0) {
            this.labels = {};
            response.data.forEach(
              (item: { lbl_name: string; lbl_value: string }) => {
                this.labels[item.lbl_name] = item.lbl_value;
              },
            );
            console.log('Labels loaded:', this.labels);
          }
        },
        error: (error: any) => {
          this._loading._loading.next(false);
          console.error('Error loading labels:', error);
        },
      });
  }

  onLanguageChange(lang: string): void {
    this.selectedLanguage = lang;
    this.loadScreenLabels();
  }

  getLabel(key: string, fallback: string): string {
    return this.labels[key] || fallback;
  }

  private snackMsg(key: string, type: string, fallback: string): void {
    this.snackBar.open(
      this.getLabel(key, fallback),
      this.getLabel('close', 'Close'),
      {
        duration: 3000,
        panelClass:
          type === 'success'
            ? 'snackbar-success'
            : type === 'error'
              ? 'snackbar-error'
              : 'snackbar-info',
        horizontalPosition: 'end',
        verticalPosition: 'top',
      },
    );
  }

  private initForm(): void {
    this.headerForm = this.fb.group({
      issueNumber: [{ value: 'AUTOGEN', disabled: true }], // Remove Validators.required
      issueDate: [new Date(), Validators.required],
      fromLocationId: [null, Validators.required],
      mrNumberId: [null, Validators.required],
      categoryId: [null, Validators.required],
      toDepartmentId: [null, Validators.required],
      statusId: [null, Validators.required],
      remarks: [''],
      preparedBy: [{ value: '', disabled: true }], // Remove validators
      preparedDate: [{ value: '', disabled: true }], // Remove validators
      approvedBy: [{ value: '', disabled: true }], // Remove validators
      approvedDate: [{ value: '', disabled: true }], // Remove validators
    });
  }

  private setAutoFields(): void {
    const userName = this.loginData?.loginData?.userName || 'Current User';
    this.headerForm.patchValue({
      preparedBy: userName,
      preparedDate: moment().format('DD-MM-YYYY'),
      approvedBy: '',
      approvedDate: '',
    });
  }

  getLocations(): void {
    this.inventoryService.getLocations().subscribe({
      next: (res: any[]) => {
        this.locationItems = res.map((x) => ({
          code: x.id.toString(),
          value: x.name,
        }));
      },
      error: (error: any) => {
        this.snackMsg(
          'errorLoadingLocations',
          'error',
          'Error loading locations',
        );
        console.error('Location error:', error);
      },
    });
  }

  getMRStatusTypes(): void {
    this.inventoryService.getMrStatus().subscribe({
      next: (res: any[]) => {
        this.statusItems = res.map((x) => ({
          code: x.id.toString(),
          value: x.name,
        }));
      },
      error: (error: any) => {
        this.snackMsg(
          'errorLoadingStatuses',
          'error',
          'Error loading statuses',
        );
        console.error('Status error:', error);
      },
    });
  }

  getCategories(): void {
    this.inventoryService.getCategories().subscribe({
      next: (res: ICategory[]) => {
        this.categories = res;
        this.categoryItems = res.map((x) => ({
          code: x.id.toString(),
          value: x.name,
        }));
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.snackMsg(
          'errorLoadingCategories',
          'error',
          'Error loading categories',
        );
      },
    });
  }

  getMRNumbers(): void {
    this.inventoryService.getMRNumbers().subscribe({
      // Use getMINumbers() not getMRNumbers()
      next: (res: MRNumbers[]) => {
        this.MRNumbers = res;
        this.MRNumbersDetails = res.map((x) => ({
          code: x.id.toString(),
          value: x.name,
        }));
      },
      error: (error: any) => {
        console.error('Error loading MR numbers:', error);
        this.snackMsg(
          'errorLoadingMRNumbers',
          'error',
          'Error loading MR numbers',
        );
      },
    });
  }
  getSections(categoryId?: number): void {
    if (!categoryId) {
      this.filteredDepartments = [];
      return;
    }

    this._loading._loading.next(true);

    // Create request with CategoryId parameter
    const request = {
      Params: [{ Key: 'CategoryId', Value: categoryId.toString() }],
    };

    console.log(
      'Fetching sections for category ID:',
      categoryId,
      'Request:',
      request,
    );

    this.inventoryService.getSectionList(request).subscribe({
      next: (res: any[]) => {
        this._loading._loading.next(false);
        console.log('Sections API response:', res);

        // Map the response to dropdown format
        this.filteredDepartments = res.map((x: any) => ({
          code: x.id.toString(),
          value: x.name,
        }));

        console.log('Mapped sections for dropdown:', this.filteredDepartments);
      },
      error: (error: any) => {
        this._loading._loading.next(false);
        console.error('Error loading sections:', error);
        this.snackMsg(
          'errorLoadingSections',
          'error',
          'Error loading sections',
        );
        this.filteredDepartments = [];
      },
    });
  }

  onCategoryChange(categoryId: string): void {
    console.log('Category changed to ID:', categoryId);

    // Clear the selected section
    this.headerForm.patchValue({
      toDepartmentId: '',
    });

    // Clear current sections
    this.filteredDepartments = [];

    // If category is selected, fetch sections
    if (categoryId) {
      const id = Number(categoryId);
      console.log('Fetching sections for category:', id);
      this.getSections(id);
    }
  }

  loadLineItems(): void {
    this.lineItems = [
      {
        id: 1,
        itemNum: 'ITEM003',
        itemDesc: 'LEVELLING VALVE',
        uom: 'EA',
        isSerialized: 'NON SERIALIZED',
        orderQty: 50,
        batchNo: 'B0001',
        qoh: 75,
        issuedQty: 50,
        rowId: this.generateRowId(),
      },
      {
        id: 2,
        itemNum: 'ITEM003',
        itemDesc: 'LEVELLING VALVE',
        uom: 'EA',
        isSerialized: 'NON SERIALIZED',
        orderQty: 50,
        batchNo: 'B0002',
        qoh: 55,
        issuedQty: undefined,
        rowId: this.generateRowId(),
      },
      {
        id: 3,
        itemNum: 'ITEM001',
        itemDesc: 'DRIVING GEAR UNIT',
        uom: 'BOX',
        isSerialized: 'SERIALIZED',
        orderQty: 5,
        batchNo: '',
        qoh: undefined,
        issuedQty: undefined,
        serialEntries: [],
        rowId: this.generateRowId(),
      },
    ];

    this.lineItemsDisplayed = true;
    this.snackMsg(
      'lineItemsLoaded',
      'success',
      'Line items loaded successfully',
    );
  }

  private generateRowId(): string {
    return 'row_' + Math.random().toString(36).substr(2, 9);
  }

  // Load material issue data for editing
  // Load material issue data for editing
  // Load material issue data for editing
  // Load material issue data for editing
  loadMaterialIssueData(): void {
    if (!this.materialIssueId || this.materialIssueId === 0) {
      return;
    }

    this._loading._loading.next(true);

    // Use ICommonRequest format
    const request: ICommonRequest = {
      Params: [{ key: 'IssueId', value: this.materialIssueId.toString() }],
    };

    this.inventoryService.getMaterialIssueDetails(request).subscribe({
      next: (response: any) => {
        this._loading._loading.next(false);

        if (response && response.success && response.data) {
          this.populateFormWithData(response);
          this.snackMsg(
            'Data loaded successfully',
            'success',
            'Data loaded successfully',
          );
        } else {
          this.snackMsg('errorLoadingData', 'error', 'No data found');
        }
      },
      error: (error: any) => {
        this._loading._loading.next(false);
        console.error('Error loading material issue data:', error);
        this.snackMsg('errorLoadingData', 'error', 'Error loading data');
      },
    });
  }

  // Populate form with loaded data
  populateFormWithData(response: any): void {
    const headerData = response.data?.header || response.header || response;
    const lineItemsData = response.data?.lineItems || response.lineItems || [];

    // Ensure we set proper values
    this.headerForm.patchValue({
      issueNumber: headerData.issue_num || headerData.issueNumber || 'AUTOGEN',
      issueDate:
        headerData.issue_date || headerData.issueDate
          ? moment(headerData.issue_date || headerData.issueDate).toDate()
          : new Date(),
      fromLocationId:
        (
          headerData.issue_location_id || headerData.fromLocationId
        )?.toString() || null,

      categoryId:
        (
          headerData.issue_section_category_id || headerData.categoryId
        )?.toString() || null,
      toDepartmentId:
        (
          headerData.issued_to_section || headerData.toDepartmentId
        )?.toString() || null,
      statusId:
        (headerData.issue_status || headerData.statusId)?.toString() || null,
      mrNumberId: headerData.mr_id?.toString() || null,
      remarks: headerData.issue_remarks || headerData.remarks || '',
      preparedBy:
        headerData.created_by_name ||
        headerData.preparedBy ||
        this.loginData?.loginData?.userName ||
        'Current User',
      preparedDate:
        headerData.created_date || headerData.preparedDate
          ? moment(headerData.created_date || headerData.preparedDate).format(
              'DD-MM-YYYY',
            )
          : moment().format('DD-MM-YYYY'),
      approvedBy: headerData.updated_by_name || headerData.approvedBy || '',
      approvedDate:
        headerData.updated_date || headerData.approvedDate
          ? moment(headerData.updated_date || headerData.approvedDate).format(
              'DD-MM-YYYY',
            )
          : '',
    });

    // Trigger validation update
    this.headerForm.updateValueAndValidity();

    if (lineItemsData && lineItemsData.length > 0) {
      this.lineItems = lineItemsData.map((item: any) => ({
        id: item.issueId || item.id,
        itemNum: item.itemId?.toString() || item.itemNum || '',
        itemDesc: item.category_Name || item.itemDesc || '',
        uom: item.uom || '',
        isSerialized: item.isSerialized ? 'SERIALIZED' : 'NON SERIALIZED',
        orderQty: item.orderedQty || item.orderQty || 0,
        batchNo: item.batchNo || '',
        qoh: item.qoh || 0,
        issuedQty: item.issuedQty || 0,
        rowId: this.generateRowId(),
      }));

      this.lineItemsDisplayed = true;
      this.headerSubmitted = true;
    }
  }

  submitHeader(): void {
    // Check if form is valid
    if (this.headerForm.invalid) {
      Object.keys(this.headerForm.controls).forEach((key) => {
        const control = this.headerForm.get(key);
        control?.markAsTouched();
      });
      this.snackMsg(
        'fillRequiredFields',
        'error',
        'Please fill all required fields',
      );
      return;
    }

    // Show loading spinner
    this._loading._loading.next(true);

    // Get form values
    const formValues = this.headerForm.getRawValue();

    // Get user ID
    const userId = this.loginData?.loginData?.userId || 1;

    // Base request data for both create and update
    const baseRequestData = {
      issue_date: moment(formValues.issueDate).format('YYYY-MM-DD'),
      mr_id: Number(formValues.mrNumberId), // You might want to get this from somewhere
      issue_section_category_id: Number(formValues.categoryId),
      issued_to_section: Number(formValues.toDepartmentId),
      issue_location_id: Number(formValues.fromLocationId),
      issue_status: Number(formValues.statusId),
      issue_remarks: formValues.remarks || '',
      created_by: userId,
    };

    console.log('Submitting header:', baseRequestData);

    // Choose the right API method based on whether it's create or update
    let apiCall;

    if (this.materialIssueId && this.materialIssueId > 0) {
      // For update, include the issue_id
      const updateData = {
        ...baseRequestData,
        issue_id: this.materialIssueId,
      };
      apiCall = this.inventoryService.addIssueHeader(updateData);
    } else {
      // For create, use the base data
      apiCall = this.inventoryService.addIssueHeader(baseRequestData);
    }

    apiCall.subscribe({
      next: (response: any) => {
        this._loading._loading.next(false);

        if (response.status === 34) {
          this.snackMsg(
            'headerSubmitted',
            'success',
            response.message || 'Header saved successfully',
          );
          this.headerSubmitted = true;

          if (response.issue_id) {
            this.materialIssueId = response.issue_id;
          }

          this.message.emit(response);
        } else {
          this.snackMsg(
            'errorSubmitting',
            'error',
            response.message || 'Error saving header',
          );
        }
      },
      error: (error: any) => {
        this._loading._loading.next(false);
        console.error('API Error:', error);
        const errorMsg =
          error.error?.message || 'Failed to save. Please try again.';
        this.snackMsg('errorSubmitting', 'error', errorMsg);
      },
    });
  }

  resetHeader(): void {
    this.headerForm.reset({
      issueNumber: 'AUTOGEN',
      issueDate: new Date(),
      mrNumberId: null,
      categoryId: null, // Use null instead of empty string
      toDepartmentId: null, // Use null instead of empty string
      fromLocationId: null, // Use null instead of empty string
      statusId: null,
      remarks: '',
      preparedBy: this.loginData?.loginData?.userName || 'Current User',
      preparedDate: moment().format('DD-MM-YYYY'),
      approvedBy: '',
      approvedDate: '',
    });

    this.headerSubmitted = false;
    this.lineItemsDisplayed = false;
    this.lineItems = [];
    this.selectedSerializedItem = null;
    this.serializedEntries = [];
    this.selectedCategoryId = null;
    this.filteredDepartments = [];

    // Trigger validation update
    this.headerForm.updateValueAndValidity();

    this.snackMsg('formReset', 'info', 'Form reset');
  }

  updateIsSerialized(item: ILineItem, event: any): void {
    const updatedItem = { ...item, isSerialized: event };

    const index = this.lineItems.findIndex(
      (x) =>
        (x.id === item.id && x.itemNum === item.itemNum) ||
        x.rowId === item.rowId,
    );

    if (index !== -1) {
      this.lineItems[index] = updatedItem;
      this.lineItems = [...this.lineItems];
    }

    if (event !== 'SERIALIZED' && item.serialEntries) {
      updatedItem.serialEntries = [];
    }

    console.log('Updated serialized status:', updatedItem);
  }

  updateIssuedQty(item: ILineItem, event: any): void {
    const value = event.target.value;
    const issuedQty = value ? Number(value) : undefined;

    const updatedItem = { ...item, issuedQty };

    const index = this.lineItems.findIndex(
      (x) =>
        (x.id === item.id && x.itemNum === item.itemNum) ||
        x.rowId === item.rowId,
    );

    if (index !== -1) {
      this.lineItems[index] = updatedItem;
      this.lineItems = [...this.lineItems];
    }
  }

  onIssuedQtyChange(item: ILineItem): void {
    console.log(
      'Issued quantity changed for item:',
      item.itemNum,
      'to:',
      item.issuedQty,
    );
  }

  canShowSerializedIcon(item: ILineItem): boolean {
    const shouldShow =
      item.isSerialized === 'SERIALIZED' &&
      item.issuedQty !== undefined &&
      item.issuedQty !== null &&
      item.issuedQty > 0;

    return shouldShow;
  }

  saveItem(item: ILineItem): void {
    if (item.isSerialized === 'SERIALIZED') {
      if (!item.issuedQty || item.issuedQty === 0) {
        this.snackMsg(
          'enterIssuedQty',
          'error',
          'Please enter issued quantity for serialized item',
        );
        return;
      }
      if (item.serialEntries && item.serialEntries.length > 0) {
        const incompleteEntries = item.serialEntries.filter(
          (entry) => !entry.serialNum || !entry.modelNum || !entry.make,
        );

        if (incompleteEntries.length > 0) {
          this.snackMsg(
            'completeSerialEntries',
            'error',
            'Please complete all serial entries before saving',
          );
          return;
        }
      }
    }

    console.log('Saving item:', item);
    this.snackMsg(
      'itemSaved',
      'success',
      `Item ${item.itemNum} saved successfully`,
    );
  }

  editItem(item: ILineItem): void {
    console.log('Editing item:', item);
    this.snackMsg('editItem', 'info', `Editing item ${item.itemNum}`);
  }

  openSerializedEntry(item: ILineItem): void {
    if (!this.canShowSerializedIcon(item)) {
      this.snackMsg(
        'selectSerializedFirst',
        'error',
        'Please select SERIALIZED and enter issued quantity first',
      );
      return;
    }

    this.selectedSerializedItem = item;

    if (item.serialEntries && item.serialEntries.length === item.issuedQty) {
      this.serializedEntries = [...item.serialEntries];
    } else {
      this.serializedEntries = [];
      const count = item.issuedQty || 1;

      for (let i = 0; i < count; i++) {
        this.serializedEntries.push({
          id: this.generateRowId(),
          sNo: i + 1,
          item: item.itemNum,
          serialNum: '',
          mfgDate: null,
          modelNum: '',
          make: '',
          itemId: item.id,
        });
      }
    }
  }

  saveAllSerialEntries(): void {
    if (this.selectedSerializedItem) {
      const incompleteEntries = this.serializedEntries.filter(
        (entry) => !entry.serialNum,
      );

      if (incompleteEntries.length > 0) {
        this.snackMsg(
          'fillAllSerialNumbers',
          'error',
          'Please fill all serial numbers',
        );
        return;
      }

      const updatedItem = {
        ...this.selectedSerializedItem,
        serialEntries: [...this.serializedEntries],
      };

      const index = this.lineItems.findIndex(
        (x) =>
          (x.id === updatedItem.id && x.itemNum === updatedItem.itemNum) ||
          x.rowId === updatedItem.rowId,
      );

      if (index !== -1) {
        this.lineItems[index] = updatedItem;
        this.lineItems = [...this.lineItems];
      }

      console.log('Saving serial entries:', this.serializedEntries);
      this.snackMsg(
        'serialEntriesSaved',
        'success',
        'All serial entries saved successfully',
      );
    }
    this.closeSerializedEntry();
  }

  closeSerializedEntry(): void {
    this.selectedSerializedItem = null;
    this.serializedEntries = [];
  }

  trackByItemId(index: number, item: ILineItem): string {
    return item.rowId || item.id?.toString() || index.toString();
  }

  trackBySerialIndex(index: number, item: ISerialEntry): string {
    return item.id || item.sNo?.toString() || index.toString();
  }
}
