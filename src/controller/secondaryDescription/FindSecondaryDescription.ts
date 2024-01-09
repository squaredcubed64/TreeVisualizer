/**
 * The secondary description for finding the target node in find() and delete().
 */
export default interface FindSecondaryDescription {
  type: 'find'
  /**
   * The direction taken at this node.
   */
  direction: 'left' | 'right' | 'stop'
  targetValue: number
  nodeValue: number
}
