import { assert } from '../Utils'
import type AVLInsertionInformation from '../controller/operationInformation/AVLInsertionInformation'
import DataNode from './DataNode'
import TreeModel from './TreeModel'

export default class AVLTreeModel extends TreeModel {
  root: DataNode | null = null

  private getHeight (node: DataNode | null): number {
    if (node === null) {
      return 0
    }
    return node.height
  }

  private updateHeight (node: DataNode): void {
    node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1
  }

  private getBalance (node: DataNode | null): number {
    if (node === null) {
      return 0
    }
    return this.getHeight(node.left) - this.getHeight(node.right)
  }

  private rotateRight (y: DataNode): DataNode {
    assert(y.left !== null, 'y.left is null')
    const x = y.left
    const T2 = x.right
    x.right = y
    y.left = T2
    this.updateHeight(y)
    this.updateHeight(x)
    return x
  }

  private rotateLeft (x: DataNode): DataNode {
    assert(x.right !== null, 'x.right is null')
    const y = x.right
    const T2 = y.left
    y.left = x
    x.right = T2
    this.updateHeight(x)
    this.updateHeight(y)
    return y
  }

  private insertNode (node: DataNode | null, value: number): { insertionInformation: AVLInsertionInformation<DataNode>, insertedNode: DataNode, resultantSubtree: DataNode } {
    if (node === null) {
      const insertedNode = new DataNode(value)
      const bstInsertionInformation = { path: [], shape: this.calculateShape(), value }
      const avlInsertionInformation = { bstInsertionInformation, rotationPath: [] }
      return { insertionInformation: avlInsertionInformation, insertedNode, resultantSubtree: insertedNode }
    }

    // Recursively get the insertion information, then add the current node to the start of the path
    let returnValue: { insertionInformation: AVLInsertionInformation<DataNode>, insertedNode: DataNode, resultantSubtree: DataNode }
    if (value < node.value) {
      returnValue = this.insertNode(node.left, value)
      returnValue.insertionInformation.bstInsertionInformation.path.unshift({ node, secondaryDescription: { type: 'insert', direction: 'left', targetValue: value, nodeValue: node.value } })
      node.left = returnValue.resultantSubtree
    } else {
      returnValue = this.insertNode(node.right, value)
      returnValue.insertionInformation.bstInsertionInformation.path.unshift({ node, secondaryDescription: { type: 'insert', direction: 'right', targetValue: value, nodeValue: node.value } })
      node.right = returnValue.resultantSubtree
    }
    const { insertionInformation, insertedNode } = returnValue

    this.updateHeight(node)

    const balance = this.getBalance(node)

    // If this node is unbalanced, there are 4 cases
    if (balance > 1) {
      assert(node.left !== null, 'node.left is null')
      if (value < node.left.value) {
        const resultantSubtree = this.rotateRight(node)
        const leftHeight = this.getHeight(node.left)
        const rightHeight = this.getHeight(node.right)
        insertionInformation.rotationPath.push({ node, shapesAfterRotation: [this.calculateShape()], secondaryDescription: { type: 'avl', leftHeight, rightHeight, newBalanceFactor: leftHeight - rightHeight, newHeight: this.getHeight(node) } })
        return { insertionInformation, insertedNode, resultantSubtree }
      } else {
        node.left = this.rotateLeft(node.left)
        const shapeAfterFirstRotation = this.calculateShape()
        const resultantSubtree = this.rotateRight(node)
        const leftHeight = this.getHeight(node.left)
        const rightHeight = this.getHeight(node.right)
        insertionInformation.rotationPath.push({ node, shapesAfterRotation: [shapeAfterFirstRotation, this.calculateShape()], secondaryDescription: { type: 'avl', leftHeight, rightHeight, newBalanceFactor: leftHeight - rightHeight, newHeight: this.getHeight(node) } })
        return { insertionInformation, insertedNode, resultantSubtree }
      }
    } else if (balance < -1) {
      assert(node.right !== null, 'node.right is null')
      if (value > node.right.value) {
        const resultantSubtree = this.rotateLeft(node)
        const leftHeight = this.getHeight(node.left)
        const rightHeight = this.getHeight(node.right)
        insertionInformation.rotationPath.push({ node, shapesAfterRotation: [this.calculateShape()], secondaryDescription: { type: 'avl', leftHeight, rightHeight, newBalanceFactor: leftHeight - rightHeight, newHeight: this.getHeight(node) } })
        return { insertionInformation, insertedNode, resultantSubtree }
      } else {
        node.right = this.rotateRight(node.right)
        const shapeAfterFirstRotation = this.calculateShape()
        const resultantSubtree = this.rotateLeft(node)
        const leftHeight = this.getHeight(node.left)
        const rightHeight = this.getHeight(node.right)
        insertionInformation.rotationPath.push({ node, shapesAfterRotation: [shapeAfterFirstRotation, this.calculateShape()], secondaryDescription: { type: 'avl', leftHeight, rightHeight, newBalanceFactor: leftHeight - rightHeight, newHeight: this.getHeight(node) } })
        return { insertionInformation, insertedNode, resultantSubtree }
      }
    }

    insertionInformation.rotationPath.push({ node, shapesAfterRotation: [], secondaryDescription: { type: 'avl', leftHeight: this.getHeight(node.left), rightHeight: this.getHeight(node.right), newBalanceFactor: balance, newHeight: this.getHeight(node) } })

    return { insertionInformation, insertedNode, resultantSubtree: node }
  }

  public insert (value: number): { insertionInformation: AVLInsertionInformation<DataNode>, insertedNode: DataNode } {
    const { insertionInformation, insertedNode, resultantSubtree } = this.insertNode(this.root, value)
    this.root = resultantSubtree
    return { insertionInformation, insertedNode }
  }

  /* private minValueNode (node: DataNode): DataNode {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private deleteNode (root: DataNode | null, value: number): DataNode | null {
    if (root === null) {
      return root
    }

    if (value < root.value) {
      root.left = this.deleteNode(root.left, value)
    } else if (value > root.value) {
      root.right = this.deleteNode(root.right, value)
    } else {
      if ((root.left === null) || (root.right === null)) {
        let temp: DataNode | null = null
        if (temp === root.left) {
          temp = root.right
        } else {
          temp = root.left
        }

        if (temp === null) {
          temp = root
          root = null
        } else {
          root = temp
        }
      } else {
        const temp = this.minValueNode(root.right)
        root.value = temp.value
        root.right = this.deleteNode(root.right, temp.value)
      }
    }

    if (root === null) {
      return root
    }

    this.updateHeight(root)

    const balance = this.getBalance(root)

    if (balance > 1) {
      if (this.getBalance(root.left) >= 0) {
        return this.rotateRight(root)
      } else {
        assert(root.left !== null, 'root.left is null')
        root.left = this.rotateLeft(root.left)
        return this.rotateRight(root)
      }
    }

    if (balance < -1) {
      if (this.getBalance(root.right) <= 0) {
        return this.rotateLeft(root)
      } else {
        assert(root.right !== null, 'root.right is null')
        root.right = this.rotateRight(root.right)
        return this.rotateLeft(root)
      }
    }

    return root
  }

  public delete (value: number): void {
    this.root = this.deleteNode(this.root, value)
  } */
}
