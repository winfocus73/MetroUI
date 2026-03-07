import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IWorkflowConfig, IWorkflowDetails } from '@shared/models/workflow.model';

@Component({
  selector: 'app-workflow-details',
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss']
})
export class WorkflowDetailsComponent implements OnInit, OnChanges {
  @Input() form!: FormGroup;
  @Input() workflowConfig!: IWorkflowConfig;
  @Input() workflowDetails!: IWorkflowDetails;
  @Input() entityId: number = 0;
  @Input() dateFormat: string = 'DD-MM-YYYY';

  showPrepared: boolean = false;
  showReviewed: boolean = false;
  showApproved: boolean = false;

  ngOnInit(): void {
    this.updateVisibility();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workflowConfig'] || changes['workflowDetails'] || changes['entityId']) {
      this.updateVisibility();
    }
  }

  private updateVisibility(): void {
    if (this.workflowConfig) {
      this.showPrepared = this.workflowConfig.showPrepared;
      this.showReviewed = this.workflowConfig.showReviewed;
      this.showApproved = this.workflowConfig.showApproved;
    }
  }

  getFieldValue(fieldName: string): any {
    return this.form?.get(fieldName)?.value;
  }
}