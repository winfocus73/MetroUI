import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ILoginData, ILoginResponse } from '@auth/models/login.response';
import { Column } from '@shared/models/column';
import { ICommonRequest, IRequest } from '@shared/models/common-request';
import { IDropdown } from '@shared/models/dropdown';
import { Constants } from 'src/app/core/http/constant';
import * as moment from 'moment';
import { CommonService } from '@shared/services/common.service';
import { IFormCheck } from '@shared/models/role-check';
import { IStation } from '@shared/models/station';
import { LoadingService } from '@shared/services/spinner.service';
import { IZone } from '@shared/models/zone';
import { ICorridor } from '@dashboard/planning-scheduling/permit-to-work/models/corridor';
import { FormControl, FormGroup } from '@angular/forms';
import { PermittoWorkService } from '@dashboard/planning-scheduling/permit-to-work/services/permit-to-work.service';
import { MatDialog } from '@angular/material/dialog';

import {
  ScreenLabelService,
  IScreenLabelResponse,
} from '@shared/services/screen-label.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Import interfaces for Material Issue
// import {
//   IMaterialIssue,
//   IMaterialIssueReg,
//   IMaterialIssueSearchList,
//   IDepartment,
//   IMaterialIssueStatus,
//   IIssueNumberDropdown,
// } from '@dashboard/inventory/models/material-issue';
import { DynamicViewDialogComponent } from '@shared/components/dynamic-view-dialog/dynamic-view-dialog.component';

import {
  IMaterialIssueReg,
  IMaterialIssue,
  IDepartment,
  IMaterialIssueStatus,
  IIssueNumberDropdown,
  IMaterialIssueSearchList,
} from '@dashboard/inventory/models/material-issue';
import { InventoryService } from '@dashboard/inventory/services/inventory.service';

@Component({
  selector: 'nxasm-inventory-material-issue',
  templateUrl: './material-issue.component.html',
  styleUrls: ['./material-issue.component.scss'],
})
export class MaterialIssueComponent implements OnInit, OnDestroy {
  @Input() materialIssueId!: number;

  // Language and labels
  selectedLanguage: string = 'en';
  languages = Constants.LANGUAGES;
  labels: { [key: string]: string } = {};
  private destroy$ = new Subject<void>();

  materialIssueData: IMaterialIssueReg[] = [];
  materialIssues: IMaterialIssue[] = [];
  departmentNames: IDepartment[] = [];
  rollName!: string;
  isAddEdit = false;
  departments: IDepartment[] = [];
  materialIssueStatuses: IMaterialIssueStatus[] = [];
  issueNumbers: IIssueNumberDropdown[] = [];

  materialIssueSearch: IMaterialIssueSearchList =
    {} as IMaterialIssueSearchList;
  dropLabel = 'Department';
  UserInfo: ILoginResponse = {} as ILoginResponse;
  userRoleId!: string;
  items: IDropdown[] = [];
  isNotFound = false;
  isEditbtn = false;
  showFilter = false;

  objSearch: {
    issueNum: string | null;
    departmentId: string | null;
    statusId: string;
    FromDate: string;
    ToDate: string;
    PageNo: number;
    PageSize: number;
    TotalRecords: number;
  } = {
    issueNum: null,
    departmentId: null,
    statusId: '',
    FromDate: '',
    ToDate: '',
    PageNo: 1,
    PageSize: 10,
    TotalRecords: 0,
  };

  stations: IStation[] = [];
  objForm: IFormCheck = {} as IFormCheck;
  LoginUserInfo: ILoginData = {} as ILoginData;

