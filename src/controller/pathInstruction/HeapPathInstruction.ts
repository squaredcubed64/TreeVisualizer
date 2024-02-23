import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";
import type TreeShape from "../TreeShape";
import type HeapInsertionSecondaryDescription from "../secondaryDescription/HeapInsertionSecondaryDescription";
import type TreePathInstruction from "./TreePathInstruction";

export default interface SwapPathInstruction<T extends DataNode | DisplayNode>
  extends TreePathInstruction<T, HeapInsertionSecondaryDescription> {
  parent: T;
  shapeAfterSwap: TreeShape<T>;
}
