import type DisplayNode from "../../view/DisplayNode";
import type DataNode from "../../model/DataNode";
import type RotationPathInstruction from "../pathInstruction/RotationPathInstruction";
import type BSTInsertionInformation from "./BSTInsertionInformation";

/**
 * The info the view needs to animate AVL insertion.
 */
export default interface AVLInsertionInformation<
  T extends DataNode | DisplayNode,
> extends BSTInsertionInformation<T> {
  /**
   * The path along which the AVL tree updates heights and rotates. It starts at the inserted node's parent and ends at the root.
   */
  rotationPath: Array<RotationPathInstruction<T>>;
}
