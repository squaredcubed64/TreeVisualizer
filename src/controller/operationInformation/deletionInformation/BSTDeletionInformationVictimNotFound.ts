import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";
import type BSTDeletionInformation from "./BSTDeletionInformation";

/**
 * The info the view needs to animate BST deletion when the victim is not found.
 */
export default interface BSTDeletionInformationVictimNotFound<
  T extends DataNode | DisplayNode,
> extends BSTDeletionInformation<T> {
  type: "VictimNotFound";
  // The shape won't change, so it's not included
}
