import type BSTFindSecondaryDescription from "../../secondaryDescription/BSTFindSecondaryDescription";
import type BSTOperationInformation from "../BSTOperationInformation";
import type BSTPathInstruction from "../../pathInstruction/BSTPathInstruction";
import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";

/**
 * This interface is not used directly. Rather, it is extended by interfaces that represent each deletion case.
 */
export default interface BSTDeletionInformation<
  T extends DataNode | DisplayNode,
> extends BSTOperationInformation<T> {
  type: string;
  pathFromRootToTarget: Array<
    BSTPathInstruction<T, BSTFindSecondaryDescription>
  >;
}
