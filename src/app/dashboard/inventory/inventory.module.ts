import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { assetRoutes } from '@dashboard/asset-registry/asset-registry-rounting.module';
import { SharedModule } from '@shared/shared.module';
import { MaterialRequisitionComponent } from './components/material-requisition/material-requisition.component';
import { AddEditComponent } from './components/material-requisition/add-edit/add-edit.component';
import { PurchaseOrderComponent } from './components/purchase-order/purchase-order.component';
import { PurchaseOrderAddEditComponent } from './components/purchase-order/add-edit/add-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { inventoryRoutes } from './inventory-rounting.module';
import { CashPurchaseComponent } from './components/cash-purchase/cash-purchase.component';
import { AddEditCashPurchaseComponent } from './components/cash-purchase/add-edit/add-edit.component';
import { MaterialIssueComponent } from './components/material-issue/material-issue.component';
import { AddEditMaterialIssueComponent } from './components/material-issue/add-edit/add-edit.component';

@NgModule({
  declarations: [
    MaterialRequisitionComponent,
    AddEditComponent,
    PurchaseOrderComponent,
    PurchaseOrderAddEditComponent,
    CashPurchaseComponent,
    MaterialIssueComponent,
    AddEditMaterialIssueComponent,
    AddEditCashPurchaseComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxDaterangepickerMd.forRoot(),
    RouterModule.forChild(inventoryRoutes),
  ],
  providers: [],
})
export class InventoryModule {}
