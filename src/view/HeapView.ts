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

  private static readonly SWAPPED_TO_ROOT_PAUSE_DURATION_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly SWAPPED_tO_ROOT_DESCRIPTION =
    "The inserted value has been swapped to the root, so the heap property is satisfied.";

  public insert(
    insertionInformation: HeapInsertionInformation<DisplayNode>,
  ): void {
    const {
      shapeAfterInitialInsertion,
      swapPath,
      didSwapToRoot,
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

    if (didSwapToRoot) {
      this.pushPause(
        HeapView.SWAPPED_TO_ROOT_PAUSE_DURATION_MS,
        HeapView.SWAPPED_tO_ROOT_DESCRIPTION,
      );
    }
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
        "swap",
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
            return `Swap because ${secondaryDescription.initialNodeValue} < ${secondaryDescription.initialParentValue}`;
          case "heap property satisfied":
            return `Don't swap because ${secondaryDescription.initialNodeValue} >= ${secondaryDescription.initialParentValue}`;
        }
        break;
    }
  }
}
