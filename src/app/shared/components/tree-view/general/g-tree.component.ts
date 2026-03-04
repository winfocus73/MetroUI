import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { ITreeResponse } from 'src/app/shared/models/tree-view.response';
import { NestedTreeControl } from "@angular/cdk/tree";
import { TreeDataSource } from '../tree-datasource';

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'nxAsm-general-tree-view',
  styleUrls: ['../tree.component.scss'],
  templateUrl: './g-tree.component.html',
})
export class GeneralTreeViewComponent implements OnInit, OnChanges {
    @Input() TREE_DATA!: ITreeResponse[]
    @Input() marginLeft!: number;
    @Input() isProvider = false;
    @Output() objAssetId = new EventEmitter();
    treeControl: any;
    dataSource: any;
    constructor() {}
  
    ngOnInit(): void {
        this.treeControl = new NestedTreeControl<ITreeResponse>(node => node.Children);
        this.dataSource = new TreeDataSource(this.treeControl, this.TREE_DATA);
    }

    ngOnChanges(changes: SimpleChanges): void {
      setTimeout(() => {
        this.treeControl = new NestedTreeControl<ITreeResponse>(node => node.Children);
        this.dataSource = new TreeDataSource(this.treeControl, this.TREE_DATA);
      }, 2000);

    }
    
    hasChild = (_: number, node: ITreeResponse) =>
      !!node.Children && node.Children.length > 0;
  
    addGin(parentNode: ITreeResponse) {
      //this.dataSource.add({ name: "Gin" }, parentNode);
    }
  
    remove(node: ITreeResponse) {
      this.dataSource.remove(node);
    }

    displayDetails(id: number) {
      this.objAssetId.emit(id);
    }
}