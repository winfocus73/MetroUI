export interface Column {
    columnDef: string;
    header: string;
    cell: Function;
    isLink?: boolean;
    url?: string;
    isViewbtn?: boolean;  
    isEditbtn?: boolean;
    isDateTime?: boolean;
    isDateOnly?: boolean;
    isStatusPipe?: boolean;
    isExpandBtn?: boolean;
    rowspan?: number;
    colspan?: number;
    isHidden?: boolean;
    groupHeader?: string;
    isHistorybtn?: boolean;
    isDeletebtn?: boolean;
    isEditLink?: boolean;
    className?:string;
    isPWDChange?: boolean;
    isAssetLocChange?: boolean;
    template?: any;
    label?: string;
    isInput?: boolean;
    inputType?: string;
  }
