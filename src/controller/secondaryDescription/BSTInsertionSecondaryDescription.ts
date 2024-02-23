import type TreeSecondaryDescription from "./TreeSecondaryDescription";

/**
 * The secondary description for finding where to insert in insert().
 */
export default interface BSTInsertionSecondaryDescription
  extends TreeSecondaryDescription {
  type: "insert";
  /**
   * The direction taken at this node.
   */
  direction: "left" | "right";
  targetValue: number;
  nodeValue: number;
}
