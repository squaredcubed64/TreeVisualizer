/**
 * The secondary description for finding where to insert in insert().
 */
export default interface InsertionSecondaryDescription {
  type: 'insert'
  /**
   * The direction taken at this node.
   */
  direction: 'left' | 'right'
  targetValue: number
  nodeValue: number
}
