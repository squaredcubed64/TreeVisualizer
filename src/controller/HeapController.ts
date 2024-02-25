import type DataNode from "../model/DataNode";
import HeapModel from "../model/HeapModel";
import type DisplayNode from "../view/DisplayNode";
import HeapView from "../view/HeapView";
import TreeController from "./TreeController";
import type HeapInsertionInformation from "./operationInformation/HeapInsertionInformation";
import type HeapDeletionInformation from "./operationInformation/deletionInformation/HeapDeletionInformation";
import type SwapPathInstruction from "./pathInstruction/SwapPathInstruction";

export default class HeapController extends TreeController {
  protected readonly model: HeapModel = new HeapModel(this);
  protected readonly view: HeapView = new HeapView(this);

  protected translateInsertionInformation(
    insertionInformation: HeapInsertionInformation<DataNode>,
  ): HeapInsertionInformation<DisplayNode> {
    const translatedTreeInsertionInformation =
      super.translateInsertionInformation(insertionInformation);
    const { shapeAfterInsertion, swapPath, didSwapToRoot } =
      insertionInformation;

    return {
      ...translatedTreeInsertionInformation,
      shapeAfterInsertion: this.translateShape(shapeAfterInsertion),
      swapPath: this.translatePath(swapPath),
      didSwapToRoot,
    };
  }

  protected translatePath(
    path: Array<SwapPathInstruction<DataNode>>,
  ): Array<SwapPathInstruction<DisplayNode>> {
    return path.map((pathInstruction) =>
      this.translatePathInstruction(pathInstruction),
    );
  }

  protected translatePathInstruction(
    pathInstruction: SwapPathInstruction<DataNode>,
  ): SwapPathInstruction<DisplayNode> {
    const { node, parent, secondaryDescription } = pathInstruction;
    return {
      node: this.translateNode(node),
      parent: this.translateNode(parent),
      secondaryDescription,
    };
  }

  protected translateDeletionInformation(
    deletionInformation: HeapDeletionInformation<DataNode>,
  ): HeapDeletionInformation<DisplayNode> {
    const {
      deletedNode,
      rootAfterDeletion: root,
      shapeAfterDeletion,
      swapPath,
      didSwapToLeaf,
    } = deletionInformation;

    return {
      deletedNode: this.translateNodeOrNull(deletedNode),
      rootAfterDeletion: this.translateNodeOrNull(root),
      shapeAfterDeletion: this.translateShape(shapeAfterDeletion),
      swapPath: this.translatePath(swapPath),
      didSwapToLeaf,
    };
  }

  /**
   * Note: Heap's find() (aka peek()) is trivial enough that the model need not provide any information.
   */
  protected translateFindInformation(
    findInformation: Record<string, unknown>,
  ): Record<string, unknown> {
    return {};
  }
}
