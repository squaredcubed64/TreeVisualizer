import DataNode from './DataNode'
import ArrowDirection from '../controller/ArrowDirection'
import type TreeShape from '../controller/TreeShape'
import type BSTInsertionInformation from '../controller/operationInformation/BSTInsertionInformation'
import type PathInstruction from '../controller/PathInstruction'
import type BSTDeletionInformationLEQ1Child from '../controller/operationInformation/deletionInformation/BSTDeletionInformationLEQ1Child'
import type BSTDeletionInformation2Children from '../controller/operationInformation/deletionInformation/BSTDeletionInformation2Children'
import type BSTFindInformation from '../controller/operationInformation/BSTFindInformation'
import { assert } from '../Utils'
import type BSTDeletionInformation from '../controller/operationInformation/deletionInformation/BSTDeletionInformation'
import type BSTFindSecondaryDescription from '../controller/secondaryDescription/BSTFindSecondaryDescription'
import type BSTSuccessorSecondaryDescription from '../controller/secondaryDescription/BSTSuccessorSecondaryDescription'
import type BSTInsertionSecondaryDescription from '../controller/secondaryDescription/BSTInsertionSecondaryDescription'

export default class BSTModel {
  protected root: DataNode | null
  public arrowDirection: ArrowDirection

  constructor () {
    this.root = null
    this.arrowDirection = ArrowDirection.PARENT_TO_CHILD
  }

  protected calculateShape (): TreeShape<DataNode> {
    if (this.root == null) {
      return { inorderTraversal: [], layers: [], arrows: new Set() }
    }

    const inorderTraversal = this.root.getTraversal(ArrowDirection.INORDER)
    const layers = this.calculateLayers()
    const arrows = this.calculateArrows()
    return { inorderTraversal, layers, arrows }
  }

  // Returns an array of pairs of nodes to draw arrows between
  public calculateArrows (): Set<[DataNode, DataNode]> {
    if (this.root == null) {
      return new Set()
    }

    const arrows = new Set<[DataNode, DataNode]>()
    // Draw arrows first
    if (this.arrowDirection === ArrowDirection.PARENT_TO_CHILD) {
      const arbitraryTraversal = this.root.getTraversal(ArrowDirection.INORDER)
      arbitraryTraversal.forEach((node) => {
        if (node.left != null) {
          arrows.add([node, node.left])
        }
        if (node.right != null) {
          arrows.add([node, node.right])
        }
      })
    } else {
      const traversal = this.root.getTraversal(this.arrowDirection)
      for (let i = 0; i < traversal.length - 1; i++) {
        const node = traversal[i]
        const nextNode = traversal[i + 1]
        arrows.add([node, nextNode])
      }
    }
    return arrows
  }

  // Returns an array of arrays of nodes, where each array is a layer of the tree
  private calculateLayers (): DataNode[][] {
    if (this.root == null) {
      return []
    }

    const layers: DataNode[][] = []
    const queue = [this.root]
    while (queue.length > 0) {
      const numNodesInLayer = queue.length
      const layer: DataNode[] = []
      for (let _ = 0; _ < numNodesInLayer; _++) {
        const node = queue.shift()
        assert(node !== undefined, 'Node is undefined')
        layer.push(node)
        if (node.left != null) {
          queue.push(node.left)
        }
        if (node.right != null) {
          queue.push(node.right)
        }
      }
      layers.push(layer)
    }
    return layers
  }

  /**
   * Inserts a new node into the model
   * @param value The value to insert
   * @returns The information needed to animate the insertion and the inserted node
   */
  public insert (value: number): [BSTInsertionInformation<DataNode>, DataNode] {
    // If the tree is empty, insert without any animation
    if (this.root == null) {
      this.root = new DataNode(value)
      return [{ shape: this.calculateShape(), path: [], value: this.root.value }, this.root]
    }

    // Find the path to where the new node will be inserted
    const path: Array<PathInstruction<DataNode, BSTInsertionSecondaryDescription>> = []
    let currNode: DataNode | null = this.root
    while (currNode != null) {
      if (value < currNode.value) {
        path.push({ node: currNode, secondaryDescription: { type: 'insert', direction: 'left', targetValue: value, nodeValue: currNode.value } })
        currNode = currNode.left
      } else {
        path.push({ node: currNode, secondaryDescription: { type: 'insert', direction: 'right', targetValue: value, nodeValue: currNode.value } })
        currNode = currNode.right
      }
    }

    // Insert the new node
    const parentNode = path[path.length - 1].node
    const insertedNode = new DataNode(value)
    if (value < parentNode.value) {
      parentNode.left = insertedNode
    } else {
      parentNode.right = insertedNode
    }

    return [{ shape: this.calculateShape(), path, value: insertedNode.value }, insertedNode]
  }

