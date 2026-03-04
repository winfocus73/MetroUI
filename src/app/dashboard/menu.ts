export interface IMenuList {
    menus: Menu[];    
  }
  
  export interface Menu {
      state: string;
      name: any;
      type: string;
      icon: string;
      id?: any;
      submenu: Menu[];
  }

 export interface IGetMenuRequest {
    SearchByName: string;
    SearchByValue: string
 }