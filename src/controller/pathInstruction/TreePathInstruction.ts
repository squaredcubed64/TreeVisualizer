import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";
import type TreeSecondaryDescription from "../secondaryDescription/TreeSecondaryDescription";

export default interface TreePathInstruction<
  T extends DataNode | DisplayNode,
  S extends TreeSecondaryDescription,
> {
  node: T;
  secondaryDescription: S;
}
