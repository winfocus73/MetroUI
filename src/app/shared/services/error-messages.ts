export type ErrorTypes =
  | 'required'
  | 'email'
  | 'minlength'
  | 'invalidDate'
  | 'invalidYear'
  | 'owlDateTimeParse'
  | 'toDateLessThanFrom'
  | 'toDateLessThanCurrent'
  | 'dateTimeRangeInvalid'
  | 'maxDate'
  | 'minDate'
  | 'atLeastOneChecked'
  | 'assetIdorRouteIdRequired'
  ;

export const ERROR_MESSAGES: { [key: string]: (...args: any) => string } = {
  required: (formControlName: string) => `${formControlName} is required.`,

  email: () => `This is not a valid email address.`,
  minlength: (formControlName, requirement) =>
    `${formControlName} should be at least ${requirement} characters.`,
  invalidDate: () => `This is not a valid date.`,
  invalidYear: () => `Date of Birth should be after year 1900.`,
  owlDateTimeParse: () => `This is not a valid date.`,
  toDateLessThanFrom: (toDate, fromDate) => `${toDate}} is less than ${fromDate}`,
  dateTimeRangeInvalid: () => `dateTimeRangeInvalid`,
  atLeastOneChecked: () => 'At least one record must be selected',
  assetIdorRouteIdRequired: () => 'AssetId/RouteId Required'
};
