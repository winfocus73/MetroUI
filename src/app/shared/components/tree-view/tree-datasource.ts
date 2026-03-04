import { NestedTreeControl } from "@angular/cdk/tree";
import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { MatTreeNestedDataSource, MatTree } from "@angular/material/tree";
import { ITreeResponse } from "src/app/shared/models/tree-view.response";

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */


export class TreeDataSource extends MatTreeNestedDataSource<ITreeResponse> {
  constructor(
    private treeControl: NestedTreeControl<ITreeResponse>,
    intialData: ITreeResponse[]
  ) {
    super();
    //this._data.next(intialData);
    this.data = intialData;
  }

  /** Add node as child of parent */
  public add(node: ITreeResponse, parent: ITreeResponse) {
    // add dummy root so we only have to deal with `FoodNode`s
    const newTreeData =  { id: '1', icon: '', position: '', name: "Dummy Root",  code: 'TEST',  Children: this.data };
    this._add(node, parent, newTreeData);
    this.data = newTreeData.Children;
  }

  /** Remove node from tree */
  public remove(node: ITreeResponse) {
    const newTreeData =  { id: '1', icon: '', position: '', name: "Dummy Root",   code: 'TEST', Children: this.data };
    this._remove(node, newTreeData);
    this.data = newTreeData.Children;
  }

  /*
   * For immutable update patterns, have a look at:
   * https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns/
   */

  protected _add(newNode: ITreeResponse, parent: ITreeResponse, tree: ITreeResponse): any {
    if (tree === parent) {
      // console.log(
      //   `replacing children array of '${parent.name}', adding ${newNode.name}`
      // );
      tree.Children = [...tree.Children!, newNode];
      this.treeControl.expand(tree);
      return true;
    }
    if (!tree.Children) {
      //console.log(`reached leaf node '${tree.name}', backing out`);
      return false;
    }
    return this.update(tree, this._add.bind(this, newNode, parent));
  }

  _remove(node: ITreeResponse, tree: ITreeResponse): boolean {
    if (!tree.Children) {
      return false;
    }
    const i = tree.Children.indexOf(node);
    if (i > -1) {
      tree.Children = [
        ...tree.Children.slice(0, i),
        ...tree.Children.slice(i + 1)
      ];
      this.treeControl.collapse(node);
     // console.log(`found ${node.name}, removing it from`, tree);
      return true;
    }
    return this.update(tree, this._remove.bind(this, node));
  }

  protected update(tree: ITreeResponse, predicate: (n: ITreeResponse) => boolean) {
    let updatedTree: ITreeResponse, updatedIndex: number;

    tree.Children!.find((node, i) => {
      if (predicate(node)) {
        //console.log(`creating new node for '${node.name}'`);
        updatedTree = { ...node };
        updatedIndex = i;
        this.moveExpansionState(node, updatedTree);
        return true;
      }
      return false;
    });

    if (updatedTree!) {
     // console.log(`replacing node '${tree.Children![updatedIndex!].name}'`);
      tree.Children![updatedIndex!] = updatedTree!;
      return true;
    }
    return false;
  }

  moveExpansionState(from: ITreeResponse, to: ITreeResponse) {
    if (this.treeControl.isExpanded(from)) {
     // console.log(`'${from.name}' was expanded, setting expanded on new node`);
      this.treeControl.collapse(from);
      this.treeControl.expand(to);
    }
  }
}