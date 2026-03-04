import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function withinRangeValidator(min: number, max: number, inclusive: boolean = true): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value == null || value === '') {
      return null;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return { invalidNumber: true };
    }

    if (inclusive) {
      if (numValue < min || numValue > max) {
        return { outOfRange: { min, max, actual: numValue, msg: `Value must be between ${min} and ${max}` } };
      }
    } else {
      if (numValue <= min || numValue >= max) {
        return { outOfRange: { min, max, actual: numValue, msg: `Value must be between ${min} and ${max}` } };
      }
    }

    return null;
  };
}
