import { AbstractControl, ValidatorFn } from '@angular/forms';

export function regxValidator(pattern: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!pattern.test(control.value)) {
      return { 'invalidRegxValue': true };
    }
    return null;
  };
}
