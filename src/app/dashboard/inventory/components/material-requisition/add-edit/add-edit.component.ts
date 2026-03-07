import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IAssetCategories } from '@dashboard/config-assets/models/asset-categories';
import { IWMaterial } from '@dashboard/planning-scheduling/work-order/models/material';
import { IDropdown, ILookupValue } from '@shared/models';
import { defaultControlOptions } from '@shared/utils/dialogs/defaultOptions';
import { HttpApi } from 'src/app/core/http/http-api';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class AddEditComponent implements OnInit {
  dateFormat = 'YYYY-MM-DDTHH:mm:ss';
  minDate!: Date;
  AffectedmaxDate: string = '';
  materialForm!: UntypedFormGroup;
  @Input() assetDropdownItems: IDropdown[] = [];
  dropMeasureUnit: ILookupValue[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['position', 'MaterialName', 'MaterialCode','EstQty', 'action'];
  isLoading = true;
  materialData: IWMaterial[] = [];
  isBtnMaterial = false;
  // ================= FORM =================
  materialRequisitionForm!: UntypedFormGroup;

  // ================= DROPDOWNS =================
  // @Input() assetDropdownItems: IDropdown[] = [];
  // dropMeasureUnit: ILookupValue[] = [];
  Priorities: ILookupValue[] = [];
  Status = HttpApi.workStatusData;
  Location = HttpApi.LocationData;
  ItemType = HttpApi.ItemTypeData;
  // Category = HttpApi.CategoriesData;
    assetCategories: IAssetCategories[] = [];
  // ================= DATE =================
  datePickerOptions: any = defaultControlOptions.dateTimePicekr;

  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  // ================= INITIALIZE FORM =================
  private initializeForm(): void {
    this.materialRequisitionForm = this.fb.group({
      BasicInputs: this.fb.group({
        RequestDept: ['', Validators.required],
        Status: ['', Validators.required],
        Priority: ['', Validators.required],
        FailureEffect: [''],
        RequiredDate: [''],
        requestedBy: [''],
        prepareBy: [''],
        PrepareDate: [''],
        reviewBy: [''],
        reviewDate: [''],
        approveBy: [''],
        approveDate: [''],
        RequestDescription: ['', [Validators.required, Validators.maxLength(1024)]]
      })
    });
  }

  // ================= TEXTAREA COUNTER =================
  lengthcheck(controlName: string) {
    return this.materialRequisitionForm
      ?.get('BasicInputs')
      ?.get(controlName)
      ?.value?.length;
  }

  get RequestDescription() {
    return this.materialRequisitionForm
      ?.get('BasicInputs')
      ?.get('RequestDescription');
  }

  // ================= ADD MATERIAL =================
  addMaterial(): void {
    const isSingleAsset = this.assetDropdownItems.length === 1;
    const assetId = isSingleAsset ? Number(this.assetDropdownItems[0].value) : 0;
    const assetNo = isSingleAsset ? this.assetDropdownItems[0].code : '';

    const materialItem: IWMaterial = {
      woId: 0,
      materialId: 0,
      materialName: '',
      materialCodeId: 0,
      unitOfMeasureId: 0,
      materialCode: '',
      unitOfMeasure: '',
      actQuantity: null,
      // reqQuantity: null,
      estQuantity: 0,
      type: '',
      assetId: assetId,
      assetNo: assetNo,
      purpose: 0
    };

    this.materialData.push(materialItem);
  }

  // ================= BACK =================
  backToList(): void {
    window.history.back();
  }
}
