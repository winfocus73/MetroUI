export interface ILookupData {
    lookup_id: number;
    lookup_name: string;
    lookupvalues: ILookupValue[];
}

export interface ILookupValue {
    id: number;
    name: string;
    code: string;
}
