import type TreeShape from "../controller/TreeShape";
import type AVLInsertionInformation from "../controller/operationInformation/AVLInsertionInformation";
import type AVLDeletionInformation from "../controller/operationInformation/deletionInformation/AVLDeletionInformation";
import type RotationPathInstruction from "../controller/pathInstruction/RotationPathInstruction";
import type RotationSecondaryDescription from "../controller/secondaryDescription/RotationSecondaryDescription";
import BSTView from "./BSTView";
import DisplayNode from "./DisplayNode";
import TreeView from "./TreeView";

/**
 * Handles the animation of AVL operations.
 */
export default class AVLView extends BSTView {
  private static readonly TIME_AFTER_ROTATION_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly ROTATION_PATH_HIGHLIGHT_DURATION_MS =
    TreeView.DURATION_MULTIPLIER * 2000;

  private static readonly ROTATION_PATH_HIGHLIGHT_COLOR = "red";
  private static readonly ROTATION_PATH_DESCRIPTION =
    "Go back up the tree, rotating nodes as necessary to maintain the AVL property.";

  /**
   * @param secondaryDescription Additional information about the rotation.
   * @returns A string describing why the rotation is or is not performed.
   */
  private static convertRotationSecondaryDescriptionToString(
    secondaryDescription: RotationSecondaryDescription,
  ): string {
    const { leftHeight, rightHeight, newHeight, newBalanceFactor } =
      secondaryDescription;
    let out = "";
    out += `The node's height is Max(${leftHeight}, ${rightHeight}) + 1 = ${newHeight}. The node's balance factor is ${leftHeight} - ${rightHeight} = ${newBalanceFactor}. `;
    if (newBalanceFactor < -1) {
      out += "Rotate because balance factor < -1.";
    } else if (newBalanceFactor > 1) {
      out += "Rotate because balance factor > 1.";
    } else {
      out += "Do not rotate because balance factor is between -1 and 1.";
    }
    return out;
  }

  /**
   * Animates the BST insertion, then animates checking the AVL property and rotating if necessary.
   * @param viewInsertionInformation The information the view needs to insert a node.
   */
  public insert(
    viewInsertionInformation: AVLInsertionInformation<DisplayNode>,
  ): void {
    super.insert(viewInsertionInformation);
    if (viewInsertionInformation.rotationPath.length > 0) {
      this.pushRotationPathOntoFunctionQueue(
        viewInsertionInformation.rotationPath,
      );
    }
  }

  /**
   * Animates the BST deletion, then animates checking the AVL property and rotating if necessary.
   * @param viewDeletionInformation The information the view needs to delete a node.
   */
  public delete(
    viewDeletionInformation: AVLDeletionInformation<DisplayNode>,
  ): void {
    super.delete(viewDeletionInformation);
    this.pushRotationPathOntoFunctionQueue(
      viewDeletionInformation.rotationPath,
    );
  }

  /**
   * Pushes methods onto functionQueue to highlight nodes along rotationPath and explain why rotations are or aren't performed.
   * @param rotationPath The path along which the AVL tree updates heights and rotates. It starts at the inserted node's parent and ends at the root.
   */
  private pushRotationPathOntoFunctionQueue(
    rotationPath: Array<RotationPathInstruction<DisplayNode>>,
  ): void {
    // Pause for a bit before going back up the tree
    this.functionQueue.push({
      func: () => {},
      timeAfterCallMs: BSTView.TIME_BETWEEN_HIGHLIGHTS_MS,
      description: AVLView.ROTATION_PATH_DESCRIPTION,
    });

    for (const rotationPathInstruction of rotationPath) {
      const { node, shapesAfterRotation, secondaryDescription } =
        rotationPathInstruction;

      // Highlight the node and explain if a rotation must be performed and why
      this.functionQueue.push({
        func: () => {
          node.highlight(
            AVLView.ROTATION_PATH_HIGHLIGHT_COLOR,
            AVLView.ROTATION_PATH_HIGHLIGHT_DURATION_MS,
          );
        },
        timeAfterCallMs:
          AVLView.ROTATION_PATH_HIGHLIGHT_DURATION_MS +
          BSTView.TIME_BETWEEN_HIGHLIGHTS_MS,
        description: AVLView.ROTATION_PATH_DESCRIPTION,
        secondaryDescription:
          AVLView.convertRotationSecondaryDescriptionToString(
            secondaryDescription,
          ),
      });

      // Animate the rotation(s)
      if (shapesAfterRotation.length === 1) {
        this.pushRotationOntoFunctionQueue(
          shapesAfterRotation[0],
          "Perform a rotation.",
        );
      } else if (shapesAfterRotation.length === 2) {
        this.pushRotationOntoFunctionQueue(
          shapesAfterRotation[0],
          "Perform the first rotation.",
        );
        this.pushRotationOntoFunctionQueue(
          shapesAfterRotation[1],
          "Perform the second rotation.",
        );
      }
    }
  }

  private pushRotationOntoFunctionQueue(
    shapeAfterRotation: TreeShape<DisplayNode>,
    secondaryDescription: string,
  ): void {
    this.functionQueue.push({
      func: () => {
        this.animateShapeChange(shapeAfterRotation);
      },
      timeAfterCallMs:
        DisplayNode.MOVE_DURATION_MS + AVLView.TIME_AFTER_ROTATION_MS,
      description: AVLView.ROTATION_PATH_DESCRIPTION,
      secondaryDescription,
    });
  }
}
