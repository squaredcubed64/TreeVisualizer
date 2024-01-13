import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";
import type RotationPathInstruction from "../../pathInstruction/RotationPathInstruction";
import type BSTDeletionInformation from "./BSTDeletionInformation";

/**
 * The info the view needs to animate the deletion of a node.
 */
type AVLDeletionInformation<T extends DataNode | DisplayNode> =
  BSTDeletionInformation<T> & {
    rotationPath: Array<RotationPathInstruction<T>>;
  };

export default AVLDeletionInformation;
