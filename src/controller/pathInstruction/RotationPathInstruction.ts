import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";
import type TreeShape from "../TreeShape";
import type RotationSecondaryDescription from "../secondaryDescription/RotationSecondaryDescription";
import type TreePathInstruction from "./TreePathInstruction";

/**
 * The information the View needs to animate one step of traversing the rotation path.
 *
 * Note: secondaryDescription contains the info needed to explain why an AVL rotation is or is not necessary at the node.
 */
export default interface RotationPathInstruction<
  T extends DataNode | DisplayNode,
> extends TreePathInstruction<T, RotationSecondaryDescription> {
  /**
   * An empty array means no rotation. A single element array means a single rotation. A two element array means a double rotation.
   */
  shapesAfterRotation: [] | [TreeShape<T>] | [TreeShape<T>, TreeShape<T>];
}
