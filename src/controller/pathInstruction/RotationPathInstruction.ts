import type DataNode from "../../model/DataNode";
import type DisplayNode from "../../view/DisplayNode";
import type TreeShape from "../TreeShape";
import type RotationSecondaryDescription from "../secondaryDescription/RotationSecondaryDescription";

export default interface RotationPathInstruction<
  T extends DataNode | DisplayNode,
> {
  node: T;
  /**
   * An empty array means no rotation. A single element array means a single rotation. A two element array means a double rotation.
   */
  shapesAfterRotation: [] | [TreeShape<T>] | [TreeShape<T>, TreeShape<T>];
  secondaryDescription: RotationSecondaryDescription;
}
