import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Column } from '../../models/column';
import { MatPaginator } from '@angular/material/paginator';
import { IGetSearchRequest } from '../../models/request';
import { CommonService } from '@shared/services/common.service';
import { ILoginData } from '@auth/models/login.response';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnChanges {
  @Input() unitDropdown = false;
  @Input() searchTextBox = false;
  @Input() dropdownItems!: any;
  @Input() dropDownlabelName!: string;
  @Input() textBoxName = 'Name';
  @Input() drodownId: string ='';
  @Input() textBoxValue: string = '';

  unitAccessScopes!: string;
  name: string|null = null;
  value!: string;
  loginData: ILoginData = {} as ILoginData;
  request: IGetSearchRequest = {} as IGetSearchRequest;

  @Output() objSearch = new EventEmitter();
  constructor(private commonService: CommonService) {}

  ngOnChanges(changes: SimpleChanges): void {    
    // added this code to set value from parent (back to list fu..)
    if(this.textBoxValue){
      this.name = this.textBoxValue?this.textBoxValue: '';
    }
    //throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loginData = this.commonService.loginStorageData;
     // this.drodownId = this.loginData.loginData.unitAccessScopes === '0' ? '': this.drodownId;
      this.value = this.drodownId;      
    }, 500);

  }
  

  
  search() {
    this.request = {
        SearchByName: this.name ? this.name : '',
        SearchByValue: this.value ? this.value.toString() : ''
    }
    this.objSearch.emit(this.request)
  }
}
