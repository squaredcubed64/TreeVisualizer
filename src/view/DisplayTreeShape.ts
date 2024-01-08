import type DisplayNode from './DisplayNode'

/**
 * All the information needed to draw the tree
 */
export default interface DisplayTreeShape {
  inorderTraversal: DisplayNode[]
  layers: DisplayNode[][]
  arrows: Set<[DisplayNode, DisplayNode]>
}
