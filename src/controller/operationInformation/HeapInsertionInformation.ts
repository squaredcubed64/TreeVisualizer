import type TreeShape from "../TreeShape";
import type DisplayNode from "../../view/DisplayNode";
import type DataNode from "../../model/DataNode";
import type HeapPathInstruction from "../pathInstruction/HeapPathInstruction";

export default interface HeapInsertionInformation<
  T extends DataNode | DisplayNode,
> {
  shapeAfterInitialInsertion: TreeShape<T>;
  swapPath: Array<HeapPathInstruction<T>>;
}
