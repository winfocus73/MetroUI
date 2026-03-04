import { Component, Input, OnInit } from "@angular/core";
import { IBreadCrumb } from "../../models/breadcrumb";


@Component({
    selector: 'nxasm-bread-crumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
  })
  export class BreadCrumbComponent implements OnInit {
    @Input() breadcumbs:IBreadCrumb[]=[];
    constructor(){}
    
    ngOnInit() {
       
    }
  }