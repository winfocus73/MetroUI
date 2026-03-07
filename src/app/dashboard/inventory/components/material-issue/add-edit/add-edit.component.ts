import {
  Component,
  OnInit,
  OnDestroy,
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
import { IDropdown, IGetSearchRequest } from '@shared/models';
import { CommonService } from '@shared/services/common.service';
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

export interface IDepartmentWithCategory extends IUnit {
  categoryId?: number;
}

@Component({
  selector: 'nxasm-material-issue-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditMaterialIssueComponent implements OnInit, OnDestroy {
  @Output() message = new EventEmitter();
  @Input() labels: { [key: string]: string } = {};

  @Input() objForm: any;
  @Input() materialIssueId: number = 0;
  @Input() selectedLanguage: string = 'en';

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
  categoryItems: { code: any; value: any }[] = [];

  selectedCategoryId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit(): void {
    this.loginData = this.commonService.loginStorageData;
    this.initForm();
    this.setAutoFields();
    this.getLocations();
    this.getMRStatusTypes();
    this.getSections();
    this.getCategories();

    this.headerForm
      .get('categoryId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((categoryId) => {
        this.onCategoryChange(categoryId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.headerForm = this.fb.group({
      issueNumber: [{ value: 'AUTOGEN', disabled: true }, Validators.required],
      issueDate: [new Date(), Validators.required],
      fromLocationId: [null, Validators.required],
      mrNumber: [
        { value: 'MR' + moment().format('DDMMYYYYHHmmss'), disabled: true },
      ],
      categoryId: [null, Validators.required],
      toDepartmentId: [null, Validators.required], // Added this line
      statusId: [null, Validators.required],
      remarks: [''],
      preparedBy: [{ value: '', disabled: true }],
      preparedDate: [{ value: '', disabled: true }],
      approvedBy: [{ value: '', disabled: true }],
      approvedDate: [{ value: '', disabled: true }],
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
      error: (error) => {
        this.snackMsg('Error loading locations', 'error');
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
      error: (error) => {
        this.snackMsg('Error loading statuses', 'error');
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
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackMsg('Error loading categories', 'error');
      },
    });
  }

  getSections(): void {
    this.inventoryService.getSectionList().subscribe({
      next: (res: any[]) => {
        this.filteredDepartments = res.map((x: any) => ({
          code: x.id.toString(),
          value: x.name,
        }));

        console.log('Sections loaded:', this.filteredDepartments);
      },
      error: (error) => {
        console.error('Error loading sections:', error);
        this.snackMsg('Error loading sections', 'error');
      },
    });
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategoryId = categoryId ? Number(categoryId) : null;

    this.headerForm.patchValue({
      toDepartmentId: '',
    });

    if (this.selectedCategoryId && this.allDepartments.length > 0) {
      const filteredFullDepartments = this.allDepartments.filter(
        (dept) => dept.categoryId === this.selectedCategoryId,
      );

      this.filteredDepartments = filteredFullDepartments.map((dept) => ({
        code: dept.id?.toString() || '',
        value: dept.unitCode || '',
      }));

      if (this.filteredDepartments.length === 0) {
        this.snackMsg('No sections found for selected category', 'info');
      }
    } else {
      this.filteredDepartments = [];
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
    this.snackMsg('Line items loaded successfully', 'success');
  }

  private generateRowId(): string {
    return 'row_' + Math.random().toString(36).substr(2, 9);
  }

  submitHeader(): void {
    if (this.headerForm.invalid) {
      Object.keys(this.headerForm.controls).forEach((key) => {
        const control = this.headerForm.get(key);
        control?.markAsTouched();
      });
      this.snackMsg('Please fill all required fields', 'error');
      return;
    }

    console.log('Header saved:', this.headerForm.getRawValue());
    this.snackMsg('Header submitted successfully', 'success');
    this.headerSubmitted = true;
  }

  resetHeader(): void {
    this.headerForm.reset({
      issueNumber: 'AUTOGEN',
      issueDate: new Date(),
      mrNumber: 'MR' + moment().format('DDMMYYYYHHmmss'),
      categoryId: '',
      toDepartmentId: '',
      fromLocationId: '',
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

    this.snackMsg('Form reset', 'info');
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

    console.log(`canShowSerializedIcon for ${item.itemNum}: ${shouldShow}`, {
      isSerialized: item.isSerialized,
      issuedQty: item.issuedQty,
    });

    return shouldShow;
  }

  saveItem(item: ILineItem): void {
    if (item.isSerialized === 'SERIALIZED') {
      if (!item.issuedQty || item.issuedQty === 0) {
        this.snackMsg(
          'Please enter issued quantity for serialized item',
          'error',
        );
        return;
      }
      if (item.serialEntries && item.serialEntries.length > 0) {
        const incompleteEntries = item.serialEntries.filter(
          (entry) => !entry.serialNum || !entry.modelNum || !entry.make,
        );

        if (incompleteEntries.length > 0) {
          this.snackMsg(
            'Please complete all serial entries before saving',
            'error',
          );
          return;
        }
      }
    }

    console.log('Saving item:', item);
    this.snackMsg(`Item ${item.itemNum} saved successfully`, 'success');
  }

  editItem(item: ILineItem): void {
    console.log('Editing item:', item);
    this.snackMsg(`Editing item ${item.itemNum}`, 'info');
  }

  openSerializedEntry(item: ILineItem): void {
    if (!this.canShowSerializedIcon(item)) {
      this.snackMsg(
        'Please select SERIALIZED and enter issued quantity first',
        'error',
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
        this.snackMsg('Please fill all serial numbers', 'error');
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
      this.snackMsg('All serial entries saved successfully', 'success');
    }
    this.closeSerializedEntry();
  }

  closeSerializedEntry(): void {
    this.selectedSerializedItem = null;
    this.serializedEntries = [];
  }

  private snackMsg(msg: string, type: string): void {
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass:
        type === 'success'
          ? 'snackbar-success'
          : type === 'error'
            ? 'snackbar-error'
            : 'snackbar-info',
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  trackByItemId(index: number, item: ILineItem): string {
    return item.rowId || item.id?.toString() || index.toString();
  }

  trackBySerialIndex(index: number, item: ISerialEntry): string {
    return item.id || item.sNo?.toString() || index.toString();
  }
}
