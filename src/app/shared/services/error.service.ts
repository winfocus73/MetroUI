import { Injectable } from '@angular/core';
import { ErrorTypes, ERROR_MESSAGES } from './error-messages';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import * as moment from 'moment';
import { Observable, of, delay, map } from 'rxjs';
import { Constants } from 'src/app/core/http/constant';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor() {}

  getErrorValidationMessage(
    formControlName: string,
    errors: [string, any][]
  ): string {
    switch (true) {
      case this.checkErrorType(errors, 'owlDateTimeParse'):
        return ERROR_MESSAGES['required'](formControlName);
      case this.checkErrorType(errors, 'required'):
        return ERROR_MESSAGES['required'](formControlName);
      case this.checkErrorType(errors, 'invalidYear'):
        return ERROR_MESSAGES['invalidYear']();
      case this.checkErrorType(errors, 'invalidDate'):
        return ERROR_MESSAGES['invalidDate']();

      case this.checkErrorType(errors, 'toDateLessThanCurrent'):
        let toDateLessThanCurrentMsg = this.getErrorMessage(
          errors,
          'toDateLessThanCurrent'
        );
        return toDateLessThanCurrentMsg;
      case this.checkErrorType(errors, 'toDateLessThanFrom'):
        let txt = this.getErrorMessage(errors, 'toDateLessThanFrom');
        return txt;
      case this.checkErrorType(errors, 'atLeastOneChecked'):
        let oneValueReqMsg = this.getErrorMessage(errors, 'atLeastOneChecked');
        return oneValueReqMsg;
      case this.checkErrorType(errors, 'assetIdorRouteIdRequired'):
        let assetIdorRouteIdRequiredMsg = this.getErrorMessage(
          errors,
          'assetIdorRouteIdRequired'
        );
        return assetIdorRouteIdRequiredMsg;
      case this.checkErrorType(errors, 'maxDate'):
        let maxErrtxt = this.getErrorMessage(errors, 'maxDate');
        return maxErrtxt;
      case this.checkErrorType(errors, 'minDate'):
        let minErrtxt = this.getErrorMessage(errors, 'minDate');
        return minErrtxt;
      case this.checkErrorType(errors, 'dateTimeRangeInvalid'):
        return ERROR_MESSAGES['dateTimeRangeInvalid']();
      case this.checkErrorType(errors, 'email'):
        return ERROR_MESSAGES['email']();

      case this.checkErrorType(errors, 'minlength'):
        const minRequirement = this.getErrorMessage(
          errors,
          'minlength'
        )?.requiredLength;
        return ERROR_MESSAGES['minlength'](formControlName, minRequirement);

      default:
        return '';
    }
  }

  checkErrorType(errors: [string, any][], key: ErrorTypes) {
    return errors.some(([errorKey, value]) => errorKey === key);
  }

  getErrorMessage(errors: [string, any][], key: ErrorTypes) {
    return errors.find(([k, v]) => k === key)?.[1];
  }

  static minMaxDateTimeValidator(
    minDate: string | Date | null | number,
    maxDate: string | Date | null | number
  ): ValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Specify Observable<ValidationErrors | null> return type
      // Convert control value to moment object
      const valueMoment = moment(control.value, 'YYYY-MM-DDTHH:mm:ss');

      // Parse min and max dates
      const minDateMoment = moment(minDate, 'YYYY-MM-DDTHH:mm:ss');
      const maxDateMoment = moment(maxDate, 'YYYY-MM-DDTHH:mm:ss');

      // Simulate asynchronous operation (you can replace this with actual asynchronous logic)
      return of(null).pipe(
        // Return an Observable
        delay(1000), // Simulate delay using delay operator
        map(() => {
          // Map to validation result
          // Check if control value is between min and max dates
          if (
            valueMoment.isBefore(minDateMoment) ||
            valueMoment.isAfter(maxDateMoment)
          ) {
            return { dateTimeRangeInvalid: true }; // Return an error object if validation fails
          }
          return null; // Return null if validation passes
        })
      );
    };
  }

  static dateRangeValidator(
    controlName1: string,
    controlName2: string
  ): ValidatorFn {
    //return (formGroup: FormGroup): Observable<ValidationErrors | null> => {
    return (formGroup: any): ValidationErrors => {
      if (!(formGroup instanceof FormGroup)) return <any>null;

      const control1 = formGroup.get(controlName1);
      const control2 = formGroup.get(controlName2);

      if (!control1 || !control2 || !control1.value || !control2.value) {
        return <any>null; // Return null if controls are not found
      }

      const fromDate = control1.value;
      const toDate = control2.value;

      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      if (fromDateObj > toDateObj) {
        // If fromDate is after toDate, return validation error
        let validation = { dateRangeInvalid: true };
        let toDateValidation = {
          toDateLessThanFrom: `${
            (<any>Constants)[controlName2]
          } should be greater than ${(<any>Constants)[controlName1]}`,
        };
        control2.setErrors(toDateValidation);
        return validation;
      } else {
        // Clear the validation error if dates are valid
        control2.setErrors(null);
        return <any>null;
      }

      //return <any>null;
    };
  }

  static FormGroupTodateValidator(
    controlName1: string,
    controlName2: string
  ): ValidatorFn {
    //return (formGroup: FormGroup): Observable<ValidationErrors | null> => {
    return (formGroup: any): ValidationErrors => {
      if (!(formGroup instanceof FormGroup)) return <any>null;

      const control1 = formGroup.get(controlName1);
      const control2 = formGroup.get(controlName2);

      if (!control1 || !control2 || !control1.value || !control2.value) {
        return <any>null; // Return null if controls are not found
      }

      const fromDate = control1.value;
      const toDate = control2.value;

      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      if (fromDateObj > toDateObj) {
        // If fromDate is after toDate, return validation error
        let validation = { dateRangeInvalid: true };
        let toDateValidation = {
          toDateLessThanFrom: `${
            (<any>Constants)[controlName2]
          } should be greater than ${(<any>Constants)[controlName1]}`,
        };
        control2.setErrors(toDateValidation);
        return validation;
      } else {
        // Clear the validation error if dates are valid
        control2.setErrors(null);
        return <any>null;
      }

      //return <any>null;
    };
  }

  static FormGroupTodateAsyncValidator(
    controlName1: string,
    controlName2: string
  ): AsyncValidatorFn {
    return (
      formGroup: AbstractControl
    ): Observable<ValidationErrors | null> => {
      return new Observable<ValidationErrors | null>((observer) => {
        if (!(formGroup instanceof FormGroup)) {
          observer.next(null);
          observer.complete();
          return;
        }

        const control1 = formGroup.get(controlName1);
        const control2 = formGroup.get(controlName2);

        if (!control1 || !control2 || !control1.value || !control2.value) {
          observer.next(null); // Return null if controls are not found
          observer.complete();
          return;
        }

        const fromDate = control1.value;
        const toDate = control2.value;

        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        if (fromDateObj > toDateObj) {
          // If fromDate is after toDate, return validation error
          const validation: ValidationErrors = { dateRangeInvalid: true };
          const toDateValidation: ValidationErrors = {
            toDateLessThanFrom: `${controlName2} should be greater than ${controlName1}`,
          };
          control2.setErrors(toDateValidation);
          observer.next(validation);
        } else {
          // Clear the validation error if dates are valid
          control2.setErrors(null);
          observer.next(null);
        }

        observer.complete();
      }).pipe(
        map((result: ValidationErrors | null) => result) // Just to satisfy the return type of the Observable
      );
    };
  }

  static FormGroupfromdateValidator(
    fromDateControlName: string,
    toDateControlName: string
  ): ValidatorFn {
    //return (formGroup: FormGroup): Observable<ValidationErrors | null> => {
    return (formGroup: any): ValidationErrors => {
      if (!(formGroup instanceof FormGroup)) return <any>null;

      const fromDateControl = formGroup.get(fromDateControlName);
      const toDateControl = formGroup.get(toDateControlName);

      if (
        !fromDateControl ||
        !toDateControl ||
        !fromDateControl.value ||
        !toDateControl.value
      ) {
        return <any>null; // Return null if controls are not found
      }

      const fromDate = fromDateControl.value;
      const toDate = toDateControl.value;

      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      if (fromDateObj > toDateObj) {
        // If fromDate is after toDate, return validation error
        let validation = { dateRangeInvalid: true };
        let toDateValidation = {
          toDateLessThanFrom: `${
            (<any>Constants)[fromDateControlName]
          } should be less than ${(<any>Constants)[toDateControlName]}`,
        };
        fromDateControl.setErrors(toDateValidation);
        return validation;
      } else {
        // Clear the validation error if dates are valid
        fromDateControl.setErrors(null);
        return <any>null;
      }

      //return <any>null;
    };
  }

  static FormGroupfromdateAsyncValidator(
    fromDateControlName: string,
    toDateControlName: string
  ): AsyncValidatorFn {
    return (
      formGroup: AbstractControl
    ): Observable<ValidationErrors | null> => {
      return new Observable<ValidationErrors | null>((observer) => {
        if (!(formGroup instanceof FormGroup)) {
          observer.next(null);
          observer.complete();
          return;
        }

        const fromDateControl = formGroup.get(fromDateControlName);
        const toDateControl = formGroup.get(toDateControlName);

        if (
          !fromDateControl ||
          !toDateControl ||
          !fromDateControl.value ||
          !toDateControl.value
        ) {
          observer.next(null); // Return null if controls are not found
          observer.complete();
          return;
        }

        const fromDate = fromDateControl.value;
        const toDate = toDateControl.value;

        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        if (fromDateObj > toDateObj) {
          // If fromDate is after toDate, return validation error
          const validation: ValidationErrors = { dateRangeInvalid: true };
          const toDateValidation: ValidationErrors = {
            toDateLessThanFrom: `${fromDateControlName} should be less than ${toDateControlName}`,
          };
          fromDateControl.setErrors(toDateValidation);
          observer.next(validation);
        } else {
          // Clear the validation error if dates are valid
          fromDateControl.setErrors(null);
          observer.next(null);
        }

        observer.complete();
      });
    };
  }

  static fromdateValidator(
    fromDateControlName: string,
    toDateControlName: string
  ): ValidatorFn {
    //return (formGroup: FormGroup): Observable<ValidationErrors | null> => {
    return (formGroup: any): ValidationErrors => {
      if (!(formGroup instanceof FormGroup)) return <any>null;

      const fromDateControl = formGroup.get(fromDateControlName);
      const toDateControl = formGroup.get(toDateControlName);

      if (
        !fromDateControl ||
        !toDateControl ||
        !fromDateControl.value ||
        !toDateControl.value
      ) {
        return <any>null; // Return null if controls are not found
      }

      const fromDate = fromDateControl.value;
      const toDate = toDateControl.value;

      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      if (fromDateObj > toDateObj) {
        // If fromDate is after toDate, return validation error
        let validation = { dateRangeInvalid: true };
        let toDateValidation = {
          toDateLessThanFrom: `${
            (<any>Constants)[fromDateControlName]
          } should be less than ${(<any>Constants)[toDateControlName]}`,
        };
        fromDateControl.setErrors(toDateValidation);
        return validation;
      } else {
        // Clear the validation error if dates are valid
        fromDateControl.setErrors(null);
        return <any>null;
      }

      //return <any>null;
    };
  }

  static minDateAsyncValidator(
    minDate: Date | string,
    comparingControlName: string = 'Current Date'
  ): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      const selectedDate = new Date(control.value);

      if (!minDate) {
        return of(null);
      }
      // Convert minDate to Date object if it's provided as a string
      const minDateObj =
        typeof minDate === 'string' ? new Date(minDate) : minDate;

      return of(selectedDate).pipe(
        map((date: Date) => {
          if (!date || date >= minDateObj) {
            return null; // Validation passes
          } else {
            //return { 'minDate': { min: minDateObj } }; // Validation fails
            return {
              minDate: `Should be greater than ${comparingControlName} ${moment(
                minDateObj
              ).format('DD-MM-YYYY HH:mm:ss')}`,
            };
          }
        })
      );
    };
  }

  static maxDateAsyncValidator(
    maxDate: Date | string,
    comparingControlName: string = 'Current Date'
  ): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      const selectedDate = new Date(control.value);
      if (!maxDate) return of(null);
      // Convert maxDate to Date object if it's provided as a string
      const maxDateObj =
        typeof maxDate === 'string' && maxDate ? new Date(maxDate) : maxDate;

      return of(selectedDate).pipe(
        map((date: Date) => {
          if (!date || date <= maxDateObj) {
            return null; // Validation passes
          } else {
            //return { 'maxDate': { min: maxDateObj } }; // Validation fails
            return {
              maxDate: `Should be less than  ${comparingControlName} ${moment(
                maxDateObj
              ).format('DD-MM-YYYY HH:mm:ss')}`,
            };
          }
        })
      );
    };
  }

  static maxDateValidator(
    maxDate: Date | string,
    comparingControlName: string = 'Current Date'
  ): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = new Date(control.value);
      if (!maxDate) return null;
      // Convert maxDate to Date object if it's provided as a string
      const maxDateObj =
        typeof maxDate === 'string' && maxDate ? new Date(maxDate) : maxDate;

      if (!selectedDate || selectedDate <= maxDateObj) {
        return null; // Validation passes
      } else {
        return {
          maxDate: `Should be less than ${comparingControlName} ${moment(
            maxDateObj
          ).format('DD-MM-YYYY HH:mm:ss')}`,
        };
      }
    };
  }

  static shouldNotBeFutureDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = new Date(control.value);
      // if(this.currentDate) return null
      let maxDate = moment(new Date()).add('s', 5);
      console.log(maxDate);
      let comparingControlName = 'Current Date';
      // Convert maxDate to Date object if it's provided as a string
      const maxDateObj =
        typeof maxDate === 'string' && maxDate ? new Date(maxDate) : maxDate;

      if (!selectedDate || selectedDate <= maxDateObj) {
        return null; // Validation passes
      } else {
        return {
          maxDate: `Should be less than or equal to ${comparingControlName} ${moment(
            maxDateObj
          ).format('DD-MM-YYYY HH:mm:ss')}`,
        };
      }
    };
  }
}
