import { assert } from '../Utils'
import type TreeShape from '../controller/TreeShape'
import type AVLInsertionInformation from '../controller/operationInformation/AVLInsertionInformation'
import type AVLDeletionInformation from '../controller/operationInformation/deletionInformation/AVLDeletionInformation'
import type RotationPathInstruction from '../controller/pathInstruction/RotationPathInstruction'
import type RotationSecondaryDescription from '../controller/secondaryDescription/RotationSecondaryDescription'
import BSTModel from './BSTModel'
import type DataNode from './DataNode'

// For debugging
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toString (node: DataNode | null, depth: number = 0, extra: string = 'root'): string {
  if (node == null) {
    return ''
  }
  let out = '\t'.repeat(depth) + extra + ' ' + node.value.toString() + '\n'
  out += toString(node.left, depth + 1, 'left')
  out += toString(node.right, depth + 1, 'right')
  return out
}

export default class AVLModel extends BSTModel {
  private static getHeight (node: DataNode | null): number {
    if (node === null) {
      return 0
    }
    return node.height
  }

  private static updateHeight (node: DataNode): void {
    node.height = Math.max(AVLModel.getHeight(node.left), AVLModel.getHeight(node.right)) + 1
  }

  private static getBalance (node: DataNode | null): number {
    if (node === null) {
      return 0
    }
    return AVLModel.getHeight(node.left) - AVLModel.getHeight(node.right)
  }

  private static rotateRight (y: DataNode): DataNode {
    assert(y.left !== null, 'y.left is null')
    const x = y.left
    const T2 = x.right
    x.right = y
    y.left = T2
    AVLModel.updateHeight(y)
    AVLModel.updateHeight(x)
    return x
  }

  private static rotateLeft (x: DataNode): DataNode {
    assert(x.right !== null, 'x.right is null')
    const y = x.right
    const T2 = y.left
    y.left = x
    x.right = T2
    AVLModel.updateHeight(x)
    AVLModel.updateHeight(y)
    return y
  }

  public insert (value: number): { insertionInformation: AVLInsertionInformation<DataNode>, insertedNode: DataNode } {
    const { insertionInformation: bstInsertionInformation, insertedNode } = super.insert(value)
    const { pathFromRootToTarget: path } = bstInsertionInformation

    const rotationPath = this.rebalanceAlongPath(path.map((pathInstruction) => pathInstruction.node))
    return { insertionInformation: { ...bstInsertionInformation, rotationPath }, insertedNode }
  }

  public delete (value: number): AVLDeletionInformation<DataNode> {
    const bstDeletionInformation = super.delete(value)
    const { pathFromRootToTarget: pathToTarget } = bstDeletionInformation

    let rotationPath: Array<RotationPathInstruction<DataNode>>
    if (bstDeletionInformation.type === '2Children') {
      const { pathToSuccessor } = bstDeletionInformation
      const pathFromRootToSuccessor = pathToTarget.map((pathInstruction) => pathInstruction.node).concat(pathToSuccessor.map((pathInstruction) => pathInstruction.node))
      rotationPath = this.rebalanceAlongPath(pathFromRootToSuccessor)
    } else {
      rotationPath = this.rebalanceAlongPath(pathToTarget.map((pathInstruction) => pathInstruction.node))
    }

    return { ...bstDeletionInformation, rotationPath }
  }

  /**
   * Applies rotations to rebalance the tree along the given path according to AVL rules
   * @param path The path to rebalance along
   * @returns Information about the rotations that occurred
   */
  private rebalanceAlongPath (path: DataNode[]): Array<RotationPathInstruction<DataNode>> {
    const rotationPath: Array<RotationPathInstruction<DataNode>> = []
    while (path.length > 0) {
      const node = path.pop()
      assert(node !== undefined, 'ancestor is undefined')
      rotationPath.push(this.rebalance(node, path.length === 0 ? null : path[path.length - 1]))
      AVLModel.updateHeight(node)
    }
    return rotationPath
  }

  private rebalance (node: DataNode, parent: DataNode | null): RotationPathInstruction<DataNode> {
    const balanceFactor = AVLModel.getBalance(node)
    const shapesAfterRotation: Array<TreeShape<DataNode>> = []

    // If this node becomes unbalanced, then there are 4 cases
    if (balanceFactor > 1) {
      if (AVLModel.getBalance(node.left) >= 0) {
        // Left Left Case
        this.handleRotation(shapesAfterRotation, node, parent, 'right')
      } else {
        // Left Right Case
        assert(node.left !== null, 'node.left is null')
        this.handleRotation(shapesAfterRotation, node.left, node, 'left')
        this.handleRotation(shapesAfterRotation, node, parent, 'right')
      }
    } else if (balanceFactor < -1) {
      if (AVLModel.getBalance(node.right) <= 0) {
        // Right Right Case
        this.handleRotation(shapesAfterRotation, node, parent, 'left')
      } else {
        // Right Left Case
        assert(node.right !== null, 'node.right is null')
        this.handleRotation(shapesAfterRotation, node.right, node, 'right')
        this.handleRotation(shapesAfterRotation, node, parent, 'left')
      }
    }

    const secondaryDescription: RotationSecondaryDescription = { type: 'rotation', leftHeight: AVLModel.getHeight(node.left), rightHeight: AVLModel.getHeight(node.right), newBalanceFactor: balanceFactor, newHeight: AVLModel.getHeight(node) }
    return { node, shapesAfterRotation: shapesAfterRotation as [] | [TreeShape<DataNode>] | [TreeShape<DataNode>, TreeShape<DataNode>], secondaryDescription }
  }

  /**
   * Rotates around pivot, attaches the result to the parent, and updates shapesAfterRotation
   * @param shapesAfterRotation The array to push the shapes after rotation to
   * @param pivot The node to rotate around
   * @param pivotParent The parent of the pivot, or null if the pivot is the root
   * @param rotationDirection Which direction to rotate in
   */
  private handleRotation (shapesAfterRotation: Array<TreeShape<DataNode>>, pivot: DataNode, pivotParent: DataNode | null, rotationDirection: 'left' | 'right'): void {
    // Whether the pivot is a root, left child, or right child
    const directionFromParent = pivotParent === null ? 'root' : pivotParent.left === pivot ? 'left' : 'right'
    if (rotationDirection === 'left') {
      pivot = AVLModel.rotateLeft(pivot)
    } else {
      pivot = AVLModel.rotateRight(pivot)
    }
    this.attach(pivot, pivotParent, directionFromParent)
    shapesAfterRotation.push(this.calculateShape())
  }

  private attach (node: DataNode, parent: DataNode | null, directionFromParent: 'left' | 'right' | 'root'): void {
    switch (directionFromParent) {
      case 'left':
        assert(parent !== null, 'parent is null')
        parent.left = node
        break
      case 'right':
        assert(parent !== null, 'parent is null')
        parent.right = node
        break
      case 'root':
        this.root = node
        break
    }
  }
}
