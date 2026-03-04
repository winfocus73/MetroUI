export interface IUploadRequest {
    id: number;
    files:any;
    UnitId:number;
    Name:string;
    Description:string;
    Tags:string;
    Kind:string;
    CreatedBy:string;
    objectId: string;
    code: string;
    extension: string;
    size: number | null;
    filePath: string;
    rootPath: string;
    status: number;
    createdBy: number;
}