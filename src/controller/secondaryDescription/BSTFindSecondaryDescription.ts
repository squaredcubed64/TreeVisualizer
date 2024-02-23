import type TreeSecondaryDescription from "./TreeSecondaryDescription";

/**
 * The secondary description for finding the target node in find() and delete().
 */
export default interface BSTFindSecondaryDescription
  extends TreeSecondaryDescription {
  type: "find";
  /**
   * The direction taken at this node.
   */
  direction: "left" | "right" | "stop";
  targetValue: number;
  nodeValue: number;
}
