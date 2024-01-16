import type TreeShape from "../controller/TreeShape";
import type AVLInsertionInformation from "../controller/operationInformation/AVLInsertionInformation";
import type AVLDeletionInformation from "../controller/operationInformation/deletionInformation/AVLDeletionInformation";
import type RotationPathInstruction from "../controller/pathInstruction/RotationPathInstruction";
import type RotationSecondaryDescription from "../controller/secondaryDescription/RotationSecondaryDescription";
import BSTView from "./BSTView";
import { DURATION_MULTIPLIER } from "./Constants";
import DisplayNode from "./DisplayNode";

/**
 * Handles the animation of AVL operations.
 */
export default class AVLView extends BSTView {
  private static readonly FRAMES_AFTER_ROTATION = DURATION_MULTIPLIER * 60;
  private static readonly ROTATION_PATH_HIGHLIGHT_DURATION =
    DURATION_MULTIPLIER * 120;

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
    this.pushRotationPathOntoFunctionQueue(
      viewInsertionInformation.rotationPath,
    );
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
    // Helper
    const pushRotationOntoFunctionQueue = (
      shapeAfterRotation: TreeShape<DisplayNode>,
      secondaryDescription: string,
    ): void => {
      this.functionQueue.push({
        framesToWait: 0,
        func: () => {
          this.animateShapeChange(shapeAfterRotation);
        },
        framesAfterCall:
          DisplayNode.MOVE_DURATION_FRAMES + AVLView.FRAMES_AFTER_ROTATION,
        description: AVLView.ROTATION_PATH_DESCRIPTION,
        secondaryDescription,
      });
    };

    for (const rotationPathInstruction of rotationPath) {
      const { node, shapesAfterRotation, secondaryDescription } =
        rotationPathInstruction;

      // Highlight the node and explain if a rotation must be performed and why
      this.functionQueue.push({
        framesToWait: BSTView.FRAMES_BETWEEN_HIGHLIGHTS,
        func: () => {
          node.highlight(
            AVLView.ROTATION_PATH_HIGHLIGHT_COLOR,
            AVLView.ROTATION_PATH_HIGHLIGHT_DURATION,
          );
        },
        framesAfterCall: AVLView.ROTATION_PATH_HIGHLIGHT_DURATION,
        description: AVLView.ROTATION_PATH_DESCRIPTION,
        secondaryDescription:
          AVLView.convertRotationSecondaryDescriptionToString(
            secondaryDescription,
          ),
      });

      // Animate the rotation(s)
      if (shapesAfterRotation.length === 1) {
        pushRotationOntoFunctionQueue(shapesAfterRotation[0], "Rotation");
      } else if (shapesAfterRotation.length === 2) {
        pushRotationOntoFunctionQueue(shapesAfterRotation[0], "First rotation");
        pushRotationOntoFunctionQueue(
          shapesAfterRotation[1],
          "Second rotation",
        );
      }
    }
  }
}
