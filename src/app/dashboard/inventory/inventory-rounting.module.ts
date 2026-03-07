import { Route } from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { NotFoundComponent } from 'src/app/core/layouts/not-found/not-found.component';
import { MaterialRequisitionComponent } from './components/material-requisition/material-requisition.component';
import { AddEditComponent } from './components/material-requisition/add-edit/add-edit.component';
import { PurchaseOrderComponent } from './components/purchase-order/purchase-order.component';
import { PurchaseOrderAddEditComponent } from './components/purchase-order/add-edit/add-edit.component';
import { CashPurchaseComponent } from './components/cash-purchase/cash-purchase.component';
import { MaterialIssueComponent } from './components/material-issue/material-issue.component';

export const inventoryRoutes: Route[] = [
  {
    path: '',
    component: InventoryComponent,
  },
  {
    path: 'material-requisition',
    component: MaterialRequisitionComponent,
    data: { breadcrumb: 'Material Requisition' },
  },
  {
    path: 'material-requisition/new',
    component: AddEditComponent,
    data: { breadcrumb: 'Material Requisition New' },
  },
  {
    path: 'purchase-order',
    component: PurchaseOrderComponent,
    data: { breadcrumb: 'Purchase Order' },
  },
  {
    path: 'purchase-order/add-edit',
    component: PurchaseOrderAddEditComponent,
    data: { breadcrumb: 'Purchase Order' },
  },
  {
    path: 'cash-purchase',
    component: CashPurchaseComponent,
    data: { breadcrumb: 'Cash Purchase' },
  },
  {
    path: 'material-issue',
    component: MaterialIssueComponent,
    data: { breadcrumb: 'Material issue New' },
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
