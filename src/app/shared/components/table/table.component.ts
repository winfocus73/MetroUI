import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Column } from '../../models/column';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { every, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { AssetHistoryComponent } from '../asset-history/asset-history.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../change-pwd/change-pwd.component';
import { AssetLocationChangeComponent } from '../asset-location-change/asset-location-change.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent<T> implements OnInit, OnChanges {
  @Input() tableColumns: Array<Column> = [];
  @Input() groupedColumns: Array<string> = [];
  @Input() tableData: Array<T> = [];
  @Input() tableId!: string;

  @Input() actionDisplayName!: string;
  @Input() isCustomPagination!: string;
  @Input() totalRowsCount!: number;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() pageType!: string;
  @Input() containerClasses!: any;
  @Input() containerStyles!: any;
  @Input() isAllSelected: boolean = false;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 75, 100];
  @Input() hidePagination = false;
  @Input() showFilters: boolean = false; // Flag to control the display of filter inputs


  @Output() editData =  new EventEmitter<number>();
  @Output() viewData = new EventEmitter<{ id: number; data: any }>();

  @Output() showDownArrowClick =  new EventEmitter<number>();
  @Output() showUpArrowClick =  new EventEmitter<number>();
  @Output() selectedData =  new EventEmitter<any>();
  @Output() selectedRows =  new EventEmitter<any>();
  @Output() pageTypeNavigate =  new EventEmitter<any>();

  @Output() deleteData = new EventEmitter<number>();

  @Output() raisePopup =  new EventEmitter<any>();


  displayedColumns: Array<string> = [];
  dataSource: MatTableDataSource<T> = new MatTableDataSource();
  @ViewChild(MatPaginator, {read: true}) paginator!: MatPaginator;
  @Output() emitPagination =  new EventEmitter<any>();
  @Output() refreshTableData =  new EventEmitter<any>();
  totalData!: number;
  @ViewChild(MatSort) sort!: MatSort;
  isSubAsset = false;
  //displayedColumns: string[] = ['column1', 'column2', 'column3']; // Example columns
  filterColumns: string[] = []; // Use the same columns for filters
  filterValues: { [key: string]: string } = {}; // Store filter values for each column


  constructor(private router:Router, private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {

    if(this.isCustomPagination) {
       this.totalData = this.totalRowsCount;// Math.ceil(this.totalRowsCount / this.pageSize);
       this.pageIndex = this.pageIndex - 1;
       this.pageSize = this.pageSize;
       this.displayedColumns = this.tableColumns.map((c) => c.columnDef);
       this.dataSource = new MatTableDataSource(this.tableData);
       this.dataSource.data = this.tableData;
    } else {
      this.totalData =  this.tableData.length;
      this.displayedColumns = this.tableColumns.map((c) => c.columnDef);
      this.tableData.slice(this.pageSize * this.pageIndex, (this.pageSize * (this.pageIndex +1)));
      this.dataSource.data = this.tableData.slice(0, this.pageSize);
    }
    this.filterColumns = this.tableColumns.map((c) => c.columnDef);

  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['tableColumns']) {
  //     this.displayedColumns = this.tableColumns.map((c) => c.columnDef);
  //     this.filterColumns = this.displayedColumns;
  //   }
  //   if (changes['tableData']) {
  //     this.dataSource.data = this.tableData;
  //   }
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableColumns']) {
      this.displayedColumns = this.tableColumns.map((c) => c.columnDef);
      this.filterColumns = this.displayedColumns;
    }

    if (changes['tableData']) {
      this.dataSource.data = this.tableData;
    }

    if (changes['showFilters']) {
      if (!this.showFilters) {
        this.resetFiltersAndPaging();
      }
    }
  }

  resetFiltersAndPaging() {
    this.filterValues = {}; // Clear filter values
    this.dataSource.filter = ''; // Clear the filter on the data source
    this.pageIndex = 0; // Reset to the first page
    this.dataSource.data = this.tableData.slice(0, this.pageSize); // Reset the data source to the first page
    this.totalData = this.tableData.length; // Reset the total data count
  }

  // pageChanged(event: PageEvent) {
  //   this.pageIndex = event.pageIndex;
  //   this.pageSize = event.pageSize;
  //   this.applyFilters(); // Apply filters when the page changes
  // }

  initializeTable() {
    this.displayedColumns = this.tableColumns.map((c) => c.columnDef);
    this.dataSource.data = this.tableData;
  }

  ngAfterViewInit() {
     this.dataSource.paginator = this.paginator;
     this.dataSource.sort = this.sort;
    //this.paginator.page.pipe(tap() => this.loadData()).subscribe();

    // console.log('addding index fields')
    // if(this.tableData && this.tableData.length)
    // {
    //   this.tableData.forEach((v:any,i:number) => {
    //     v.no = i+1;
    //   })
    // }
  }

  editRecord(id: number) {
    this.editData.emit(id);
  }
