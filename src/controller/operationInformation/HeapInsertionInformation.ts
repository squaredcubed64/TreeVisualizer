import type BSTInsertionSecondaryDescription from "../secondaryDescription/BSTInsertionSecondaryDescription";
import type BSTOperationInformation from "./BSTOperationInformation";
import type BSTPathInstruction from "../pathInstruction/BSTPathInstruction";
import type TreeShape from "../TreeShape";
import type DisplayNode from "../../view/DisplayNode";
import type DataNode from "../../model/DataNode";

/**
 * The info the view needs to animate the insertion of a node.
 */
export default interface HeapInsertionInformation<
  T extends DataNode | DisplayNode,
> extends BSTOperationInformation<T> {
  pathFromRootToTarget: Array<
    BSTPathInstruction<T, BSTInsertionSecondaryDescription>
  >;
  shape: TreeShape<T>;
  value: number;
}
