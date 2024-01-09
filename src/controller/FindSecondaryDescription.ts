export default interface FindSecondaryDescription {
  type: 'find'
  /**
   * The direction taken at this node.
   */
  direction: 'left' | 'right' | 'stop'
  targetValue: number
  nodeValue: number
}
