import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { ILoginData } from '@auth/models/login.response';
import { IWorkflowConfig, IWorkflowDetails, IWorkflowStatus } from '@shared/models/workflow.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  
  private readonly dateFormat = 'YYYY-MM-DD';

  constructor() {}

  /**
   * Initialize workflow form controls
   */
  initializeWorkflowControls(formBuilder: any, initialValues?: any): any {
    return {
      preparedBy: [initialValues?.preparedBy || null],
      preparedDate: [initialValues?.preparedDate || null],
      reviewedBy: [initialValues?.reviewedBy || null],
      reviewedDate: [initialValues?.reviewedDate || null],
      approvedBy: [initialValues?.approvedBy || null],
      approvedDate: [initialValues?.approvedDate || null]
    };
  }

  /**
   * Update workflow based on status change
   */
  updateWorkflowDetails(
    statusId: number, 
    statusList: IWorkflowStatus[],
    existingDetails: IWorkflowDetails,
    loginData: ILoginData
  ): IWorkflowDetails {
    const status = statusList.find(s => s.id === statusId) || null;
    const currentDate = moment().format(this.dateFormat);
    const currentUser = loginData.userName || '';
    
    let updatedDetails: IWorkflowDetails = {
      prepared: { ...existingDetails.prepared },
      reviewed: { ...existingDetails.reviewed },
      approved: { ...existingDetails.approved },
      currentStatus: status
    };

    if (!status) return updatedDetails;

    switch(status.name.toUpperCase()) {
      case 'PREPARED':
        if (!updatedDetails.prepared.by) {
          updatedDetails.prepared = {
            by: currentUser,
            date: currentDate,
            userId: loginData.userId
          };
        }
        break;
        
      case 'REVIEWED':
        if (!updatedDetails.reviewed.by) {
          updatedDetails.reviewed = {
            by: currentUser,
            date: currentDate,
            userId: loginData.userId
          };
        }
        break;
        
      case 'APPROVED':
        if (!updatedDetails.approved.by) {
          updatedDetails.approved = {
            by: currentUser,
            date: currentDate,
            userId: loginData.userId
          };
        }
        break;
    }

    return updatedDetails;
  }

  /**
   * Load workflow details from existing data
   */
  loadWorkflowDetails(
    createdUserId?: number,
    createdDate?: string,
    updatedUserId?: number,
    updatedDate?: string,
    statusId?: number,
    loginData?: ILoginData
  ): IWorkflowDetails {
    const details: IWorkflowDetails = {
      prepared: { by: null, date: null, userId: createdUserId },
      reviewed: { by: null, date: null, userId: updatedUserId },
      approved: { by: null, date: null },
      currentStatus: null
    };

    // Set prepared details from created info
    if (createdUserId && loginData) {
      details.prepared.by = loginData.userName || '';
      details.prepared.date = createdDate ? moment(createdDate).format(this.dateFormat) : null;
    }

    // Set reviewed details from updated info if status is reviewed or approved
    if (updatedUserId && loginData && (statusId === 1014 || statusId === 1015)) {
      details.reviewed.by = loginData.userName || '';
      details.reviewed.date = updatedDate ? moment(updatedDate).format(this.dateFormat) : null;
    }

    // Set approved details if status is approved
    if (statusId === 1015 && loginData) {
      details.approved.by = loginData.userName || '';
      details.approved.date = moment().format(this.dateFormat);
    }

    return details;
  }

  /**
   * Get visibility configuration for workflow fields
   */
  getWorkflowVisibility(
    details: IWorkflowDetails,
    statusList: IWorkflowStatus[],
    statusId?: number
  ): IWorkflowConfig {
    const status = statusList.find(s => s.id === statusId) || null;
    const statusName = status?.name?.toUpperCase() || '';

    return {
      statusList,
      preparedStatusId: statusList.find(s => s.name.toUpperCase() === 'PREPARED')?.id,
      reviewedStatusId: statusList.find(s => s.name.toUpperCase() === 'REVIEWED')?.id,
      approvedStatusId: statusList.find(s => s.name.toUpperCase() === 'APPROVED')?.id,
      showPrepared: !!(details.prepared.by || statusName === 'PREPARED' || statusName === 'REVIEWED' || statusName === 'APPROVED'),
      showReviewed: !!(details.reviewed.by || statusName === 'REVIEWED' || statusName === 'APPROVED'),
      showApproved: !!(details.approved.by || statusName === 'APPROVED')
    };
  }

  /**
   * Update form group with workflow values
   */
  updateFormGroup(form: FormGroup, details: IWorkflowDetails): void {
    form.patchValue({
      preparedBy: details.prepared.by,
      preparedDate: details.prepared.date,
      reviewedBy: details.reviewed.by,
      reviewedDate: details.reviewed.date,
      approvedBy: details.approved.by,
      approvedDate: details.approved.date
    });
  }

  /**
   * Get workflow details from form
   */
  getWorkflowFromForm(form: FormGroup): IWorkflowDetails {
    return {
      prepared: {
        by: form.get('preparedBy')?.value,
        date: form.get('preparedDate')?.value
      },
      reviewed: {
        by: form.get('reviewedBy')?.value,
        date: form.get('reviewedDate')?.value
      },
      approved: {
        by: form.get('approvedBy')?.value,
        date: form.get('approvedDate')?.value
      },
      currentStatus: null
    };
  }

  /**
   * Check if workflow is complete for a given status
   */
  isWorkflowComplete(details: IWorkflowDetails, statusName: string): boolean {
    switch(statusName.toUpperCase()) {
      case 'PREPARED':
        return !!(details.prepared.by && details.prepared.date);
      case 'REVIEWED':
        return !!(details.reviewed.by && details.reviewed.date);
      case 'APPROVED':
        return !!(details.approved.by && details.approved.date);
      default:
        return false;
    }
  }
}