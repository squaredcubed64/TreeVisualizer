import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";
import type TreeShape from "../TreeShape";
import type SwapSecondaryDescription from "../secondaryDescription/SwapSecondaryDescription";
import type TreePathInstruction from "./TreePathInstruction";

export default interface SwapPathInstruction<T extends DataNode | DisplayNode>
  extends TreePathInstruction<T, SwapSecondaryDescription> {
  parent: T;
  // todo attempt to remove
  shapeAfterSwap: TreeShape<T>;
}
