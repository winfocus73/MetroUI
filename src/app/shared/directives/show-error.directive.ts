import { Directive, Input, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
@Directive({
  selector: 'input[showError], mat-radio-group[showError], textarea[showError], select[showError], ng-select[showError], nxams-mat-datetime-pic-wrap[showError]',
})
export class ShowErrorDirective {
  @Input() controlName?: string;
  constructor(@Optional() @Self() public ngControl: NgControl) {}
}
