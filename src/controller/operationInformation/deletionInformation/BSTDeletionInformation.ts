import type BSTFindSecondaryDescription from "../../secondaryDescription/BSTFindSecondaryDescription";
import type BSTOperationInformation from "../BSTOperationInformation";
import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";
import type TreePathInstruction from "../../pathInstruction/TreePathInstruction";

/**
 * This interface is not used directly. Rather, it is extended by interfaces that represent each deletion case.
 */
export default interface BSTDeletionInformation<
  T extends DataNode | DisplayNode,
> extends BSTOperationInformation<T> {
  type: string;
  pathFromRootToTarget: Array<
    TreePathInstruction<T, BSTFindSecondaryDescription>
  >;
}
