export default interface AVLSecondaryDescription {
  type: 'avl'
  leftHeight: number
  rightHeight: number
  /**
   * The height of the left subtree minus the height of the right subtree at this node.
   */
  newBalanceFactor: number
  newHeight: number
}
