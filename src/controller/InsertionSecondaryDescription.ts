export default interface InsertionSecondaryDescription {
  type: 'insert'
  /**
   * The direction taken at this node.
   */
  direction: 'left' | 'right'
  targetValue: number
  nodeValue: number
}
