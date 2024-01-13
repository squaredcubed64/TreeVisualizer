/**
 * The info needed to explain why an AVL tree rotation is or is not necessary at a node.
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
