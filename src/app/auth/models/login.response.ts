
export interface ILoginResponse {
    id: number;
    userName: string;
    staffName: string;
    userSession: string;
    userSessionId: number;
    lastLogin: string;
    unitId: number;
    unitName: string;
    roleIds: string;
    roleNames: string;
    loginResult: number;
    loginMessage: string;
    locationName: string;
    unitAccessScopes: string;
    assetCategoryId: number;
    isMFARequired: number;
    mfaReferenceCode: number;
    resetpwd: number;
    staffId: number;
}

export interface ILoginData  {
    loginData: ILoginResponse;
    userRoleId: string;
}
