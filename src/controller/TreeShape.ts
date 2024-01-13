import type DataNode from "../model/DataNode";
import type DisplayNode from "../view/DisplayNode";

/**
 * The information the View needs to draw the tree.
 */
export default interface TreeShape<T extends DataNode | DisplayNode> {
  inorderTraversal: T[];
  layers: T[][];
  arrows: Set<[T, T]>;
}
