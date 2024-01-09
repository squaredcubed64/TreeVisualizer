import { assert } from '../Utils'
import DataNode from './DataNode'

export default class AVLTreeModel {
  root: DataNode | null = null

  getHeight (node: DataNode | null): number {
    if (node === null) {
      return 0
    }
    return node.height
  }

  updateHeight (node: DataNode): void {
    node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1
  }

  getBalance (node: DataNode | null): number {
    if (node === null) {
      return 0
    }
    return this.getHeight(node.left) - this.getHeight(node.right)
  }

  rotateRight (y: DataNode): DataNode {
    assert(y.left !== null, 'y.left is null')
    const x = y.left
    const T2 = x.right
    x.right = y
    y.left = T2
    this.updateHeight(y)
    this.updateHeight(x)
    return x
  }

  rotateLeft (x: DataNode): DataNode {
    assert(x.right !== null, 'x.right is null')
    const y = x.right
    const T2 = y.left
    y.left = x
    x.right = T2
    this.updateHeight(x)
    this.updateHeight(y)
    return y
  }

  insertNode (node: DataNode | null, value: number): DataNode {
    if (node === null) {
      return new DataNode(value)
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value)
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value)
    } else {
      return node
    }

    this.updateHeight(node)

    const balance = this.getBalance(node)

    if (balance > 1) {
      assert(node.left !== null, 'node.left is null')
      if (value < node.left.value) {
        return this.rotateRight(node)
      } else {
        node.left = this.rotateLeft(node.left)
        return this.rotateRight(node)
      }
    }

    if (balance < -1) {
      assert(node.right !== null, 'node.right is null')
      if (value > node.right.value) {
        return this.rotateLeft(node)
      } else {
        node.right = this.rotateRight(node.right)
        return this.rotateLeft(node)
      }
    }

    return node
  }

  insert (value: number): void {
    this.root = this.insertNode(this.root, value)
  }

  minValueNode (node: DataNode): DataNode {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  deleteNode (root: DataNode | null, value: number): DataNode | null {
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

  delete (value: number): void {
    this.root = this.deleteNode(this.root, value)
  }
}
