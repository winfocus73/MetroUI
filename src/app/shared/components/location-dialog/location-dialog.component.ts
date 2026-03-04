import { Component, OnInit } from '@angular/core';
import { Column } from 'src/app/shared/models/column';
import { IGetSearchRequest } from 'src/app/shared/models/request';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICommonRequest, ILookupValue, IRequest } from '@shared/models';
import { IGetLocationResponse } from '@dashboard/configuration-setup/models/location/add-edit-response';
import { ILocation, ILocationSearchList } from '@dashboard/configuration-setup/models/location/location';
import { LocationService } from '@dashboard/configuration-setup/services/location.service';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonService } from '@shared/services/common.service';
import { PermittoWorkService } from '@dashboard/planning-scheduling/permit-to-work/services/permit-to-work.service';
import { IZone } from '@shared/models/zone';
import { ICorridor } from '@dashboard/planning-scheduling/permit-to-work/models/corridor';
import { LoadingService } from '@shared/services/spinner.service';

@Component({
  selector: 'nxasm-config-setup-location-dialog',
  templateUrl: './location-dialog.component.html',
  styleUrls: ['./location-dialog.component.scss'],
})
export class LocationsDialogComponent implements OnInit {
  locationRequest!: IGetSearchRequest;
  locationsResponse!: IGetLocationResponse;
  locations: ILocation[] = [];
  locationSearch: ILocationSearchList = {} as ILocationSearchList;
  locationTypes: ILookupValue[] = [];
  zones: IZone[] = [];
  corridors: ICorridor[] = [];
  name!: string;
  pageNo = 1;
  pageSize = 10;
  isNotFound = false;
  totalRecords!: number;

  selectedLocation: ILocation = {} as ILocation;
  constructor(
    private locationService: LocationService,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private permittoWorkService: PermittoWorkService,
    private _loading: LoadingService,
    private dialog: MatDialogRef<LocationsDialogComponent>
  ) {}
  objSearch = {
    Name: '',
    CorridorId: '',
    ZoneId: '',
    TypeId: '',
    PageNo: 1,
    PageSize: 10,
    TotalRecords: 0,
    Code: '',
  };

  tableColumns: Array<Column> = [
    {
      columnDef: 'select',
      header: 'Select',
      cell: (element: Record<string, any>) => ``,
    },
    {
      columnDef: 'index',
      header: 'No',
      cell: (element: Record<string, any>) => '',
    },
    {
      columnDef: 'locationCode',
      header: 'Location Code',
      cell: (element: Record<string, any>) => `${element['locationCode']}`,
    },
    {
      columnDef: 'name',
      header: 'Location Name',
      cell: (element: Record<string, any>) => `${element['locationName']}`,
    },

    {
      columnDef: 'locationKind',
      header: 'Location Kind',
      cell: (element: Record<string, any>) => `${element['locationKind']}`,
    },

    {
      columnDef: 'parentLocationName',
      header: 'Parent Location Name',
      cell: (element: Record<string, any>) =>
        `${element['parentLocationName']}`,
    },
    {
      columnDef: 'parentLocationCode',
      header: 'Parent Location Code',
      cell: (element: Record<string, any>) =>
        `${element['parentLocationCode']}`,
    },
    {
      columnDef: 'corridorName',
      header: 'Corridor Name',
      cell: (element: Record<string, any>) => `${element['corridorName']}`,
    },
    {
      columnDef: 'stageName',
      header: 'Stage Name',
      cell: (element: Record<string, any>) => `${element['stageName']}`,
    },
    {
      columnDef: 'typeName',
      header: 'Type Name',
      cell: (element: Record<string, any>) => `${element['typeName']}`,
    },
  ];
  ngOnInit(): void {
    this.getZones();
    this.getCorridors();
    this.getLocationTypess();
    this.getLocationsData();
  }

  getLocationTypess() {
    this.locationService
      .getLocationsTypes({} as ICommonRequest)
      .subscribe((res: any) => {
        if (res && res.length) this.locationTypes = res;
      });
  }

  getCorridors() {
    this.permittoWorkService.getCorridors().subscribe((res: any) => {
      if (res && res.length) this.corridors = res;
    });
  }

  getZones() {
    this.commonService.zones({} as ICommonRequest).subscribe((res: any) => {
      if (res && res.length) this.zones = res;
    });
  }

  getLocationsData() {
    this._loading._loading.next(true);
    try {
      this.locations = [];
      this.isNotFound = false;
      let request: ICommonRequest = {} as ICommonRequest;
      this.locations = [];
      const reqdata: IRequest[] = [
        { key: 'Name', value: this.objSearch.Name ? this.objSearch.Name : '' },
        {
          key: 'Corridor',
          value: this.objSearch.CorridorId
            ? this.objSearch.CorridorId.toString()
            : '0',
        },
        {
          key: 'Stage',
          value: this.objSearch.ZoneId ? this.objSearch.ZoneId.toString() : '0',
        },
        {
          key: 'Type',
          value: this.objSearch.TypeId ? this.objSearch.TypeId.toString() : '0',
        },
        {
          key: 'PageNo',
          value: this.objSearch.PageNo ? this.objSearch.PageNo.toString() : '1',
        },
        {
          key: 'PageSize',
          value: this.objSearch.PageSize
            ? this.objSearch.PageSize.toString()
            : '10',
        },
        {
          key: 'Code',
          value: this.objSearch.Code ? this.objSearch.Code.toString() : '',
        },
      ];
      request.Params = reqdata;
      this.locationService.getLocationsSearch(request).subscribe((res) => {
        if (res) {
          this.locationSearch = res;
          //this.totalRecords = this.locationSearch.totalRows;
          this.totalRecords =
            this.locationSearch.totalRows > 0
              ? this.locationSearch.totalRows
              : this.totalRecords;
          if (this.locationSearch.results) {
            this.locations = JSON.parse(this.locationSearch.results.toString());
          } else {
            this.locations = [];
            this.isNotFound = true;
          }
        } else {
          this.isNotFound = true;
          this.locations = [];
        }
        this._loading._loading.next(false);
      });
    } catch (error) {
      this._loading._loading.next(false);
    }
  }

  search() {
    //this.name = data.SearchByName;
    this.objSearch.PageNo = 1;
    this.getLocationsData();
  }

  pageChanged(obj: any) {
    this.objSearch.PageNo = obj.pageIndex;
    this.objSearch.PageSize = obj.pageSize;
    this.getLocationsData();
  }

  reset() {
    this.objSearch = {
      Name: '',
      CorridorId: '',
      ZoneId: '',
      TypeId: '',
      PageNo: 1,
      PageSize: 10,
      TotalRecords: 0,
      Code: '',
    };
    this.getLocationsData();
  }

  close() {
    this.dialog.close();
  }

  select() {
    this.dialog.close({ data: this.selectedLocation });
  }

  selectedData(data: ILocation) {
    this.selectedLocation = data;
  }
}
