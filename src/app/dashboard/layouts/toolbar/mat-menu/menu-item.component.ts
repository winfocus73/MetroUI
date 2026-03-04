import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NavItem} from './nav-item';
import { Menu } from '@dashboard/menu';

@Component({
  selector: 'nxasm-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit, OnChanges{
  @Input() reportMenu: Menu[] =[];
  @Input() items: NavItem[] = [];
  @ViewChild('childMenu') public childMenu: any;

  constructor(public router: Router) {
  }

  ngOnInit() {
   
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.reportMenu.length > 0) {
        //this.collectStrings(this.reportMenu);
        this.items = [
            {
              displayName: '',
              iconName: 'las la-chart-area',
              children: this.collectStrings(this.reportMenu)
            }
          ];
        console.log('REPORT MENU..', this.collectStrings(this.reportMenu))
    }   
  }


  collectStrings(menuData: Menu[]) {
    let newArr:NavItem[] = []
    menuData.forEach((item)=>{
        let nav = {} as NavItem;
        nav.displayName = item.name;
        nav.iconName = item.icon;
        nav.route = item.state;
        nav.children =  item.submenu ?  newArr.concat(this.collectStrings(item.submenu)) : null;
        newArr.push(nav);
    })
      return newArr
  }
}
