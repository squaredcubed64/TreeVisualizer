import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";
import type BSTDeletionInformationBase from "./BSTDeletionInformationBase";

// The info the model sends to the controller when the victim node is not found
export default interface BSTDeletionInformationVictimNotFound<
  T extends DataNode | DisplayNode,
> extends BSTDeletionInformationBase<T> {
  type: "VictimNotFound";
  // The shape won't change, so it's not included
}
