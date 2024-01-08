import ArrowDirection from '../controller/ArrowDirection'

export default class DataNode {
  value: number
  left: DataNode | null
  right: DataNode | null

  constructor (value: number) {
    this.value = value
    this.left = null
    this.right = null
  }

  private getPreorderTraversal (): DataNode[] {
    const leftNodes = (this.left != null) ? this.left.getPreorderTraversal() : []
    const rightNodes = (this.right != null) ? this.right.getPreorderTraversal() : []
    return [this, ...leftNodes, ...rightNodes]
  }

  private getInorderTraversal (): DataNode[] {
    const leftNodes = (this.left != null) ? this.left.getInorderTraversal() : []
    const rightNodes = (this.right != null) ? this.right.getInorderTraversal() : []
    return [...leftNodes, this, ...rightNodes]
  }

  private getPostorderTraversal (): DataNode[] {
    const leftNodes = (this.left != null) ? this.left.getPostorderTraversal() : []
    const rightNodes = (this.right != null) ? this.right.getPostorderTraversal() : []
    return [...leftNodes, ...rightNodes, this]
  }

  public getTraversal (arrowDirection: ArrowDirection): DataNode[] {
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
