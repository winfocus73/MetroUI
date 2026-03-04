import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(startDate: Date | string, endDate: Date | string): string {
    // Convert string dates to Date objects
    const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;

    // Check if the dates are valid
    if (!startDateObj || !endDateObj || isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return '';
    }

    // Calculate the duration
    const diffMilliseconds = endDateObj.getTime() - startDateObj.getTime();
    const hours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((diffMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    // Format the duration string
    let durationString = '';
    if (hours > 0) {
      durationString += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      durationString += `${hours > 0 ? ' ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    return durationString;
  }
}
