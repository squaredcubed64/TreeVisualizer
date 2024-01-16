import type BSTDeletionInformation from "./BSTDeletionInformation";
import type TreeShape from "../../TreeShape";
import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";

/**
 * The info the view needs to animate BST deletion when the victim has at most 1 child.
 */
export default interface BSTDeletionInformationLEQ1Child<
  T extends DataNode | DisplayNode,
> extends BSTDeletionInformation<T> {
  type: "LEQ1Child";
  shape: TreeShape<T>;
  victimNode: T;
}
