import AVLModel from "../model/AVLModel";
import type DataNode from "../model/DataNode";
import AVLView from "../view/AVLView";
import type DisplayNode from "../view/DisplayNode";
import BSTController from "./BSTController";
import type TreeShape from "./TreeShape";
import type AVLInsertionInformation from "./operationInformation/AVLInsertionInformation";
import type AVLDeletionInformation from "./operationInformation/deletionInformation/AVLDeletionInformation";
import type RotationPathInstruction from "./pathInstruction/RotationPathInstruction";

/**
 * The controller for the AVL tree. It is responsible for translating the model's return types into the view's parameter types
 */
export default class AVLController extends BSTController {
  protected readonly model: AVLModel = new AVLModel(this);
  protected readonly view: AVLView = new AVLView(this);

  protected translateInsertionInformation(
    insertionInformation: AVLInsertionInformation<DataNode>,
  ): AVLInsertionInformation<DisplayNode> {
    const translatedBSTInsertionInformation =
      super.translateInsertionInformation(insertionInformation);
    const translatedRotationPath = this.translateRotationPath(
      insertionInformation.rotationPath,
    );

    return {
      ...translatedBSTInsertionInformation,
      rotationPath: translatedRotationPath,
    };
  }

  protected translateDeletionInformation(
    deletionInformation: AVLDeletionInformation<DataNode>,
  ): AVLDeletionInformation<DisplayNode> {
    const translatedBSTDeletionInformation = super.translateDeletionInformation(
      deletionInformation,
    );
    const translatedRotationPath = this.translateRotationPath(
      deletionInformation.rotationPath,
    );

    return {
      ...translatedBSTDeletionInformation,
      rotationPath: translatedRotationPath,
    };
  }

  private translateRotationPath(
    rotationPath: Array<RotationPathInstruction<DataNode>>,
  ): Array<RotationPathInstruction<DisplayNode>> {
    return rotationPath.map((rotationPathInstruction) =>
      this.translateRotationPathInstruction(rotationPathInstruction),
    );
  }

  private translateRotationPathInstruction(
    rotationPathInstruction: RotationPathInstruction<DataNode>,
  ): RotationPathInstruction<DisplayNode> {
    const { node, shapesAfterRotation, secondaryDescription } =
      rotationPathInstruction;
    return {
      node: this.translateNode(node),
      shapesAfterRotation:
        this.translateShapesAfterRotation(shapesAfterRotation),
      secondaryDescription,
    };
  }

  private translateShapesAfterRotation(
    shapesAfterRotation:
      | []
      | [TreeShape<DataNode>]
      | [TreeShape<DataNode>, TreeShape<DataNode>],
  ):
    | []
    | [TreeShape<DisplayNode>]
    | [TreeShape<DisplayNode>, TreeShape<DisplayNode>] {
    return shapesAfterRotation.map((shape: TreeShape<DataNode>) =>
      this.translateShape(shape),
    ) as
      | []
      | [TreeShape<DisplayNode>]
      | [TreeShape<DisplayNode>, TreeShape<DisplayNode>];
  }
}
