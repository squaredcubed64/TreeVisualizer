export default interface BSTSuccessorSecondaryDescription {
  type: "successor";
  /**
   * The direction taken at this node.
   */
  direction: "left" | "stop";
}
