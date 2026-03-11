import { IMaterialIssue, IMaterialIssueItem, IMaterialIssueSerialItem } from './material-issue';

export interface IMaterialIssueResponse {
    status: number;
    message: string;
    data: IMaterialIssue;
    items: IMaterialIssueItem[];
    serialItems: IMaterialIssueSerialItem[];
}