import { Component, ContentChild, OnInit } from '@angular/core';
import { ShowErrorDirective } from '@shared/directives/show-error.directive';
import { ErrorService } from '@shared/services/error.service';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent implements OnInit {
  @ContentChild(ShowErrorDirective, { static: true })
  errorDirective!: ShowErrorDirective;

  constructor(private errorService: ErrorService) {}

  get errorMessage(): string | null {
    const errors = Object.entries(
      this.errorDirective?.ngControl?.control?.errors || {}
    );

    if (
      !this.errorDirective?.ngControl?.dirty &&
      !this.errorDirective?.ngControl?.touched
    )
      return '';
    if (!errors.length) {
      return null;
    }
    // console.log('errors:::',errors)
    const passedControlName = this.errorDirective?.controlName;
    const formControlName = passedControlName ?? 'This field';
    return this.errorService.getErrorValidationMessage(formControlName, errors);
  }

  ngOnInit() {
    if (!this.errorDirective) {
      throw new Error(
        'Without showError directive this is a useless component!'
      );
    }
  }
}
