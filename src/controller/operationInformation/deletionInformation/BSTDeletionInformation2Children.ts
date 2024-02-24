import type BSTDeletionInformation from "./BSTDeletionInformation";
import type BSTSuccessorSecondaryDescription from "../../secondaryDescription/BSTSuccessorSecondaryDescription";
import type TreeShape from "../../TreeShape";
import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";
import type BSTPathInstruction from "../../pathInstruction/BSTPathInstruction";

/**
 * The info the view needs to animate BST deletion when the victim has 2 children.
 */
export default interface BSTDeletionInformation2Children<
  T extends DataNode | DisplayNode,
> extends BSTDeletionInformation<T> {
  type: "2Children";
  shape: TreeShape<T>;
  victimNode: T;
  pathFromTargetsRightChildToSuccessor: Array<
    BSTPathInstruction<T, BSTSuccessorSecondaryDescription>
  >;
  successorNode: T;
}
