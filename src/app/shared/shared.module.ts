import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { FileUploadPreviewComponent } from './components/file-upload-preview/file-upload-preview.component';
import { DndDirective } from './components/file-upload-preview/dnd.directive';
import { ConfirmDialogComponent } from './utils/dialogs/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from './utils/dialogs/alert-dialog/alert-dialog.component';
import { TreeViewComponent } from './components/tree-view/tree.component';
import { TableComponent } from './components/table/table.component';
import { SearchComponent } from './components/search/search.component';
import { ScrollbarComponent } from './components/scrollbar/scrollbar.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { NumberDirective, NumbersOnlyDirective, NumberDecimalDirective } from './directives/numbers-only.directive';
import { StopPropagation } from './directives/stop-propagation';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule, NGX_MAT_DATE_FORMATS, NgxMatDateFormats } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import * as moment from 'moment';
import { DateTimePipe } from './pipes/date-time';
import { StatusColorPipe } from './pipes/status-color';
import { BreadCrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { DonutChartComponent } from './components/charts/donut-chart/donut-chart.component';
import { HorizontalBarChartComponent } from './components/charts/horizontal-bar/horizontal-bar-chart.component';
import { FullDonutChartComponent } from './components/charts/full-donut/full-donut-chart.component';
import { PiechartComponent } from './components/charts/pie-chart/pie-chart.component';
import { DateOnlyPipe } from './pipes/date-only';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { ClickModifiersPlugin } from './services/click-modifiers.plugin';
import { DatePickerFormatDirective } from './directives/date-picker-format';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { FormFieldComponent } from './components/form-field/form-field.component';
import { ShowErrorDirective } from './directives/show-error.directive';
import { GeneralTreeViewComponent } from './components/tree-view/general/g-tree.component';
import { UploadComponent } from './components/upload/upload.component';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AssetHistoryComponent } from './components/asset-history/asset-history.component';
import { CancelTypeComponent } from './components/cancel/cancel.component';
import { FilterPipe } from './pipes/filter';
import { WorkorderNotesComponent } from './components/notes/work-order-notes.component';
import { PdfviewComponent } from './components/attachments/pdfview/pdfview.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatDateTimePickerWrap } from '@shared/components/NXDateTimePicker/nx-datetime-picker.component';
import { DateTimeAdapter, OwlDateTimeIntl, OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { CustomDateTimeAdapter } from './services/ol-dateTimeAdapter';
import { AssetLocationChangeComponent } from './components/asset-location-change/asset-location-change.component';
import { LocationsDialogComponent } from './components/location-dialog/location-dialog.component';
import { TooltipDirective } from './components/tooltip/tooltip.directive';
import { AMSTooltipComponent } from './components/tooltip/tooltip.component';
import { DurationPipe } from './pipes/duration';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { FilterOptionsComponent } from './components/filter-options/filter-options.component';
import { PowerbiComponent } from './components/powerbi/powerbi.component';
import { PowerbiReportComponent } from './components/powerbi-report/powerbi-report.component';
import { ShowScrollbarOnHoverDirective } from './directives/show-scrollbar-on-hover.directive';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TruncatePipe } from './pipes/truncate';
import { ReturnTypeComponent } from './components/return/return.component';
import { ForwardBackWordComponent } from './components/forward-backward-component/forward-backward.component';
import { ChangePasswordComponent } from './components/change-pwd/change-pwd.component';
import { NgxPubSubModule } from '@pscoped/ngx-pub-sub';
import { SafePipe } from './pipes/safe';
import { ProfileComponent } from './components/profile/profile.component';
import { TextPlaceholderDirective } from './directives/text-placeholder.directive';
import { GrabberDirective, ResizableDirective } from './directives/resizable.directive';
import { WorkOrderListPopupComponent } from '@dashboard/planning-scheduling/work-order/list/popup/work-order-list-popup.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FloatOrIntegerInputDirective } from './directives/numbers-or-floats.directive';
import { HelpSystemDialog } from './components/help-system-dialog/help-system-dialog.component';
import { HelpComponent } from './components/help-system-dialog/help.component';
//import { MarkAllControlsTouchedOnSubmitDirective } from './directives/mark-all-controls-touched-on-submit-directive.directive';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { RemarksComponent } from './components/remarks/remarks-json-dialog.component';

// If using Moment
const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: "DD-MM-YYYY HH:mm"
  },
  display: {
    dateInput: "DD-MM-YYYY HH:mm",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

export const CUSTOM_MAT_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    monthYearA11yLabel: 'Month and Year',
    yearLabel: 'YYYY',
    yearA11yLabel: 'Year',
  },
};

// here is the default text string
const DefaultIntl = new  OwlDateTimeIntl();
DefaultIntl.setBtnLabel= 'Okay';

//and in the module providers


const COMPONENTS = [
  AlertDialogComponent,
  ConfirmDialogComponent,
  FileUploadPreviewComponent,
  TreeViewComponent,
  TableComponent,
  SearchComponent,
  ScrollbarComponent,
  NumberDirective,
  NumberDecimalDirective,
  NumbersOnlyDirective,
  FloatOrIntegerInputDirective,
  StopPropagation,
  DateTimePipe,
  StatusColorPipe,
  BreadCrumbComponent,
  DonutChartComponent,
  HorizontalBarChartComponent,
  FullDonutChartComponent,
  PiechartComponent,
  DateOnlyPipe,
  FilterPipe,
  DurationPipe,
  SafePipe,
  DatePickerFormatDirective,
  FormFieldComponent,
  ShowErrorDirective,
  GeneralTreeViewComponent,
  UploadComponent,
  AttachmentsComponent,
  AssetHistoryComponent,
  CancelTypeComponent,
  WorkorderNotesComponent,
  WorkOrderListPopupComponent,
  PdfviewComponent,
  MatDateTimePickerWrap,
  AssetLocationChangeComponent,
  LocationsDialogComponent,
  TooltipDirective,
  FeedbackComponent,
  FilterOptionsComponent,
  PowerbiComponent,
  PowerbiReportComponent,
  ShowScrollbarOnHoverDirective,
  TruncatePipe,
  ReturnTypeComponent,
  ForwardBackWordComponent,
  ChangePasswordComponent,
  ProfileComponent,
  RemarksComponent,
  TextPlaceholderDirective,
  ResizableDirective,
  GrabberDirective,
  HelpSystemDialog,
  HelpComponent
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  declarations: [
    ...COMPONENTS,
    DndDirective,
    AMSTooltipComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatMomentModule,
    MaterialModule,
    ScrollingModule,
    MatDatepickerModule,
    MatMomentDateModule,
    PdfViewerModule,
    NgxDaterangepickerMd.forRoot(),
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgScrollbarModule,
    NgxPubSubModule,
    NgSelectModule,
    NgApexchartsModule
  ],
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: EVENT_MANAGER_PLUGINS, useClass: ClickModifiersPlugin, multi: true },
    { provide: DateTimeAdapter, useClass: CustomDateTimeAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_MAT_DATE_FORMATS },
    {provide: OwlDateTimeIntl, useValue: DefaultIntl},
  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatMomentModule,
    MaterialModule,
    ScrollingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgScrollbarModule,
    NgxPubSubModule,
    NgSelectModule,
    NgApexchartsModule,
    ...COMPONENTS
  ]
})
export class SharedModule { }
