import DataNode from './DataNode'
import type ModelInsertionInformation from './ModelInsertionInformation'
import { ArrowDirection } from '../controller/ArrowDirection'
import type DataTreeShape from './DataTreeShape'
import type ModelDeletionInformationLEQ1Child from './ModelDeletionInformationLEQ1Child'
import type ModelDeletionInformation2Children from './ModelDeletionInformation2Children'
import type ModelDeletionInformationVictimNotFound from './ModelDeletionInformationVictimNotFound'
import type ModelFindInformation from './ModelFindInformation'

export default class BSTModel {
  private root: DataNode | null
  private arrowDirection: ArrowDirection

  constructor () {
    this.root = null
    this.arrowDirection = ArrowDirection.PARENT_TO_CHILD
  }

  private calculateShape (): DataTreeShape {
    if (this.root == null) {
      return { inorderTraversal: [], layers: [], arrows: [] }
    }

    const inorderTraversal = this.root.getInorderTraversal()
    const layers = this.calculateLayers()
    const arrows = this.calculateArrows()
    return { inorderTraversal, layers, arrows }
  }

  // Returns an array of pairs of nodes to draw arrows between
  private calculateArrows (): Array<[DataNode, DataNode]> {
    if (this.root == null) {
      return []
    }

    const arrows: Array<[DataNode, DataNode]> = []
    // Draw arrows first
    if (this.arrowDirection === ArrowDirection.PARENT_TO_CHILD) {
      const arbitraryTraversal = this.root.getInorderTraversal()
      arbitraryTraversal.forEach((node) => {
        if (node.left != null) {
          arrows.push([node, node.left])
        }
        if (node.right != null) {
          arrows.push([node, node.right])
        }
      })
    } else {
      const traversal = this.root.getTraversal(this.arrowDirection)
      for (let i = 0; i < traversal.length - 1; i++) {
        const node = traversal[i]
        const nextNode = traversal[i + 1]
        arrows.push([node, nextNode])
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
        if (node == null) {
          throw new Error('Node is null')
        }
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

  // Note: equivalent values are inserted to the right
  insert (value: number): ModelInsertionInformation {
    // If the tree is empty, insert without any animation
    if (this.root == null) {
      this.root = new DataNode(value)
      return { shape: this.calculateShape(), path: [], insertedNode: this.root }
    }

    // Find the path to where the new node will be inserted
    const path: DataNode[] = []
    let currNode: DataNode | null = this.root
    while (currNode != null) {
      path.push(currNode)
      if (value < currNode.value) {
        currNode = currNode.left
      } else {
        currNode = currNode.right
      }
    }

    // Insert the new node
    const parent = path[path.length - 1]
    const insertedNode = new DataNode(value)
    if (value < parent.value) {
      parent.left = insertedNode
    } else {
      parent.right = insertedNode
    }

    return { shape: this.calculateShape(), path, insertedNode }
  }

  // If the victim node has 2 children, send different information to facilitate a different animation
  // If the tree is empty, return null
  delete (value: number): ModelDeletionInformationLEQ1Child | ModelDeletionInformation2Children | ModelDeletionInformationVictimNotFound {
    if (this.root == null) {
      return { type: 'VictimNotFound', path: [] }
    }

    // Find the path the tree takes to find the node to delete
    const path: DataNode[] = []
    let currNode: DataNode | null = this.root
    let currParent: DataNode | null = null
    while (currNode != null && currNode.value !== value) {
      currParent = currNode
      path.push(currNode)
      currNode = value < currNode.value ? currNode.left : currNode.right
    }

    if (currNode == null) {
      return { type: 'VictimNotFound', path }
    } else {
      path.push(currNode)
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
      const pathToSuccessor: DataNode[] = []

      // Find the node with the minimum value (AKA successor) in the right subtree
      while (successor.left !== null) {
        pathToSuccessor.push(successor)
        successorParent = successor
        successor = successor.left
      }
      pathToSuccessor.push(successor)

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

  find (value: number): ModelFindInformation {
    // Find the path the tree takes to find the node to delete
    const path: DataNode[] = []
    let currNode: DataNode | null = this.root
    while (currNode != null && currNode.value !== value) {
      path.push(currNode)
      if (value < currNode.value) {
        currNode = currNode.left
      } else {
        currNode = currNode.right
      }
    }

    // If found
    if (currNode != null) {
      path.push(currNode)
    }

    return { path, nodeFound: currNode }
  }

  setArrowDirection (arrowDirection: ArrowDirection): void {
    this.arrowDirection = arrowDirection
  }
}
