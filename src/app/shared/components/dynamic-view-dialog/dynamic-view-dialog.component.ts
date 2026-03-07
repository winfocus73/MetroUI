import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dynamic-view-dialog',
  templateUrl: './dynamic-view-dialog.component.html',
  styleUrls: ['./dynamic-view-dialog.component.scss'],
})
export class DynamicViewDialogComponent implements OnInit {
  headerData: any = null;
  lineItems: any[] = [];
  headerKeys: string[] = [];

  // Simple column definition - only what's needed
  displayedColumns: string[] = [
    'sno',
    'itemType',
    'category',
    'itemName',
    'description',
    'uom',
    'quantity',
    'unitCost',
    'totalAmount',
    'remarks',
  ];

  // Field name mappings - Removed all ID fields
  private fieldMappings: { [key: string]: string } = {
    poNumber: 'PO NUMBER',
    vendorName: 'VENDOR',
    poDate: 'PO DATE',
    orderDate: 'PO DATE',
    statusName: 'STATUS',
    estimateCost: 'EST. COST',
    locationName: 'LOCATION',
    priorityName: 'PRIORITY',
    remarks: 'REMARKS',
    requiredDate: 'REQUIRED DATE',
    shipTo: 'SHIP TO',
  };

  constructor(
    public dialogRef: MatDialogRef<DynamicViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    if (!this.data?.data) return;
    const response = this.data.data;
    if (response.header && response.lineItems) {
      this.headerData = response.header;
      this.lineItems = response.lineItems;
    } else if (response.lineItems && Array.isArray(response.lineItems)) {
      this.headerData = { ...response };
      delete this.headerData.lineItems;
      this.lineItems = response.lineItems;
    } else {
      this.headerData = response;
      this.lineItems = [];
    }
    if (this.headerData) {
      this.headerKeys = this.getHeaderKeys();
    }
  }

  private getHeaderKeys(): string[] {
    const excludeFields = [
      'id',
      '_id',
      'poId',
      'poliId',
      'lineItems',
      'createdUserId',
      'updatedUserId',
      'createdDatetime',
      'updatedDatetime',
      'createdUserName',
      'updatedUserName',
      'isComplete',
      'index',
      'checked',
      'locationId',
      'priorityId',
      'statusId',
      'vendorId',
      'poID',
      'locationID',
      'priorityID',
      'statusID',
      'vendorID',
    ];
    const preferredOrder = [
      'poNumber',
      'vendorName',
      'poDate',
      'statusName',
      'estimateCost',
      'locationName',
      'priorityName',
      'remarks',
      'requiredDate',
      'shipTo',
    ];

    return Object.keys(this.headerData)
      .filter((key) => {
        const lowerKey = key.toLowerCase();
        if (
          (lowerKey.includes('id') || lowerKey.includes('i d')) &&
          !lowerKey.includes('name') &&
          !lowerKey.includes('description')
        ) {
          return false;
        }
        if (excludeFields.includes(key) || excludeFields.includes(lowerKey)) {
          return false;
        }
        if (this.headerData[key] == null) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aIndex = preferredOrder.indexOf(a);
        const bIndex = preferredOrder.indexOf(b);

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
      });
  }

  formatValue(key: string, value: any): string {
    if (value == null) return '—';
    if (value instanceof Date || this.isDateString(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }
    }
    if (typeof value === 'number' && this.isCurrencyField(key)) {
      return '₹ ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return value.toString();
  }

  isDateString(value: any): boolean {
    if (typeof value !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}|^\d{2}[-\/]\d{2}[-\/]\d{4}/.test(value);
  }

  isCurrencyField(key: string): boolean {
    const currencyFields = [
      'cost',
      'price',
      'amount',
      'estimate',
      'unitCost',
      'total',
    ];
    return currencyFields.some((field) => key.toLowerCase().includes(field));
  }
  getFieldLabel(key: string): string {
    return (
      this.fieldMappings[key] ||
      key
        .replace(/([A-Z])/g, ' $1')
        .toUpperCase()
        .trim()
    );
  }
}
