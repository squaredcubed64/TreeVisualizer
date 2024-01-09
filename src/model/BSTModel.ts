import DataNode from './DataNode'
import ArrowDirection from '../controller/ArrowDirection'
import type TreeShape from '../controller/TreeShape'
import type InsertionInformation from '../controller/InsertionInformation'
import type PathInstruction from '../controller/PathInstruction'
import type DeletionInformationLEQ1Child from '../controller/DeletionInformationLEQ1Child'
import type DeletionInformation2Children from '../controller/DeletionInformation2Children'
import type DeletionInformationVictimNotFound from '../controller/DeletionInformationVictimNotFound'
import type FindInformation from '../controller/FindInformation'
import { assert } from '../Utils'

export default class BSTModel {
  private root: DataNode | null
  public arrowDirection: ArrowDirection

  constructor () {
    this.root = null
    this.arrowDirection = ArrowDirection.PARENT_TO_CHILD
  }

  private calculateShape (): TreeShape<DataNode> {
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
  public insert (value: number): [InsertionInformation<DataNode>, DataNode] {
    // If the tree is empty, insert without any animation
    if (this.root == null) {
      this.root = new DataNode(value)
      return [{ shape: this.calculateShape(), path: [], value: this.root.value }, this.root]
    }

    // Find the path to where the new node will be inserted
    const path: Array<PathInstruction<DataNode>> = []
    let currNode: DataNode | null = this.root
    while (currNode != null) {
      path.push({ node: currNode, secondaryMessage: undefined })
      if (value < currNode.value) {
        currNode = currNode.left
      } else {
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
  public delete (value: number): DeletionInformationLEQ1Child<DataNode> | DeletionInformation2Children<DataNode> | DeletionInformationVictimNotFound<DataNode> {
    if (this.root == null) {
      return { type: 'VictimNotFound', path: [] }
    }

    // Find the path the tree takes to find the node to delete
    const path: Array<PathInstruction<DataNode>> = []
    let currNode: DataNode | null = this.root
    let currParent: DataNode | null = null
    while (currNode != null && currNode.value !== value) {
      currParent = currNode
      path.push({ node: currNode, secondaryMessage: undefined })
      currNode = value < currNode.value ? currNode.left : currNode.right
    }

    if (currNode == null) {
      return { type: 'VictimNotFound', path }
    } else {
      path.push({ node: currNode, secondaryMessage: undefined })
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
      return { type: 'LEQ1Child', shape: this.calculateShape(), path, victimNode: currNode }
    // Node with two children
    // Return ModelDeleteInformation2Children
    } else {
      let successor = currNode.right
      let successorParent = currNode
      const pathToSuccessor: Array<PathInstruction<DataNode>> = []

      // Find the node with the minimum value (AKA successor) in the right subtree
      while (successor.left !== null) {
        pathToSuccessor.push({ node: successor, secondaryMessage: undefined })
        successorParent = successor
        successor = successor.left
      }
      pathToSuccessor.push({ node: successor, secondaryMessage: undefined })

      // Replace the value of the node to delete with the found successor
      currNode.value = successor.value

      // Delete the successor node
      if (successorParent.left === successor) {
        successorParent.left = successor.right
      } else {
        successorParent.right = successor.right
      }

      return { type: '2Children', shape: this.calculateShape(), path, victimNode: currNode, pathToSuccessor, successorNode: successor }
    }
  }

  public find (value: number): FindInformation<DataNode> {
    // Find the path the tree takes to find the node to delete
    const path: Array<PathInstruction<DataNode>> = []
    let currNode: DataNode | null = this.root
    while (currNode != null && currNode.value !== value) {
      path.push({ node: currNode, secondaryMessage: undefined })
      if (value < currNode.value) {
        currNode = currNode.left
      } else {
        currNode = currNode.right
      }
    }

    // If found
    if (currNode != null) {
      path.push({ node: currNode, secondaryMessage: undefined })
    }

    return { path, nodeFound: currNode }
  }
}
