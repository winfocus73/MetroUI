import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
@Pipe({
  name: 'dateTime'
})
export class DateTimePipe extends DatePipe implements PipeTransform {
  override transform(value: any, args?: any): any {
    if (value && value !='null') {
      if(moment(value).isValid()) {
        const date = moment(value.toString().replace('Z','')).local().format("DD-MM-YYYY HH:mm:ss");
        //console.log(date);
        return date;//super.transform(date);
      } else {
        return value;
      }
      
    } else {
      return null;
    }

  }
}