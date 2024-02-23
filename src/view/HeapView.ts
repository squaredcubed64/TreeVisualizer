import assert from "../../Assert";
import type HeapInsertionInformation from "../controller/operationInformation/HeapInsertionInformation";
import type SwapPathInstruction from "../controller/pathInstruction/HeapPathInstruction";
import type DisplayNode from "./DisplayNode";
import TreeView from "./TreeView";

export default class HeapView extends TreeView {
  public insert(
    insertionInformation: HeapInsertionInformation<DisplayNode>,
  ): void {
    const {
      shapeAfterInitialInsertion,
      swapPath,
      insertedNode,
      insertedValue,
    } = insertionInformation;

    if (this.shape.inorderTraversal.length === 0) {
      this.animateSettingRoot(
        shapeAfterInitialInsertion,
        insertedNode,
        insertedValue,
      );
    }

    assert(
      swapPath[0].node === insertedNode,
      "First node in swap path must be the inserted node.",
    );
    const insertedNodesParent = swapPath[0].parent;

    this.setupSwapPathAnimation(swapPath);
  }

  public delete(deletionInformation: any): void {
    throw new Error("Method not implemented.");
  }

  public find(findInformation: any): void {
    throw new Error("Method not implemented.");
  }

  private setupSwapPathAnimation(
    swapPath: Array<SwapPathInstruction<DisplayNode>>,
  ): void {
    for (const swapInstruction of swapPath) {
      const { node, parent, shapeAfterSwap } = swapInstruction;
      this.functionQueue.push({
        timeToWaitMs: 0,
        func: () => {
          sw;
        },
      });
    }
  }
}
