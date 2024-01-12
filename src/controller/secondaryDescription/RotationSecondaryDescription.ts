/**
 * Explains why an AVL tree rotation is necessary.
 */
export default interface RotationSecondaryDescription {
  type: "rotation";
  leftHeight: number;
  rightHeight: number;
  /**
   * The height of the left subtree minus the height of the right subtree at this node.
   */
  newBalanceFactor: number;
  newHeight: number;
}
