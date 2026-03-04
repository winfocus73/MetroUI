import { Directive, HostListener } from '@angular/core';
import { NgForm, FormGroup, FormControl } from '@angular/forms';

@Directive({
  selector: 'form[markAllControlsAsTouchedOnSubmit]'
})
export class MarkAllControlsTouchedOnSubmitDirective {

  // constructor(private ngForm?: NgForm) { }

  @HostListener('ngSubmit', ['$event'])
  onSubmit(form:NgForm) {
    if(form)
    this.markAllControlsAsTouched(form);
  }

  private markAllControlsAsTouched(formGroup: NgForm | FormGroup | FormControl) {
    if (formGroup instanceof FormGroup) {
      Object.keys(formGroup.controls).forEach(controlName => {
        const control = formGroup.controls[controlName];
        control.markAsTouched();
        if (control instanceof FormGroup || control instanceof FormControl) {
          this.markAllControlsAsTouched(control);
        }
      });
    } else if (formGroup instanceof FormControl) {
      formGroup.markAsTouched();
    }
  }
}
