import type DisplayNode from './DisplayNode'

export default class DataNode {
  // DisplayNode holds the numeric value
  displayNode: DisplayNode
  left: DataNode | null
  right: DataNode | null

  constructor (value: DisplayNode) {
    this.displayNode = value
    this.left = null
    this.right = null
  }

  inorderTraversal (): DataNode[] {
    const leftNodes = (this.left != null) ? this.left.inorderTraversal() : []
    const rightNodes = (this.right != null) ? this.right.inorderTraversal() : []
    return [...leftNodes, this, ...rightNodes]
  }
}
