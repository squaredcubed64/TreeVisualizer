import { assert } from '../Utils'
import ArrowDirection from '../controller/ArrowDirection'
import type TreeShape from '../controller/TreeShape'
import type BSTFindInformation from '../controller/operationInformation/BSTFindInformation'
import type BSTPathInstruction from '../controller/pathInstruction/BSTPathInstruction'
import type BSTFindSecondaryDescription from '../controller/secondaryDescription/BSTFindSecondaryDescription'
import type DataNode from './DataNode'

export default abstract class TreeModel {
  protected root: DataNode | null = null
  public arrowDirection: ArrowDirection = ArrowDirection.PARENT_TO_CHILD

  abstract insert (value: number): any
  // abstract delete (value: number): any

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
  protected calculateLayers (): DataNode[][] {
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

  public find (value: number): BSTFindInformation<DataNode> {
    // Find the path the tree takes to find the node to delete
    const path: Array<BSTPathInstruction<DataNode, BSTFindSecondaryDescription>> = []
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
