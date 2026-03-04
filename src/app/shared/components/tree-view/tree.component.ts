import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { ITreeResponse } from 'src/app/shared/models/tree-view.response';
import { NestedTreeControl } from "@angular/cdk/tree";
import { TreeDataSource } from './tree-datasource';
import { IFormCheck } from '@shared/models/role-check';
import { ICommonRequest, IRequest } from '@shared/models';
import { CommonService } from '@shared/services/common.service';

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'nxAsm-tree-view',
  styleUrls: ['./tree.component.scss'],
  templateUrl: './tree.component.html',
})
export class TreeViewComponent implements OnInit, OnChanges {
    @Input() TREE_DATA!: ITreeResponse[]
    @Input() marginLeft!: number;
    @Input() isProvider = false;
    @Input()  objForm: IFormCheck = {} as IFormCheck;
    @Input()  arPrivilege: IFormCheck = {} as IFormCheck;
    @Output() objAssetId = new EventEmitter();
    @Output() missingClick = new EventEmitter<ITreeResponse>();
    @Output() provideBtn = new EventEmitter();
    activeNodeId: number | null = null;
    // @Input() TREE_DATA: ITreeResponse[] = [
    //     {
    //       id: '1',
    //       name: 'SuperADMIN',
    //       Position: '',
    //       Icon: '',
    //       Children: [
    //         {
    //           id: '2',
    //           name: 'MANAGER',
    //           Position: '',
    //           Icon: '',
    //           Children: [
    //             {
    //               id: '3',
    //               name: 'ASSOMANAGER',
    //               Position: '',
    //               Icon: '',
    //               Children: [  {
    //                 id: '4',
    //                 name: 'ASSOMANAGER4',
    //                 Position: '',
    //                 Icon: '',
    //                 Children: []
    //               }
    //             ]
    //             }
    //           ]
    //         },
    //         {
    //           id: '4',
    //           name: 'QHSEMANAGER',
    //           Position: '',
    //           Icon: '',
    //           Children: [{
    //             id: '6',
    //             name: 'QHSEMANAGER5',
    //             Position: '',
    //             Icon: '',
    //             Children: []
    //           }]
    //         }
    //       ]
    //     }
    //   ];
      treeControl: any;
      dataSource: any;
    constructor(private commonService: CommonService) {}

    ngOnInit(): void {
      //console.log(this.TREE_DATA)
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
      this.activeNodeId = id;
      this.objAssetId.emit(id);
    }

    provideButton(data: ITreeResponse) {
      this.provideBtn.emit(data);
    }
//     isMissing(node: ITreeResponse): boolean {
//   return !node?.id || node.id === '0' || node.id === 0;
// }
// isMissing(node: ITreeResponse): boolean {
//   if (!node) return false;

//   const assetNo = String(node.assetNo || '').trim();

//   // missing if placeholder without asset
//   return assetNo === '';
// }
isMissing(node: ITreeResponse): boolean {
  if (!node) return false;

  const pos = String(node.position || '').trim();

  // TEMP: mark any deep node as missing
  return pos.startsWith('1.3.1');
}


getMissingCount(node: ITreeResponse): number {
  if (!node.Children || node.Children.length === 0) {
    // leaf node missing check
    return this.isMissing(node) ? 1 : 0;
  }

  let count = 0;
  for (const child of node.Children) {
    count += this.getMissingCount(child);
  }

  return count;
}
openMissingPopup(node: ITreeResponse) {
  this.missingClick.emit(node);
}

}




/**  Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */
