import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
@Pipe({
  name: 'dateOnly'
})
export class DateOnlyPipe extends DatePipe implements PipeTransform {
  override transform(value: any, args?: any): any {
    if (value && value !='null') {
      const date = moment(value.toString().replace('Z','')).local().format("DD-MM-YYYY");
      //console.log(date);
      return date;//super.transform(date);
    } else {
      return null;
    }

  }
}