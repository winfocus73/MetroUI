export interface ITreeResponse {
    id: string | number;
    name: string;
    icon: string;
    position: string;
    code: string;
    assetNo?: string;
    oemSerialNo?: string;
    assetTreeId?: number;
    assetType?: number;
    placeHolderId?: number;
    locationChange?: number;
    categoryCode?: string;
    category?: number;
    Children: ITreeResponse[];
    children?: ITreeResponse[];
    typeId?: number;
    integrationAssetId?: string;
    status?: string;
    make?: number;
}

export interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  id: string;
  level: number;
  assetNo?: string;
  oemSerialNo?: string;
  integrationAssetId?: string;
}
