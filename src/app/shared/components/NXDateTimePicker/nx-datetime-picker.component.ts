import { Component, Input, OnDestroy } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormControl, FormGroup, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from "@angular/forms";
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule, NGX_MAT_DATE_FORMATS, NgxMatDateFormats } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { CommonModule } from "@angular/common";
import * as moment from "moment";
@Component({
  selector: 'nxams-mat-datetime-pic-wrap',
  templateUrl: './nx-datetime-picker.component.html',
  styleUrls: ['./nx-datetime-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: MatDateTimePickerWrap
    }
  ]
})
export class MatDateTimePickerWrap implements ControlValueAccessor {
  //export class MatDateTimePickerWrap implements ControlValueAccessor, Validator {
  // validate(control: AbstractControl<any, any>): ValidationErrors | null {
  //     throw new Error("Method not implemented.");
  // }
  // registerOnValidatorChange?(fn: () => void): void {
  //     throw new Error("Method not implemented.");
  // }
  displayDate!: Date | null;

  @Input() placeholder: string = "Select Date Time";

  @Input() enableMeridian: boolean = false;

  @Input() stepSecond: number = 0;

  @Input() showSeconds: boolean = true;

  @Input() min!: Date | number;




  //public dateControl = new FormControl(new Date()); 

  selectedDate: any = moment(new Date()).format();;

  onChange = (quantity: any) => { };

  onTouched = () => { };

  touched = false;

  disabled = false;

  // onAdd() {
  //   this.markAsTouched();
  //   if (!this.disabled) {
  //     this.quantity+= this.increment;
  //     this.onChange(this.quantity);
  //   }
  // }
  clearDate() {
    this.selectedDate.setValue(moment(new Date()), { nonNullable: true });;
  }
  // onRemove() {
  //   this.markAsTouched();
  //   if (!this.disabled) {
  //     this.quantity-= this.increment;
  //     this.onChange(this.quantity);
  //   }
  // }

  writeValue(dt: any) {
    if (dt) {
      this.displayDate = new Date(dt);
      this.selectedDate = new Date(dt);
    } else {
      this.displayDate = null;
      console.log('write value', this.displayDate)
    }    
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  onVisibleDateChange(event: any): void {
    this.selectedDate = event.value;
    if (!event.value) this.selectedDate = moment(new Date()).format();;
    this.onChange(this.selectedDate); // Propagate the change to the outside control
  }

  onHiddenDateChange(event: any): void {
    this.displayDate = event.value;
    this.onChange(this.selectedDate); // Propagate the change to the outside control
  }

  onDatePickerOpen(evnet: any): void {
    if (!this.displayDate)
      this.selectedDate = moment(new Date()).format();;
    this.onChange(this.displayDate); // Propagate the change to the outside control
  }

  // validate(control: AbstractControl): ValidationErrors | null {
  //   const quantity = control.value;
  //   if (quantity <= 0) {
  //     return {
  //       mustBePositive: {
  //         quantity
  //       }
  //     };
  //   }
  // }
}