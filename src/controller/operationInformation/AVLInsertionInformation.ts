import type DisplayNode from "../../view/DisplayNode";
import type DataNode from "../../model/DataNode";
import type RotationPathInstruction from "../pathInstruction/RotationPathInstruction";
import type BSTInsertionInformation from "./BSTInsertionInformation";

// The info the model sends to the controller when a node is inserted
export default interface AVLInsertionInformation<
  T extends DataNode | DisplayNode,
> extends BSTInsertionInformation<T> {
  // TODO check if this jsdoc is accurate
  /**
   * The path along which the AVL tree updates heights and rotates. It starts at the inserted node's parent and ends at the root.
   */
  rotationPath: Array<RotationPathInstruction<T>>;
}