// Add this to your TableComponent
viewRecord(rowData: any): void {
  console.log('ViewRecord called with:', rowData);
  
  // If rowData has an id property, it's the full object
  if (rowData && rowData.id) {
    this.viewData.emit({ 
      id: rowData.id, 
      data: rowData  // Pass the full object directly
    });
  } else {
    // Fallback: if only ID was passed
    const id = rowData;
    const fullObject = this.tableData.find(item => (item as any)['id'] === id);
    this.viewData.emit({ id: id, data: fullObject });
  }
}




  showChildData(data: string) {
   const asID  = parseInt(data.split(',')[0]);
    this.showDownArrowClick.emit(asID);
  }
  showParentData(data: string) {
    const asID  = parseInt(data.split(',')[0]);
     this.showUpArrowClick.emit(asID);
   }
  loadData() {

  }
  pageChanged(event: PageEvent) {

    if(this.isCustomPagination) {
      if(this.pageSize === event.pageSize) {
        this.pageIndex = event.pageIndex + 1;
      } else {
        this.pageIndex = 1;
      }
      this.pageSize = event.pageSize;
      const objPage = {pageIndex: this.pageIndex, pageSize: this.pageSize};
      this.emitPagination.emit(objPage)
    } else {
      if(this.pageSize === event.pageSize) {
        this.pageIndex = event.pageIndex;
      } else {
        this.pageIndex = 0;
      }
      //this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
      this.dataSource.data = this.tableData.slice(this.pageSize * this.pageIndex, (this.pageSize * (this.pageIndex + 1)));
      this.totalData = this.tableData.length;

      //this.pageIndex = event.pageIndex;
      // this.pageSize = event.pageSize;
      this.applyFilters(); // Apply filters when the page changes

    }

  }
  LinkClick(id:any){
    this.pageTypeNavigate.emit(id);
    // if(this.pageType === 'SR') {
    //   this.router.navigate(['/dashboard/s-r/service-requests'], { state: id });
    // } else if(this.pageType === 'WO') {
    //   this.router.navigate(['dashboard/p-s/work-orders'], { state: id });
    // }else if(this.pageType === 'PTW') {
    //   this.router.navigate(['dashboard/p-s/permit-to-work'], { state: id });
    // }

  }

  getAsset(data: string) {
    this.isSubAsset = parseInt(data.split(',')[1]) === 0 ? false : true;
   // console.log(this.isSubAsset)
    return this.isSubAsset;
  }

  deleteRecord(id: number): void {
  this.deleteData.emit(id);
}

  selectRow(e: any, data: any, rowIndex:any) {
    data.checked =e?.checked;
    //this.tableData[rowIndex] = data;
    this.selectedData.emit(data);
    // if(!e?.checked)
    // this.isAllSelected = false;
    // let selectedRows = this.tableData.filter((c:any) => (c.checked));
    // this.selectedRows.emit(selectedRows);
    // this.dataSource.data = [...this.tableData];  // Trigger change detection
    // this.cdr.detectChanges();  // Manually trigger change detection
  }

  selectAllRow(e: any){
    this.tableData.forEach((c:any, index:number) => { (<any>this.tableData[index]).checked = e?.checked });
    this.selectedRows.emit(this.tableData);
    this.dataSource.data = [...this.tableData];  // Trigger change detection
    this.cdr.detectChanges();  // Manually trigger change detection
  }

  historyPopup(id: number) {
    const data: any = this.tableData;
    const selectedRowData = data.find((x: { id: any; })=>x.id as any==id);
    if(this.tableId == 'workflowList'){
      this.raisePopup.emit(selectedRowData);
    } else {
    this.dialog.open(AssetHistoryComponent, {
      width: '90% !important',disableClose: true,
      data: {id: id, rowData: selectedRowData}
    });
  }
  }

  pwdChange(id: number) {
    const data: any = this.tableData;
    const selectedRowData = data.find((x: { id: any; })=>x.id as any==id);
    this.dialog.open(ChangePasswordComponent, {
      width: '100% !important',disableClose: true,
      data: {id: id, rowData: selectedRowData, userForm: true}
    });
  }

  getAssetChange(id: number) {
    const data: any = this.tableData;
    const selectedRowData = data.find((x: { id: any; })=>x.id as any==id);
    return selectedRowData.locationChange == 1 ? true : false;
  }

  assetLocationChange(id: number) {
    const data: any = this.tableData;
    const selectedRowData = data.find((x: { id: any; })=>x.id as any==id);
    this.dialog.open(AssetLocationChangeComponent, {
      width: '100% !important',disableClose: true,
      data: {id: id, rowData: selectedRowData}
    }).afterClosed().subscribe(res=>{
      this.refreshTableData.emit(true);
    });
  }
  refreshGrid(){
    if(this.isCustomPagination) {
      this.totalData = this.totalRowsCount;// Math.ceil(this.totalRowsCount / this.pageSize);
      this.pageIndex = this.pageIndex - 1;
      this.pageSize = this.pageSize;
      this.displayedColumns = this.tableColumns.map((c) => c.columnDef);
      this.dataSource = new MatTableDataSource(this.tableData);
      this.dataSource.data = this.tableData;
   } else {
     this.totalData =  this.tableData.length;
     this.displayedColumns = this.tableColumns.filter(c => !c.isHidden).map((c) => c.columnDef);
     this.tableData.slice(this.pageSize * this.pageIndex, (this.pageSize * (this.pageIndex +1)));
     this.dataSource.data = [...this.tableData.slice(0, this.pageSize)];
   }

  // this.dataSource.data = [...this.tableData];  // Trigger change detection
   this.cdr.detectChanges();  // Manually trigger change detection
   // Trigger change detection
   //this.cdr.detectChanges();  // Manually trigger change detection
  }


  // Other properties and methods...

  // Other properties and methods...

  applyFilter(event: Event, columnDef: string) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase(); // Cast to HTMLInputElement
    this.filterValues[columnDef] = filterValue; // Store the filter value
    this.pageIndex = 0; // Reset to the first page
    this.applyFilters();
  }

  applyFilters() {
    let filteredData = this.tableData;

    // Apply each filter value to the data
    for (const columnDef in this.filterValues) {
      const filterValue = this.filterValues[columnDef];
      filteredData = filteredData.filter((data: any) => {
        const cellValue = data[columnDef] ? data[columnDef].toString().toLowerCase() : '';
        return cellValue.includes(filterValue);
      });
    }

    this.totalData = filteredData.length;
    this.dataSource.data = filteredData.slice(this.pageSize * this.pageIndex, this.pageSize * (this.pageIndex + 1));
  }

}
