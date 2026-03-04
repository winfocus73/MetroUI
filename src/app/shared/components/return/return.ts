import { ICommonWorkflow } from "@shared/models";

export interface IReturn {
    Id: number;
    ReturnedOn: string;
    ReturnRemarks: string;
    ReturnedBy: number;
    Workflow: ICommonWorkflow;
}