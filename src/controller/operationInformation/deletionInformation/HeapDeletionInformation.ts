import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";
import type TreeShape from "../../TreeShape";
import type SwapPathInstruction from "../../pathInstruction/SwapPathInstruction";

export default interface HeapDeletionInformation<
  T extends DataNode | DisplayNode,
> {
  shapeAfterInitialDeletion: TreeShape<T>;
  swapPath: Array<SwapPathInstruction<T>>;
  didSwapToLeaf: boolean;
}
