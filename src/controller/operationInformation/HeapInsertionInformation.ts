import type TreeShape from "../TreeShape";
import type DisplayNode from "../../view/DisplayNode";
import type DataNode from "../../model/DataNode";
import type HeapPathInstruction from "../pathInstruction/HeapPathInstruction";
import type TreeInsertionInformation from "./TreeInsertionInformation";

export default interface HeapInsertionInformation<
  T extends DataNode | DisplayNode,
> extends TreeInsertionInformation<T> {
  shapeAfterInitialInsertion: TreeShape<T>;
  swapPath: Array<HeapPathInstruction<T>>;
}
