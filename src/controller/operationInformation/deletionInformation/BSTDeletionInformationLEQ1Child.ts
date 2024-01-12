import type BSTDeletionInformationBase from "./BSTDeletionInformationBase";
import type TreeShape from "../../TreeShape";
import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";

// The info the view gets from the controller when a node with 1 child or less is deleted
export default interface BSTDeletionInformationLEQ1Child<
  T extends DataNode | DisplayNode,
> extends BSTDeletionInformationBase<T> {
  type: "LEQ1Child";
  shape: TreeShape<T>;
  victimNode: T;
}
