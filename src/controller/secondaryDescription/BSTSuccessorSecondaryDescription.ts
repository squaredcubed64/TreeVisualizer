import type TreeSecondaryDescription from "./TreeSecondaryDescription";

export default interface BSTSuccessorSecondaryDescription
  extends TreeSecondaryDescription {
  type: "successor";
  /**
   * The direction taken at this node.
   */
  direction: "left" | "stop";
}
