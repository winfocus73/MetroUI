// filter-options.interface.ts
export interface IFilterOptions {
  name: string;
  displayName?: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'select' | 'daterange'; // Add more types as needed
  options?: any[]; // Array of dropdown options
  template?: string; // Template HTML for the control
  className?: string; // Class name for styling
  style?: any;
  value?: any;
  initialValue?: any;
  optionsDefault?: any;
  optionsLabel?: any;
  optionsValue?: any;
  colSize?:string;
  triggerOnValueChange?: boolean
  disable?: boolean;
}

