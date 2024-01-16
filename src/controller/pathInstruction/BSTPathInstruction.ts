import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";
import type BSTSecondaryDescriptionVariant from "../secondaryDescription/BSTSecondaryDescriptionVariant";

/**
 * The information the View needs to animate one step of traversing a path down the tree.
 */
export default interface BSTPathInstruction<
  T extends DataNode | DisplayNode,
  S extends BSTSecondaryDescriptionVariant,
> {
  node: T;
  /**
   * The info needed to explain why the path goes left, right, or stops.
   */
  secondaryDescription: S;
}
