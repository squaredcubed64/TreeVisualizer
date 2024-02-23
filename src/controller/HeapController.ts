// import DataNode from "../model/DataNode";
// import DisplayNode from "../view/DisplayNode";
// import TreeView from "../view/TreeView";
// import TreeController from "./TreeController";
// import HeapInsertionInformation from "./operationInformation/HeapInsertionInformation";

// export default class HeapController extends TreeController {
//   /**
//    * Inserts a value into the model and updates the view accordingly.
//    * @param value The value to insert
//    */
//   public insert(value: number): void {
//     const { insertionInformation, insertedNode } = this.model.insert(value);

//     // A placeholder for the node that's being inserted. The view will update this upon insertion.
//     const placeholderNode = TreeView.makePlaceholderNode();
//     this.dataNodeToDisplayNode.set(insertedNode, placeholderNode);

//     this.view.insert(this.translateInsertionInformation(insertionInformation));
//   }

//   protected translateInsertionInformation(
//     insertionInformation: HeapInsertionInformation<DataNode>,
//   ): HeapInsertionInformation<DisplayNode> {
//     const { shapeAfterInitialInsertion, swapPath } = insertionInformation;
//     return {
//       shape: this.translateShape(shape),
//       pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
//       value,
//     };
//   }
// }
