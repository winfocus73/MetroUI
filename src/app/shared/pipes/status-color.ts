import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusColor' })
export class StatusColorPipe implements PipeTransform {
    transform(internalStatus: string): string {
        let returnStatusColor = '';
        if (internalStatus !== undefined) {
            switch (internalStatus.toLowerCase()) {
                case 'approval waiting':
                case 'waiting for assigning': {
                    return 'badge rounded-pill fw-normal bg-approval-waiting text-white';
                    break;
                }
                case 'waiting for approval': {
                    return 'badge rounded-pill fw-normal bg-warning text-white';
                    break;
                }
                case 'normal': {
                    return 'badge rounded-pill fw-normal bg-normal text-black';
                    break;
                }
                case 'completed':
                case 'resolved':
                    return 'badge rounded-pill fw-normal bg-completed';
                    break;
                case 'low': {
                    return 'badge rounded-pill fw-normal bg-low bg-gradientS';
                    break;
                }
                case 'new': {
                    return 'badge rounded-pill fw-normal bg-new text-white';
                    break;
                }
                case 'open': {
                    return 'badge rounded-pill fw-normal bg-open text-white';
                    break;
                }
                case 'no priority': {
                    return 'badge rounded-pill fw-normal bg-no-priority text-white';
                    break;
                }
                case 'closed': { 
                    return 'badge rounded-pill fw-normal bg-closed';
                    break;
                }
                case 'cancelled': {
                    return 'badge rounded-pill fw-normal bg-canceled text-white';
                    break;
                }
                case 'high': { 
                    return 'badge rounded-pill fw-normal bg-hight';
                    break;
                }
                case 'in progress': {
                    return 'badge rounded-pill fw-normal bg-in-progress text-white';
                    break;
                }
                case 'started': { 
                    return 'badge rounded-pill fw-normal bg-info';
                    break;
                }
                case 'approved':
                case 'assigned':
                case 'assigned & scheduled': {
                    return 'badge rounded-pill fw-normal bg-approved text-white';
                    break;
                }
                case 'scheduled': { 
                    return 'badge rounded-pill fw-normal bg-scheduled text-white';
                    break;
                }                
                default:
                    break;
            }
        }
        return returnStatusColor;
    }
}