  // If the victim node has 2 children, send different information to facilitate a different animation
  // If the tree is empty, return null
  public delete (value: number): BSTDeletionInformation<DataNode> {
    if (this.root == null) {
      return { type: 'VictimNotFound', path: [] }
    }

    // Find the path the tree takes to find the node to delete
    const path: Array<PathInstruction<DataNode, BSTFindSecondaryDescription>> = []
    let currNode: DataNode | null = this.root
    let currParent: DataNode | null = null
    while (currNode != null && currNode.value !== value) {
      currParent = currNode
      if (value < currNode.value) {
        path.push({ node: currNode, secondaryDescription: { type: 'find', direction: 'left', targetValue: value, nodeValue: currNode.value } })
        currNode = currNode.left
      } else {
        path.push({ node: currNode, secondaryDescription: { type: 'find', direction: 'right', targetValue: value, nodeValue: currNode.value } })
        currNode = currNode.right
      }
    }

    if (currNode == null) {
      return { type: 'VictimNotFound', path }
    } else {
      path.push({ node: currNode, secondaryDescription: { type: 'find', direction: 'stop', targetValue: value, nodeValue: currNode.value } })
    }

    // Node with no child or one child
    if (currNode.left === null || currNode.right === null) {
      const childNode = currNode.left ?? currNode.right
      // Deleting root node
      if (currParent === null) {
        this.root = childNode
      } else {
        // Replacing the node to delete with its child in the parent node
        if (currParent.left === currNode) {
          currParent.left = childNode
        } else {
          currParent.right = childNode
        }
      }
      const deletionInformation: BSTDeletionInformationLEQ1Child<DataNode> = { type: 'LEQ1Child', shape: this.calculateShape(), path, victimNode: currNode }
      return deletionInformation
    // Node with two children
    } else {
      const { successor, successorParent, pathToSuccessor } = this.findSuccessorAndParentAndPath(currNode)
      // Replace the value of the node to delete with the found successor
      currNode.value = successor.value

      // Delete the successor node
      if (successorParent.left === successor) {
        successorParent.left = successor.right
      } else {
        successorParent.right = successor.right
      }

      const deletionInformation: BSTDeletionInformation2Children<DataNode> = { type: '2Children', shape: this.calculateShape(), path, victimNode: currNode, pathToSuccessor, successorNode: successor }
      return deletionInformation
    }
  }

  protected findSuccessorAndParentAndPath (node: DataNode): { successor: DataNode, successorParent: DataNode, pathToSuccessor: Array<PathInstruction<DataNode, BSTSuccessorSecondaryDescription>> } {
    assert(node.left !== null && node.right !== null, 'Node does not have 2 children')
    let successor = node.right
    let successorParent = node
    const pathToSuccessor: Array<PathInstruction<DataNode, BSTSuccessorSecondaryDescription>> = []

    // Find the node with the minimum value (AKA successor) in the right subtree
    while (successor.left !== null) {
      pathToSuccessor.push({ node: successor, secondaryDescription: { type: 'successor', direction: 'left' } })
      successorParent = successor
      successor = successor.left
    }
    pathToSuccessor.push({ node: successor, secondaryDescription: { type: 'successor', direction: 'stop' } })
    return { successor, successorParent, pathToSuccessor }
  }

  public find (value: number): BSTFindInformation<DataNode> {
    // Find the path the tree takes to find the node to delete
    const path: Array<PathInstruction<DataNode, BSTFindSecondaryDescription>> = []
    let currNode: DataNode | null = this.root
    while (currNode != null && currNode.value !== value) {
      if (value < currNode.value) {
        path.push({ node: currNode, secondaryDescription: { type: 'find', direction: 'left', targetValue: value, nodeValue: currNode.value } })
        currNode = currNode.left
      } else {
        path.push({ node: currNode, secondaryDescription: { type: 'find', direction: 'right', targetValue: value, nodeValue: currNode.value } })
        currNode = currNode.right
      }
    }

    // If found
    if (currNode != null) {
      path.push({ node: currNode, secondaryDescription: { type: 'find', direction: 'stop', targetValue: value, nodeValue: currNode.value } })
    }

    return { path, nodeFound: currNode }
  }
}
