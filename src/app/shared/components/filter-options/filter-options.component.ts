import { AfterContentInit, Component, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IFilterOptions } from '@shared/models/IfilterOptions';
import * as moment from 'moment';

@Component({
  selector: 'app-filter-options',
  templateUrl: './filter-options.component.html',
  styleUrls: ['./filter-options.component.scss']
})
export class FilterOptionsComponent  implements AfterContentInit, OnChanges {
  // @ContentChildren('filterControl') filterControls: QueryList<any>;
  @Input() filterOptions: IFilterOptions[] = [];
  @Input() showAdd: boolean = false;
  @Input() showExcelExport: boolean = false;

  @Input() isSubmitRequired: boolean = true
  @Output() filterApplied: EventEmitter<any> = new EventEmitter();
  @Output() reset: EventEmitter<any> = new EventEmitter();
  @Output() add: EventEmitter<any> = new EventEmitter();
  @Output() exportExcel: EventEmitter<any> = new EventEmitter();
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }
  public filterForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.filterForm = this.formBuilder.group({});
  }


  ngOnChanges(changes: SimpleChanges): void {
    //this.createForm();
    this.patchInitialValues();
  }

  addRecord(){
    this.add.emit();
  }

  exportData(){
    this.exportExcel.emit();
  }

  ngOnInit(): void {
    // this.filterOptions.forEach(option => {
    //   this.filterForm.addControl(option.name, this.formBuilder.control(''));
    // });
  }


  ngAfterContentInit(): void {
    console.log(this.filterOptions);
    this.createForm();
    this.patchInitialValues();
  }

  createForm(): void {
    if(JSON.stringify(this.filterForm.controls) !== '{}') return;
    const controlsConfig = <any>{};
    this.filterOptions.forEach(option => {
      if(!controlsConfig[option.name])
      controlsConfig[option.name] = new FormControl('');
    });
    this.filterForm = this.formBuilder.group(controlsConfig);
  }

  patchInitialValues(): void {
    if(!this.filterForm) return;

    this.filterOptions.forEach(option => {
      const control = this.filterForm.get(option.name);
      if (control) {
        control.patchValue(option.value || option.initialValue);
        option.disable? control.disable(): control.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.filterForm.valid) {
      this.filterApplied.emit(this.filterForm.value);
    }
  }

  setFormData(): void {
    this.patchInitialValues();
  }

  updateFilterOptionsd(){
    this.filterApplied.emit(this.filterForm.value);

  }

  clear(): void {
    this.reset.emit('');
  }

  triggerOnValueChange(event: any){
    if (this.filterForm.valid) {
      this.filterApplied.emit(this.filterForm.value);
    }
  }

  // ngAfterContentInit(): void {
  //   // Access the projected content after initialization
  //   console.log(this.filterControls);
  //   this.createForm();
  // }

  // createForm(): void {
  //   const controlsConfig = {};
  //   this.filterControls.forEach(control => {
  //     controlsConfig[control.name] = new FormControl('');
  //   });
  //   this.filterForm = this.formBuilder.group(controlsConfig);
  // }

  // onSubmit(): void {
  //   // Handle form submission
  //   console.log('Form submitted:', this.filterForm.value);
  // }

}
