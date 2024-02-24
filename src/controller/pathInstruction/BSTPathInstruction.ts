import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";
import type BSTSecondaryDescriptionVariant from "../secondaryDescription/BSTSecondaryDescriptionVariant";
import type TreePathInstruction from "./TreePathInstruction";

export default interface BSTPathInstruction<
  T extends DataNode | DisplayNode,
  U extends BSTSecondaryDescriptionVariant,
> extends TreePathInstruction<T> {
  secondaryDescription: U;
}
