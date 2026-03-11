import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-shipment-serial-no',
  templateUrl: './shipment-serial-no.component.html',
  styleUrls: ['./shipment-serial-no.component.scss']
})
export class ShipmentSerialNoComponent implements OnInit {

  shipmentSerialNoFrom!: FormGroup;
  totalRows: number = 0;
  itemNum: string = '';

constructor(
  private fb: FormBuilder,private mat: MatButtonModule   ,
  private dialogRef: MatDialogRef<ShipmentSerialNoComponent>, 
  @Inject(MAT_DIALOG_DATA) public data: any
) {}

 ngOnInit(): void {

  // Create form
  this.shipmentSerialNoFrom = this.fb.group({
    serialRows: this.fb.array([])
  });

  // Read dialog data
  this.totalRows = Number(this.data.receivedQty) || 0;
  this.itemNum = this.data.itemNum || '';

  console.log('Received Qty:', this.totalRows);
  console.log('Item Num:', this.itemNum);

  // Generate rows
  this.generateRows(this.totalRows, this.itemNum);

}

  // Getter for FormArray
  get serialRows(): FormArray {
    return this.shipmentSerialNoFrom.get('serialRows') as FormArray;
  }

  // Generate rows dynamically
  generateRows(count: number, itemNum: string = ''): void {

    this.serialRows.clear();

    for (let i = 0; i < count; i++) {

      this.serialRows.push(
        this.fb.group({
          item: [{ value: itemNum, disabled: true }], // readonly item
          serialNo: ['', Validators.required],
          make: [''],
          model: [''],
          warrentyDate: ['']
        })
      );

    }

  }

  // Save function
 saveSerialNo(): void {

  if (this.shipmentSerialNoFrom.invalid) {
    this.serialRows.markAllAsTouched();
    return;
  }

  const data = this.serialRows.getRawValue();

  console.log('Saved Serial Numbers:', data);

  // 👇 CLOSE DIALOG HERE
  this.dialogRef.close({
    serialCount: data.length,
    serialized: data
  });

}

  // Clear function
  clear(): void {
    this.generateRows(this.totalRows, this.itemNum);
  }

 checkDuplicateSerials(): void {

  const serialControls = this.serialRows.controls;

  const serialValues = serialControls.map(control =>
    control.get('serialNo')?.value?.trim().toLowerCase()
  );

  serialControls.forEach((control, index) => {

    const serialControl = control.get('serialNo');
    const currentValue = serialValues[index];

    if (!serialControl) return;

    // Skip empty (let required validator handle it)
    if (!currentValue) {
      const errors = serialControl.errors;
      if (errors) {
        delete errors['duplicate'];
        serialControl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return;
    }

    const duplicateCount = serialValues.filter(
      value => value === currentValue
    ).length;

    if (duplicateCount > 1) {
      serialControl.setErrors({
        ...serialControl.errors,
        duplicate: true
      });
    } else {
      const errors = serialControl.errors;
      if (errors) {
        delete errors['duplicate'];
        serialControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    }

  });
}

}
