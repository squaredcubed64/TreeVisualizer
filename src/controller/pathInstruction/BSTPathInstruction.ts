import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";
import type BSTSecondaryDescription from "../secondaryDescription/BSTSecondaryDescription";

/**
 * The information the View needs to animate one step of traversing a path down the tree.
 */
export default interface BSTPathInstruction<
  T extends DataNode | DisplayNode,
  S extends BSTSecondaryDescription,
> {
  node: T;
  /**
   * The info needed to explain why the path goes left, right, or stops.
   */
  secondaryDescription: S;
}
