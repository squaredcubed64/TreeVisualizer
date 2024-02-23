/* import type HeapInsertionInformation from "../controller/operationInformation/HeapInsertionInformation";
import type DisplayNode from "./DisplayNode";
import TreeView from "./TreeView";

export default class HeapView extends TreeView {
  public insert(
    insertionInformation: HeapInsertionInformation<DisplayNode>,
  ): void {
    const { shapeAfterInitialInsertion, swapPath } = insertionInformation;

    const placeholderNode = this.findPlaceholderNode(
      shapeAfterInitialInsertion,
    );

    if (this.shape.inorderTraversal.length === 0) {
      this.animateSettingRoot(shapeAfterInitialInsertion, placeholderNode, value);
    }
  }

  public delete(deletionInformation: any): void {
    throw new Error("Method not implemented.");
  }

  public find(findInformation: any): void {
    throw new Error("Method not implemented.");
  }
}
*/
