import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";
import type TreePathInstruction from "../pathInstruction/TreePathInstruction";
import type BSTFindSecondaryDescription from "../secondaryDescription/BSTFindSecondaryDescription";
import type BSTInsertionSecondaryDescription from "../secondaryDescription/BSTInsertionSecondaryDescription";

/**
 * This interface is not used directly. Rather, it is extended by interfaces that represent each operation case.
 */
export default interface BSTOperationInformation<
  T extends DataNode | DisplayNode,
> {
  /**
   * The nodes that were visited during the operation. Starts with the root node and ends with the target node,
   * unless the target node was not found or the operation is insert (which has no target node)
   */
  pathFromRootToTarget: Array<
    TreePathInstruction<
      T,
      BSTInsertionSecondaryDescription | BSTFindSecondaryDescription
    >
  >;
}
