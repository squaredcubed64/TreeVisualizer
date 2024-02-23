import type BSTInsertionSecondaryDescription from "../secondaryDescription/BSTInsertionSecondaryDescription";
import type BSTOperationInformation from "./BSTOperationInformation";
import type TreeShape from "../TreeShape";
import type DisplayNode from "../../view/DisplayNode";
import type DataNode from "../../model/DataNode";
import type TreePathInstruction from "../pathInstruction/TreePathInstruction";

/**
 * The info the view needs to animate the insertion of a node.
 */
export default interface BSTInsertionInformation<
  T extends DataNode | DisplayNode,
> extends BSTOperationInformation<T> {
  pathFromRootToTarget: Array<
    TreePathInstruction<T, BSTInsertionSecondaryDescription>
  >;
  shape: TreeShape<T>;
  value: number;
}
