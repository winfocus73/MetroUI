import { Injectable } from '@angular/core';
import { DateTimeAdapter } from '@danielmoncada/angular-datetime-picker';
import * as moment from 'moment';



@Injectable({
   providedIn: 'root',
})
export class CustomDateTimeAdapter extends DateTimeAdapter<Date> {

/** The default date names to use if Intl API is not available. */
DEFAULT_DATE_NAMES = this.range(31, i => String(i + 1));

DEFAULT_MONTH_NAMES = {
    'long': [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'
    ],
    'short': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'narrow': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
};

DEFAULT_DAY_OF_WEEK_NAMES = {
    'long': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    'short': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'narrow': ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};

ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;

private SUPPORTS_INTL_API = typeof Intl !== 'undefined';

private useUtcForDisplay = !(typeof document === 'object' && !!document &&
    /(msie|trident)/i.test(navigator.userAgent));

private __assign =  function (t: any) {
        for (let s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (const p in s) {
                if (Object.prototype.hasOwnProperty.call(s, p)) {
                    t[p] = s[p];
                }
            }
        }
        return t;
    };    

getYear(date: Date): number {
    return date.getFullYear();
}
getMonth(date: Date): number {
    return date.getMonth();
}
getDay(date: Date): number {
    return date.getDay();
}
getDate(date: Date): number {
    return date.getDate();
}
getHours(date: Date): number {
    return date.getHours();
}
getMinutes(date: Date): number {
    return date.getMinutes();
}
getSeconds(date: Date): number {
    return date.getSeconds();
}
getTime(date: Date): number {
    return date.getTime();
}
getNumDaysInMonth(date: Date): number {
    const lastDateOfMonth = this.createDateWithOverflow(this.getYear(date), this.getMonth(date) + 1, 0);
    return this.getDate(lastDateOfMonth);
}
getDateNames(): string[] {
    if (this.SUPPORTS_INTL_API) {
        const dtf = new Intl.DateTimeFormat(this.locale, { day: 'numeric', timeZone: 'utc' });
        return this.range(31, i => this._stripDirectionalityCharacters(
            this._format(dtf, new Date(2017, 0, i + 1))));
    }
    return this.DEFAULT_DATE_NAMES;
}
private createDateWithOverflow(year: number, month: number, date: number, hours?: number, minutes?: number, seconds?: number): any {
    if (hours === void 0) { hours = 0; }
    if (minutes === void 0) { minutes = 0; }
    if (seconds === void 0) { seconds = 0; }
    const result = new Date(year, month, date, hours, minutes, seconds);
    if (year >= 0 && year < 100) {
        result.setFullYear(this.getYear(result) - 1900);
    }
    return result;
}
differenceInCalendarDays(dateLeft: Date, dateRight: Date): number {
    if (this.isValid(dateLeft) && this.isValid(dateRight)) {
        const dateLeftStartOfDay = this.createDate(this.getYear(dateLeft), this.getMonth(dateLeft), this.getDate(dateLeft));
        const dateRightStartOfDay = this.createDate(this.getYear(dateRight), this.getMonth(dateRight), this.getDate(dateRight));
        const timeStampLeft = this.getTime(dateLeftStartOfDay) - dateLeftStartOfDay.getTimezoneOffset() * this.milliseondsInMinute;
        const timeStampRight = this.getTime(dateRightStartOfDay) - dateRightStartOfDay.getTimezoneOffset() * this.milliseondsInMinute;
        return Math.round((timeStampLeft - timeStampRight) / this.millisecondsInDay);
    } else {
        return 0;
    }
}
getYearName(date: Date): string {
    if (this.SUPPORTS_INTL_API) {
        const dtf = new Intl.DateTimeFormat(this.locale, { year: 'numeric' });
        return this.stripDirectionalityCharacters(dtf.format(date));
    }
    return String(this.getYear(date));
}
private stripDirectionalityCharacters(str: string): string {
    return str.replace(/[\u200e\u200f]/g, '');
}
getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const _this = this;
    if (this.SUPPORTS_INTL_API) {
        const dtf_1 = new Intl.DateTimeFormat(this.locale, { month: style });
        return this.range(12, function (i) {
            return _this.stripDirectionalityCharacters(dtf_1.format(new Date(2017, i, 1)));
        });
    }
    return this.DEFAULT_MONTH_NAMES[style];
}
private range(longitud: number, valueFunction: (i: any) => string): string[] {
    const valuesArray = Array(longitud);
    for (let i = 0; i < longitud; i++) {
        valuesArray[i] = valueFunction(i);
    }
    return valuesArray;
}
getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const _this = this;
    if (this.SUPPORTS_INTL_API) {
        const dtf_2 = new Intl.DateTimeFormat(this.locale, { weekday: style });
        return this.range(7, function (i) {
            return _this.stripDirectionalityCharacters(dtf_2.format(new Date(2017, 0, i + 1)));
        });
    }
    return this.DEFAULT_DAY_OF_WEEK_NAMES[style];
}
toIso8601(date: Date): string {
    return date.toISOString();
}
isEqual(dateLeft: Date, dateRight: Date): boolean {
    if (this.isValid(dateLeft) && this.isValid(dateRight)) {
        return dateLeft.getTime() === dateRight.getTime();
    } else {
        return false;
    }
}
isSameDay(dateLeft: Date, dateRight: Date): boolean {
    if (this.isValid(dateLeft) && this.isValid(dateRight)) {
        const dateLeftStartOfDay = this.clone(dateLeft);
        const dateRightStartOfDay = this.clone(dateRight);
        dateLeftStartOfDay.setHours(0, 0, 0, 0);
        dateRightStartOfDay.setHours(0, 0, 0, 0);
        return dateLeftStartOfDay.getTime() === dateRightStartOfDay.getTime();
    } else {
        return false;
    }
}
isValid(date: Date): boolean {
    return date && !isNaN(date.getTime());
}
invalid(): Date {
    return new Date(NaN);
}
isDateInstance(obj: any): boolean {
    return obj instanceof Date;
}
addCalendarYears(date: Date, amount: number): Date {
    return this.addCalendarMonths(date, amount * 12);
}
addCalendarMonths(date: Date, amount: number): Date {
    const result = this.clone(date);
    amount = Number(amount);
    const desiredMonth = result.getMonth() + amount;
    const dateWithDesiredMonth = new Date(0);
    dateWithDesiredMonth.setFullYear(result.getFullYear(), desiredMonth, 1);
    dateWithDesiredMonth.setHours(0, 0, 0, 0);
    const daysInMonth = this.getNumDaysInMonth(dateWithDesiredMonth);
    result.setMonth(desiredMonth, Math.min(daysInMonth, result.getDate()));
    return result;
}
addCalendarDays(date: Date, amount: number): Date {
    const result = this.clone(date);
    amount = Number(amount);
    result.setDate(result.getDate() + amount);
    return result;
}
setHours(date: Date, amount: number): Date {
    const result = this.clone(date);
    result.setHours(amount);
    return result;
}
setMinutes(date: Date, amount: number): Date {
    const result = this.clone(date);
    result.setMinutes(amount);
    return result;
}
setSeconds(date: Date, amount: number): Date {
    const result = this.clone(date);
    result.setSeconds(amount);
    return result;
}
createDate(year: number, month: number, date: number): Date;
createDate(year: number, month: number, date: number, hours: number, minutes: number, seconds: number): Date;
createDate(year: any, month: any, date: any, hours?: any, minutes?: any, seconds?: any) {
    if (hours === void 0) { hours = 0; }
    if (minutes === void 0) { minutes = 0; }
    if (seconds === void 0) { seconds = 0; }
    if (month < 0 || month > 11) {
        throw Error('Invalid month index \"' + month + '\". Month index has to be between 0 and 11.');
    }
    if (date < 1) {
        throw Error('Invalid date \"' + date + '\". Date has to be greater than 0.');
    }
    if (hours < 0 || hours > 23) {
        throw Error('Invalid hours \"' + hours + '\". Hours has to be between 0 and 23.');
    }
    if (minutes < 0 || minutes > 59) {
        throw Error('Invalid minutes \"' + minutes + '\". Minutes has to between 0 and 59.');
    }
    if (seconds < 0 || seconds > 59) {
        throw Error('Invalid seconds \"' + seconds + '\". Seconds has to be between 0 and 59.');
    }
    const result = this.createDateWithOverflow(year, month, date, hours, minutes, seconds);
    if (result.getMonth() !== month) {
        throw Error('Invalid date \"' + date + '\" for month with index \"' + month + '\".');
    }
    return result;
}
clone(date: Date): Date {
    return new Date(date.getTime());
}
now(): Date {
    return new Date();
}
format(date: Date, displayFormat: any): string {
    if (!this.isValid(date)) {
        throw Error('JSNativeDate: Cannot format invalid date.');
    }

    if (this.locale == 'en-US') {
        const dateEnglishWithoutTime = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' +
                                    date.getFullYear();
        return dateEnglishWithoutTime;
    }
    const dateWithoutTime = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
        date.getFullYear();
    let dt = moment(date).format('DD-MM-YYYY HH:mm:ss')       
    return dt;
}
parse(value: any, parseFormat: any): Date {
    if (typeof value === 'number') {
        return new Date(value);
    }
    return value ? new Date(Date.parse(value)) : new Date();
}

    override deserialize(value:any) {
    if (typeof value === 'string') {
        if (!value) {
            return null;
        }
        if (this.ISO_8601_REGEX.test(value)) {
            const date = new Date(value);
            if (this.isValid(date)) {
                return date;
            }
        }
    }
    return super.deserialize.call(this, value);
}



/**
 * Strip out unicode LTR and RTL characters. Edge and IE insert these into formatted dates while
 * other browsers do not. We remove them to make output consistent and because they interfere with
 * date parsing.
 * @param str The string to strip direction characters from.
 * @returns The stripped string.
 */
private _stripDirectionalityCharacters(str: string) {
    return str.replace(/[\u200e\u200f]/g, '');
}

/**
 * When converting Date object to string, javascript built-in functions may return wrong
 * results because it applies its internal DST rules. The DST rules around the world change
 * very frequently, and the current valid rule is not always valid in previous years though.
 * We work around this problem building a new Date object which has its internal UTC
 * representation with the local date and time.
 * @param dtf Intl.DateTimeFormat object, containg the desired string format. It must have
 *    timeZone set to 'utc' to work fine.
 * @param date Date from which we want to get the string representation according to dtf
 * @returns A Date object with its UTC representation based on the passed in date info
 */
private _format(dtf: Intl.DateTimeFormat, date: Date) {
    const d = new Date(Date.UTC(
        date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(),
        date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    return dtf.format(d);
}

}