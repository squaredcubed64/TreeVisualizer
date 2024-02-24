import assert from "../../Assert";
import type HeapInsertionInformation from "../controller/operationInformation/HeapInsertionInformation";
import type SwapPathInstruction from "../controller/pathInstruction/SwapPathInstruction";
import type SwapSecondaryDescription from "../controller/secondaryDescription/SwapSecondaryDescription";
import type DisplayNode from "./DisplayNode";
import TreeView from "./TreeView";

export default class HeapView extends TreeView {
  private static readonly SWAP_VALUES_HIGHLIGHT_COLOR = "green";
  private static readonly SWAP_VALUES_DESCRIPTION =
    "Swap values until the heap property is satisfied.";

  public insert(
    insertionInformation: HeapInsertionInformation<DisplayNode>,
  ): void {
    const {
      shapeAfterInitialInsertion,
      swapPath,
      insertedValue,
      insertedNode,
      insertedNodesParent,
      directionFromParentToNode,
    } = insertionInformation;

    if (directionFromParentToNode === "root") {
      this.animateSettingRoot(
        shapeAfterInitialInsertion,
        insertedNode,
        insertedValue,
      );
      return;
    }
    assert(
      insertedNodesParent != null,
      "Parent only be null if the root is being set",
    );

    this.pushInsertionItself(
      insertedValue,
      shapeAfterInitialInsertion,
      insertedNode,
      insertedNodesParent,
      directionFromParentToNode,
    );

    this.pushSwapPathAnimation(swapPath);
  }

  public delete(deletionInformation: any): void {
    throw new Error("Method not implemented.");
  }

  public find(findInformation: any): void {
    throw new Error("Method not implemented.");
  }

  private pushSwapPathAnimation(
    swapPath: Array<SwapPathInstruction<DisplayNode>>,
  ): void {
    for (const { node, parent, secondaryDescription } of swapPath) {
      this.pushReplaceOrSwapValues(
        "replace",
        node,
        parent,
        HeapView.SWAP_VALUES_HIGHLIGHT_COLOR,
        HeapView.SWAP_VALUES_DESCRIPTION,
        this.convertSecondaryDescriptionToString(secondaryDescription),
      );
    }
  }

  private convertSecondaryDescriptionToString(
    secondaryDescription: SwapSecondaryDescription,
  ): string {
    switch (secondaryDescription.type) {
      case "insert":
        switch (secondaryDescription.result) {
          case "swap":
            return `Swap because ${secondaryDescription.nodeValue} < ${secondaryDescription.parentValue}`;
          case "heap property satisfied":
            return `Don't swap because ${secondaryDescription.nodeValue} >= ${secondaryDescription.parentValue}`;
        }
        break;
    }
  }
}
