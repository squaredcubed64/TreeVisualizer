export default interface AVLSecondaryDescription {
  type: 'avl'
  /**
   * The direction taken at this node.
   */
  direction: 'left' | 'right' | 'stop'
  targetValue: number
  nodeValue: number
}
