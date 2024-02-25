import assert from "../../Assert";
import type HeapInsertionInformation from "../controller/operationInformation/HeapInsertionInformation";
import type HeapDeletionInformation from "../controller/operationInformation/deletionInformation/HeapDeletionInformation";
import type SwapPathInstruction from "../controller/pathInstruction/SwapPathInstruction";
import type SwapSecondaryDescription from "../controller/secondaryDescription/SwapSecondaryDescription";
import DisplayNode from "./DisplayNode";
import TreeView from "./TreeView";

export default class HeapView extends TreeView {
  private static readonly SWAPPED_TO_ROOT_PAUSE_DURATION_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly TIME_AFTER_ATTEMPT_TO_DELETE_FROM_EMPTY_HEAP_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly SWAPPED_TO_LEAF_PAUSE_DURATION_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly TIME_AFTER_ATTEMPT_TO_FIND_IN_EMPTY_HEAP_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly SWAP_VALUES_HIGHLIGHT_COLOR = "green";
  private static readonly REPLACE_ROOT_VALUE_HIGHLIGHT_COLOR = "green";
  private static readonly SWAP_VALUES_DESCRIPTION =
    "Swap values until the heap property is satisfied.";

  private static readonly REPLACE_ROOT_VALUE_DESCRIPTION =
    "Replace the root value with the last value in the heap.";

  private static readonly SWAPPED_TO_ROOT_DESCRIPTION =
    "The inserted value has been swapped to the root, so the heap property is satisfied.";

  private static readonly ATTEMPT_TO_DELETE_FROM_EMPTY_HEAP_DESCRIPTION =
    "Cannot delete from an empty heap.";

  private static readonly DELETE_FROM_SINGLETON_HEAP_DESCRIPTION =
    "The heap only has one value, so it is deleted.";

  private static readonly SWAPPED_TO_LEAF_DESCRIPTION =
    "The value has been swapped to a leaf, so the heap property is satisfied.";

  private static readonly DELETE_LEAF_DESCRIPTION =
    "Now that the leaf's value has been copied to the root, the leaf can be deleted.";

  private static readonly FOUND_ROOT_DESCRIPTION_START = "The root's value is ";

  private static readonly ATTEMPT_TO_FIND_IN_EMPTY_HEAP_DESCRIPTION =
    "Cannot find in an empty heap.";

  public insert(
    insertionInformation: HeapInsertionInformation<DisplayNode>,
  ): void {
    const {
      shapeAfterInsertion,
      swapPath,
      didSwapToRoot,
      insertedValue,
      insertedNode,
      insertedNodesParent,
      directionFromParentToNode,
    } = insertionInformation;

    if (directionFromParentToNode === "root") {
      this.animateSettingRoot(shapeAfterInsertion, insertedNode, insertedValue);
      return;
    }
    assert(
      insertedNodesParent != null,
      "Parent only be null if the root is being set",
    );

    this.pushInsertionItself(
      insertedValue,
      shapeAfterInsertion,
      insertedNode,
      insertedNodesParent,
      directionFromParentToNode,
    );

    this.pushSwapPathAnimation(swapPath);

    if (didSwapToRoot) {
      this.pushPause(
        HeapView.SWAPPED_TO_ROOT_PAUSE_DURATION_MS,
        HeapView.SWAPPED_TO_ROOT_DESCRIPTION,
      );
    }
  }

  public delete(
    deletionInformation: HeapDeletionInformation<DisplayNode>,
  ): void {
    const {
      deletedNode,
      rootAfterDeletion,
      shapeAfterDeletion,
      swapPath,
      didSwapToLeaf,
    } = deletionInformation;

    if (deletedNode == null) {
      this.functionQueue.push({
        func: () => {},
        timeAfterCallMs:
          HeapView.TIME_AFTER_ATTEMPT_TO_DELETE_FROM_EMPTY_HEAP_MS,
        description: HeapView.ATTEMPT_TO_DELETE_FROM_EMPTY_HEAP_DESCRIPTION,
      });
      return;
    } else if (rootAfterDeletion == null) {
      this.pushDeletionItself(
        deletedNode,
        shapeAfterDeletion,
        HeapView.DELETE_FROM_SINGLETON_HEAP_DESCRIPTION,
      );
      return;
    }

    this.pushReplaceOrSwapValues(
      "replace",
      deletedNode,
      rootAfterDeletion,
      HeapView.REPLACE_ROOT_VALUE_HIGHLIGHT_COLOR,
      HeapView.REPLACE_ROOT_VALUE_DESCRIPTION,
    );

    this.pushDeletionItself(
      deletedNode,
      shapeAfterDeletion,
      HeapView.DELETE_LEAF_DESCRIPTION,
    );

    this.pushSwapPathAnimation(swapPath);

    if (didSwapToLeaf) {
      this.pushPause(
        HeapView.SWAPPED_TO_LEAF_PAUSE_DURATION_MS,
        HeapView.SWAPPED_TO_LEAF_DESCRIPTION,
      );
    }
  }

  public find(findInformation: Record<string, unknown>): void {
    if (this.shape.inorderTraversal.length === 0) {
      this.functionQueue.push({
        func: () => {},
        timeAfterCallMs: HeapView.TIME_AFTER_ATTEMPT_TO_FIND_IN_EMPTY_HEAP_MS,
        description: HeapView.ATTEMPT_TO_FIND_IN_EMPTY_HEAP_DESCRIPTION,
      });
      return;
    }

    const root = this.shape.layers[0][0];
    this.functionQueue.push({
      func: () => {
        root.highlight(TreeView.HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND);
      },
      timeAfterCallMs: DisplayNode.DEFAULT_HIGHLIGHT_DURATION_MS,
      description: HeapView.FOUND_ROOT_DESCRIPTION_START + root.value + ".",
    });
  }

  private pushSwapPathAnimation(
    swapPath: Array<SwapPathInstruction<DisplayNode>>,
  ): void {
    for (const { node, parent, secondaryDescription } of swapPath) {
      this.pushReplaceOrSwapValues(
        secondaryDescription.result,
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
      case "delete":
        switch (secondaryDescription.result) {
          case "swap":
            return `Swap because ${secondaryDescription.initialNodeValue} < ${secondaryDescription.initialParentValue}.`;
          case "none":
            return `Don't swap because ${secondaryDescription.initialNodeValue} ≥ ${secondaryDescription.initialParentValue}.`;
        }
        break;
    }
  }
}
