
export interface IModuleForms {
    modules: IModule[];
}
export interface IModule {
    id: number;
    name: string;
    state: string;
    forms: string;
    objForms: IForm[];
}

export interface IForm {
    id: number;
    name: string;
    state: string;
}

