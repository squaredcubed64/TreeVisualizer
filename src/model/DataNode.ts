import ArrowDirection from "../controller/ArrowDirection";

/**
 * A node in the data structure. It contains a value and pointers to its left and right children.
 *
 * Also contains a height value, which its tree is responsible for updating.
 */
export default class DataNode {
  public value: number;
  public left: DataNode | null = null;
  public right: DataNode | null = null;
  /**
   * The number of vertices from this node to its deepest leaf. The node's tree is responsible for updating this value.
   */
  public height: number = 1;

  public constructor(value: number) {
    this.value = value;
  }

  /**
   * @param arrowDirection The direction of the traversal. Must not be PARENT_TO_CHILD.
   * @returns The nodes in the traversal, in the order they are visited.
   */
  public getTraversal(arrowDirection: ArrowDirection): DataNode[] {
    switch (arrowDirection) {
      case ArrowDirection.PREORDER:
        return this.getPreorderTraversal();
      case ArrowDirection.INORDER:
        return this.getInorderTraversal();
      case ArrowDirection.POSTORDER:
        return this.getPostorderTraversal();
      case ArrowDirection.PARENT_TO_CHILD:
        throw new Error("Cannot get traversal for parent to child");
      default:
        throw new Error("Invalid arrow direction");
    }
  }

  private getPreorderTraversal(): DataNode[] {
    const leftNodes = this.left != null ? this.left.getPreorderTraversal() : [];
    const rightNodes =
      this.right != null ? this.right.getPreorderTraversal() : [];
    return [this, ...leftNodes, ...rightNodes];
  }

  private getInorderTraversal(): DataNode[] {
    const leftNodes = this.left != null ? this.left.getInorderTraversal() : [];
    const rightNodes =
      this.right != null ? this.right.getInorderTraversal() : [];
    return [...leftNodes, this, ...rightNodes];
  }

  private getPostorderTraversal(): DataNode[] {
    const leftNodes =
      this.left != null ? this.left.getPostorderTraversal() : [];
    const rightNodes =
      this.right != null ? this.right.getPostorderTraversal() : [];
    return [...leftNodes, ...rightNodes, this];
  }
}
