import type DataNode from "../model/DataNode";
import type DisplayNode from "../view/DisplayNode";
import BSTModel from "../model/BSTModel";
import BSTView from "../view/BSTView";
import type ArrowDirection from "./ArrowDirection";
import type BSTInsertionInformation from "./operationInformation/BSTInsertionInformation";
import type BSTFindInformation from "./operationInformation/BSTFindInformation";
import type BSTSecondaryDescriptionVariant from "./secondaryDescription/BSTSecondaryDescriptionVariant";
import TreeController from "./TreeController";
import type BSTDeletionInformationVariant from "./operationInformation/deletionInformation/BSTDeletionInformationVariant";
import type TreePathInstruction from "./pathInstruction/TreePathInstruction";

/**
 * The controller for the BST. It is responsible for translating the model's return types into the view's parameter types
 */
export default class BSTController extends TreeController {
  protected readonly model: BSTModel = new BSTModel(this);
  protected readonly view: BSTView = new BSTView(this);

  public setArrowDirection(arrowDirection: ArrowDirection): void {
    this.model.arrowDirection = arrowDirection;
    this.view.setArrows(this.translateArrows(this.model.getArrows()));
  }

  public getArrowDirection(): ArrowDirection {
    return this.model.arrowDirection;
  }

  protected translateInsertionInformation(
    insertionInformation: BSTInsertionInformation<DataNode>,
  ): BSTInsertionInformation<DisplayNode> {
    const { shape, pathFromRootToTarget, value } = insertionInformation;
    return {
      shape: this.translateShape(shape),
      pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
      value,
    };
  }

  protected translateDeletionInformation(
    deletionInformation: BSTDeletionInformationVariant<DataNode>,
  ): BSTDeletionInformationVariant<DisplayNode> {
    switch (deletionInformation.type) {
      case "LEQ1Child": {
        const { shape, pathFromRootToTarget, victimNode } = deletionInformation;
        return {
          type: "LEQ1Child",
          shape: this.translateShape(shape),
          pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
          victimNode: this.translateNode(victimNode),
        };
      }
      case "2Children": {
        const {
          shape,
          pathFromRootToTarget,
          victimNode,
          pathFromTargetsRightChildToSuccessor,
          successorNode,
        } = deletionInformation;
        return {
          type: "2Children",
          shape: this.translateShape(shape),
          pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
          victimNode: this.translateNode(victimNode),
          pathFromTargetsRightChildToSuccessor: this.translatePath(
            pathFromTargetsRightChildToSuccessor,
          ),
          successorNode: this.translateNode(successorNode),
        };
      }
      case "VictimNotFound": {
        const { pathFromRootToTarget } = deletionInformation;
        return {
          type: "VictimNotFound",
          pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
        };
      }
    }
  }

  protected translateFindInformation(
    findInformation: BSTFindInformation<DataNode>,
  ): BSTFindInformation<DisplayNode> {
    const { pathFromRootToTarget, nodeFound } = findInformation;
    return {
      pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
      nodeFound: nodeFound !== null ? this.translateNode(nodeFound) : null,
    };
  }

  private translatePath<S extends BSTSecondaryDescriptionVariant>(
    path: Array<TreePathInstruction<DataNode, S>>,
  ): Array<TreePathInstruction<DisplayNode, S>> {
    return path.map((pathInstruction) => {
      const { node, secondaryDescription } = pathInstruction;
      return { node: this.translateNode(node), secondaryDescription };
    });
  }
}
