import type BSTFindSecondaryDescription from "../secondaryDescription/BSTFindSecondaryDescription";
import type BSTOperationInformation from "./BSTOperationInformation";
import type BSTPathInstruction from "../pathInstruction/BSTPathInstruction";
import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";

/**
 * The info the view needs to animate the finding of a node.
 */
export default interface BSTFindInformation<T extends DataNode | DisplayNode>
  extends BSTOperationInformation<T> {
  pathFromRootToTarget: Array<
    BSTPathInstruction<T, BSTFindSecondaryDescription>
  >;
  nodeFound: T | null;
}
