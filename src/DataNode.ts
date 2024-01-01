import type DisplayNode from './DisplayNode'
import { ArrowDirection } from './constants'

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

  getPreorderTraversal (): DataNode[] {
    const leftNodes = (this.left != null) ? this.left.getPreorderTraversal() : []
    const rightNodes = (this.right != null) ? this.right.getPreorderTraversal() : []
    return [this, ...leftNodes, ...rightNodes]
  }

  getInorderTraversal (): DataNode[] {
    const leftNodes = (this.left != null) ? this.left.getInorderTraversal() : []
    const rightNodes = (this.right != null) ? this.right.getInorderTraversal() : []
    return [...leftNodes, this, ...rightNodes]
  }

  getPostorderTraversal (): DataNode[] {
    const leftNodes = (this.left != null) ? this.left.getPostorderTraversal() : []
    const rightNodes = (this.right != null) ? this.right.getPostorderTraversal() : []
    return [...leftNodes, ...rightNodes, this]
  }

  getTraversal (arrowDirection: ArrowDirection): DataNode[] {
    switch (arrowDirection) {
      case ArrowDirection.PREORDER:
        return this.getPreorderTraversal()
      case ArrowDirection.INORDER:
        return this.getInorderTraversal()
      case ArrowDirection.POSTORDER:
        return this.getPostorderTraversal()
      case ArrowDirection.PARENT_TO_CHILD:
        throw new Error('Cannot get traversal for parent to child')
      default:
        throw new Error('Invalid arrow direction')
    }
  }

  isParentOf (node: DataNode): boolean {
    return this.left === node || this.right === node
  }
}
