import { Route } from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { NotFoundComponent } from 'src/app/core/layouts/not-found/not-found.component';
import { MaterialRequisitionComponent } from './components/material-requisition/material-requisition.component';
import { AddEditComponent } from './components/material-requisition/add-edit/add-edit.component';
import { PurchaseOrderComponent } from './components/purchase-order/purchase-order.component';
import { PurchaseOrderAddEditComponent } from './components/purchase-order/add-edit/add-edit.component';
import { CashPurchaseComponent } from './components/cash-purchase/cash-purchase.component';
import { MaterialIssueComponent } from './components/material-issue/material-issue.component';
import { AddEditShipmentComponent } from './components/shipment/add-edit-shipment/add-edit-shipment.component';
import { ShipmentSerialNoComponent } from './components/shipment/add-edit-shipment/shipment-serial-no/shipment-serial-no.component';
import { ShipmentDetailsComponent } from './components/shipment/shipment-details/shipment-details.component';
import { ShipmentComponent } from './components/shipment/shipment.component';

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
    path: 'shipment',
    component: ShipmentComponent,
    data: { breadcrumb: 'Shipment' },
  },
  {
    path: 'shipment/new',
    component: AddEditShipmentComponent,
    data: { breadcrumb: 'New Shipment' },
  },
  {
    path: 'shipment/new/shipment-serial-no',
    component: ShipmentSerialNoComponent,
    data: { breadcrumb: 'Add Shipment Serial No' },
  },
  {
    path: 'shipment/detail',
    component: ShipmentDetailsComponent,
    data: { breadcrumb: 'Shipment Details' },
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
