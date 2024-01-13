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
  protected readonly model: AVLModel = new AVLModel();
  protected readonly view: AVLView = new AVLView();

  protected translateInsertionInformation(
    modelInsertionInformation: AVLInsertionInformation<DataNode>,
  ): AVLInsertionInformation<DisplayNode> {
    const translatedModelInsertionInformation =
      super.translateInsertionInformation(modelInsertionInformation);
    const translatedRotationPath = this.translateRotationPath(
      modelInsertionInformation.rotationPath,
    );
    return {
      ...translatedModelInsertionInformation,
      rotationPath: translatedRotationPath,
    };
  }

  protected translateDeletionInformation(
    modelDeletionInformation: AVLDeletionInformation<DataNode>,
  ): AVLDeletionInformation<DisplayNode> {
    const translatedModelDeletionInformation =
      super.translateDeletionInformation(modelDeletionInformation);
    const translatedRotationPath = this.translateRotationPath(
      modelDeletionInformation.rotationPath,
    );
    return {
      ...translatedModelDeletionInformation,
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