  zones: IZone[] = [];
  corridors: ICorridor[] = [];

  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment().subtract(1, 'month').startOf('month'),
      moment().subtract(1, 'month').endOf('month'),
    ],
  };

  materialIssueForm = new FormGroup({
    // timeStamp: new FormGroup({
    //   startDate: new FormControl(),
    //   endDate: new FormControl(),
    // }),
  });

  constructor(
    private inventoryService: InventoryService,
    private permitService: PermittoWorkService,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private _loading: LoadingService,
    public dialog: MatDialog,
    private screenLabelService: ScreenLabelService,
  ) {}

  ngOnInit(): void {
    this.loadScreenLabels();
    this.getFormPriviliges();
    this.getDepartmentsList();
    this.getMaterialIssueNumbers();

    this.getMaterialIssueStatus();
    // Add any other initialization methods as needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  tableColumns: Array<Column> = [
    {
      columnDef: 'index',
      header: 'S.No.',
      cell: (element: Record<string, any>) => '',
    },
    {
      columnDef: 'issueNumber',
      header: 'Issue Num',
      isEditLink: true,
      cell: (element: Record<string, any>) => `${element['issueNumber']}`,
    },
    {
      columnDef: 'departmentName',
      header: 'To Department',
      cell: (element: Record<string, any>) =>
        `${element['departmentName'] || element['sectionName']}`, // Fallback to sectionName
    },
    {
      columnDef: 'issuedDate',
      header: 'Issued Date',
      isDateOnly: true,
      cell: (element: Record<string, any>) =>
        element['issuedDate'] || element['issueDate']
          ? moment(
              element['issuedDate'] || element['issueDate'],
              'DD-MM-YYYY',
            ).format('YYYY-MM-DD')
          : '',
    },
    {
      columnDef: 'statusName',
      header: 'Status',
      isStatusPipe: true,
      cell: (element: Record<string, any>) => `${element['statusName']}`,
    },
    {
      columnDef: 'locationName',
      header: 'Location',
      cell: (element: Record<string, any>) => `${element['locationName']}`,
    },
    {
      columnDef: 'actions',
      header: 'Actions',
      cell: (element: Record<string, number>) => `${element['issueId']}`,
      isEditbtn: true,
      isViewbtn: true,
      isDeletebtn: true,
    },
  ];

  updateTableHeaders(): void {
    this.tableColumns.forEach((col) => {
      switch (col.columnDef) {
        case 'index':
          col.header = this.getLabel('sNo', 'S.No.');
          break;
        case 'issueNumber':
          col.header = this.getLabel('issueNumber', 'Issue Num');
          break;
        case 'departmentName':
          col.header = this.getLabel('department', 'To Department');
          break;
        case 'issuedDate':
          col.header = this.getLabel('issuedDate', 'Issued Date');
          break;
        case 'statusName':
          col.header = this.getLabel('status', 'Status');
          break;
        case 'locationName':
          col.header = this.getLabel('location', 'Location');
          break;
        case 'actions':
          col.header = this.getLabel('actions', 'Actions');
          break;
      }
    });

    // Force change detection
    this.tableColumns = [...this.tableColumns];
  }

  loadScreenLabels(): void {
    this._loading._loading.next(true);

    this.screenLabelService
      .getScreenLabels('MATERIAL_ISSUE', this.selectedLanguage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: IScreenLabelResponse) => {
          this._loading._loading.next(false);

          if (response.success && response.data && response.data.length > 0) {
            // Convert array to key-value object for easy access
            this.labels = {};
            response.data.forEach(
              (item: { lbl_name: string | number; lbl_value: string }) => {
                this.labels[item.lbl_name] = item.lbl_value;
              },
            );

            this.updateTableHeaders();
          }
        },
        error: () => {
          this._loading._loading.next(false);
          this.getMaterialIssueList();
        },
      });
  }

  onLanguageChange(lang: string): void {
    this.selectedLanguage = lang;
    this.loadScreenLabels();
  }

  initializeTableColumns(): void {
    this.tableColumns = [
      {
        columnDef: 'index',
        header: this.getLabel('sNo', 'S.No.'),
        cell: (element: Record<string, any>) => '',
      },
      {
        columnDef: 'issueNumber',
        header: this.getLabel('issueNumber', 'Issue Num'),
        isEditLink: true,
        cell: (element: Record<string, any>) => `${element['issueNumber']}`,
      },
      {
        columnDef: 'departmentName',
        header: this.getLabel('department', 'To Department'),
        cell: (element: Record<string, any>) => `${element['departmentName']}`,
      },
      {
        columnDef: 'issuedDate',
        header: this.getLabel('issuedDate', 'Issued Date'),
        isDateOnly: true,
        cell: (element: Record<string, any>) =>
          element['issuedDate']
            ? moment(element['issuedDate'], 'DD-MM-YYYY').format('YYYY-MM-DD')
            : '',
      },
      {
        columnDef: 'statusName',
        header: this.getLabel('status', 'Status'),
        isStatusPipe: true,
        cell: (element: Record<string, any>) => `${element['statusName']}`,
      },
      {
        columnDef: 'locationName',
        header: this.getLabel('location', 'Location'),
        cell: (element: Record<string, any>) => `${element['locationName']}`,
      },
      {
        columnDef: 'actions',
        header: this.getLabel('actions', 'Actions'),
        cell: (element: Record<string, number>) => `${element['issueId']}`,
        isEditbtn: true,
        isViewbtn: true,
        isDeletebtn: true,
      },
    ];
  }

  getLabel(key: string, fallback: string): string {
    return this.labels[key] || fallback;
  }

  pageLoad() {
    if (
      this.commonService.filterObjects[
        Constants.MATERIAL_ISSUE_LIST_FILTER_OBJECT
      ]
    ) {
      const savedFilter =
        this.commonService.filterObjects[
          Constants.MATERIAL_ISSUE_LIST_FILTER_OBJECT
        ];
      this.objSearch = { ...this.objSearch, ...savedFilter };
    }
    this.LoginUserInfo = this.commonService.loginStorageData;
    this.getZones();
    this.getCorridors();
    this.getStations();

    this.userRoleId = this.LoginUserInfo?.userRoleId;
  }

  getCorridors() {
    this.commonService.getCorridors().subscribe((res: any) => {
      if (res && res.length) this.corridors = res;
    });
  }

  getZones() {
    this.commonService.zones({} as ICommonRequest).subscribe((res: any) => {
      if (res && res.length) this.zones = res;
    });
  }

  getFormPriviliges() {
    this.pageLoad();
    this.isEditbtn = true;
  }

  viewMaterialIssue(rowData: any): void {
    let issueId = null;

    if (rowData?.id && typeof rowData.id === 'object') {
      issueId = rowData.id.issueId || rowData.id.id;
    }

    this._loading._loading.next(true);

    const request = {
      Params: [{ Key: 'IssueId', Value: issueId.toString() }],
    };

    this.inventoryService.getMaterialIssueDetails(request).subscribe({
      next: (response: any) => {
        this._loading._loading.next(false);
        const dialogRef = this.dialog.open(DynamicViewDialogComponent, {
          width: '90vw',
          maxWidth: '1200px',
          data: {
            title: this.getLabel('materialIssue', 'Material Issue'),
            data: response,
          },
        });
      },
    });
  }

  getMaterialIssueStatus() {
    this.inventoryService.getMrStatus().subscribe((res: any) => {
      this.materialIssueStatuses = res;
    });
  }

  getMaterialIssueNumbers() {
    this.inventoryService.getMINumbers().subscribe({
      next: (res: any) => {
        // Map the response to IIssueNumberDropdown format
        this.issueNumbers = res.map((item: any) => ({
          name:
            item.name || item.poNumber || item.issueNumber || item.toString(),
          id: item.id,
          issueNumber: item.issueNumber || item.name || item.poNumber,
        }));
        console.log('Issue numbers loaded:', this.issueNumbers);
      },
      error: (error) => {
        console.error('Error loading issue numbers:', error);
      },
    });
  }

  getDepartmentsList() {
    this.inventoryService.getSectionList().subscribe((res: any) => {
      this.departmentNames = res;
    });
  }

  getStations() {
    const request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [{ key: 'Name', value: '' }];
    request.Params = reqdata;
    this.commonService.getStations(request).subscribe((res) => {
      this.stations = res;
    });
  }

  getMaterialIssueList() {
    this._loading._loading.next(true);
    this.materialIssueData = [];
    this.isNotFound = false;

    const request: ICommonRequest = {} as ICommonRequest;
    const reqdata: IRequest[] = [
      {
        key: 'IssueNum',
        value: this.objSearch.issueNum ? String(this.objSearch.issueNum) : '',
      },
      {
        key: 'DepartmentId',
        value: this.objSearch.departmentId
          ? String(this.objSearch.departmentId)
          : '',
      },
      {
        key: 'StatusId',
        value: this.objSearch.statusId ? String(this.objSearch.statusId) : '',
      },
      {
        key: 'DateFrom',
        value: this.objSearch.FromDate
          ? moment(this.objSearch.FromDate).format('YYYY-MM-DD')
          : '',
      },
      {
        key: 'DateTo',
        value: this.objSearch.ToDate
          ? moment(this.objSearch.ToDate).format('YYYY-MM-DD')
          : '',
      },
      { key: 'PageNo', value: String(this.objSearch.PageNo) },
      { key: 'PageSize', value: String(this.objSearch.PageSize) },
      { key: 'Pagenation', value: '1' },
    ];

    request.Params = reqdata;
    this.commonService.setFilterObject(
      Constants.MATERIAL_ISSUE_LIST_FILTER_OBJECT,
      this.objSearch,
    );

    this.inventoryService.getMaterialIssueSearchList(request).subscribe({
      next: (res: any) => {
        this._loading._loading.next(false);
        if (res) {
          this.materialIssueSearch = res;
          this.objSearch.TotalRecords =
            this.materialIssueSearch.totalRows > 0
              ? this.materialIssueSearch.totalRows
              : this.objSearch.TotalRecords;

          if (
            this.materialIssueSearch.results &&
            this.materialIssueSearch.results.length > 0
          ) {
            this.materialIssueData = this.materialIssueSearch
              .results as unknown as IMaterialIssueReg[];
            this.isNotFound = false;
          } else {
            this.materialIssueData = [];
            this.isNotFound = true;
          }
        } else {
          this.materialIssueData = [];
          this.isNotFound = true;
        }
      },
    });
  }

  search() {
    if (this.dateValidation()) {
      this.objSearch.PageNo = 1;
      this.getMaterialIssueList();
    } else {
      this.snackBar.open(
        Constants.SearchDateError ||
          'To Date must be greater than or equal to From Date',
        'Close',
        {
          duration: 4000,
          panelClass: 'error',
          horizontalPosition: 'end',
          verticalPosition: 'top',
        },
      );
    }
  }

  reset() {
    this.objSearch = {
      issueNum: null,
      departmentId: '',
      statusId: '',
      FromDate: moment(new Date().setDate(new Date().getDate() - 6)).format(
        'YYYY-MM-DD',
      ),
      ToDate: moment(new Date()).format('YYYY-MM-DD'),
      PageNo: 1,
      PageSize: 10,
      TotalRecords: 0,
    };
    this.commonService.setFilterObject(
      Constants.MATERIAL_ISSUE_LIST_FILTER_OBJECT,
      this.objSearch,
    );
    this.getMaterialIssueList();
  }

  datesUpdated(range: any): void {
    if (range?.startDate && range?.endDate) {
      // range.startDate is already moment object
      this.objSearch.FromDate = range.startDate.format('YYYY-MM-DD');
      this.objSearch.ToDate = range.endDate.format('YYYY-MM-DD');

      console.log(
        'User Selected Dates:',
        this.objSearch.FromDate,
        this.objSearch.ToDate,
      );

      this.search();
    }
  }

  export() {
    if (this.dateValidation()) {
      const request: ICommonRequest = {} as ICommonRequest;
      const reqdata: IRequest[] = [
        {
          key: 'IssueNum',
          value: this.objSearch.issueNum ? String(this.objSearch.issueNum) : '',
        },
        {
          key: 'DepartmentId',
          value: this.objSearch.departmentId
            ? String(this.objSearch.departmentId)
            : '',
        },
        {
          key: 'StatusId',
          value: this.objSearch.statusId ? String(this.objSearch.statusId) : '',
        },
        {
          key: 'DateFrom',
          value: this.objSearch.FromDate ? String(this.objSearch.FromDate) : '',
        },
        {
          key: 'DateTo',
          value: this.objSearch.ToDate ? String(this.objSearch.ToDate) : '',
        },
        { key: 'PageNo', value: '1' },
        { key: 'PageSize', value: '10000' },
        { key: 'Pagenation', value: '0' },
      ];

      request.Params = reqdata;
      this.inventoryService.getMaterialIssueSearchList(request).subscribe({
        next: (res: any) => {
          if (res && res.results) {
            const materialIssue = res.results;
            const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(materialIssue);
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            XLSX.writeFile(
              wb,
              'Material_Issue_' + moment().format('DD-MM-YYYY HH:mm') + '.xlsx',
            );
          }
        },
      });
    }
  }

  add(data: boolean) {
    this.isAddEdit = data;
    this.materialIssueId = 0;
  }

  editMaterialIssueId(issueId: any) {
    const materialIssue = this.materialIssueData.find(
      (x) => x.issueId == issueId,
    );
    if (materialIssue) {
      this.materialIssueId = materialIssue.issueId;
    } else {
      this.materialIssueId = 0;
    }

    this.isAddEdit = true;
  }

  addEditMessage(status: number) {
    if (status > 0) {
      this.isAddEdit = false;
      this.getMaterialIssueList();
    }
  }

  deleteMaterialIssue(id: any): void {
    if (
      confirm(
        this.getLabel(
          'confirmDelete',
          'Are you sure you want to delete this material issue?',
        ),
      )
    ) {
      this.snackBar.open(
        this.getLabel('deleteSuccess', 'Material Issue deleted successfully'),
        'Close',
        { duration: 2000 },
      );
      this.getMaterialIssueList();
    }
  }

  pageChanged(obj: any) {
    this.objSearch.PageSize = obj.pageSize;
    this.objSearch.PageNo = obj.pageIndex;
    this.getMaterialIssueList();
  }

  refreshTableData(e: any) {
    this.getMaterialIssueList();
  }

  dateValidation(): boolean {
    if (!this.objSearch.FromDate || !this.objSearch.ToDate) return true;

    const to = moment(
      moment(this.objSearch.ToDate).format('YYYY-MM-DD'),
    ).isSameOrAfter(moment(this.objSearch.FromDate).format('YYYY-MM-DD'));
    return to;
  }
}
