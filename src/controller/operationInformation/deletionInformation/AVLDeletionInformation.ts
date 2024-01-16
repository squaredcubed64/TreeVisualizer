import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";
import type RotationPathInstruction from "../../pathInstruction/RotationPathInstruction";
import type BSTDeletionInformationVariant from "./BSTDeletionInformationVariant";

/**
 * The info the view needs to animate the deletion of a node.
 */
type AVLDeletionInformation<T extends DataNode | DisplayNode> =
  BSTDeletionInformationVariant<T> & {
    rotationPath: Array<RotationPathInstruction<T>>;
  };

export default AVLDeletionInformation;
