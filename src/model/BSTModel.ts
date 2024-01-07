import DataNode from './DataNode'
import type ModelInsertionInformation from './ModelInsertionInformation'
import { ArrowDirection } from '../controller/ArrowDirection'
import type DataTreeShape from './DataTreeShape'

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

  /* // Animation: highlight path, shrink victim node, then move other nodes to new target positions
  delete (value: number): void {
    // If the tree is empty, do nothing
    if (this.root == null) {
      return
    }

    // Find the path the tree takes to find the node to delete
    const path: DataNode[] = []
    let currNode: DataNode | null = this.root
    let currParent: DataNode | null = null
    while (currNode != null && currNode.displayNode.value !== value) {
      currParent = currNode
      path.push(currNode)
      if (value < currNode.displayNode.value) {
        currNode = currNode.left
      } else {
        currNode = currNode.right
      }
    }
    // Highlight victim node too
    if (currNode != null) {
      path.push(currNode)
    }

    this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE)
    if (currNode != null) {
      this.pushOptionalShrinkAndSetupDeletionAnimationToQueue(currNode, currParent, false)
    }
  }

  // May push shrinking onto functionQueue, then pushes setupDeletionAnimation onto functionQueue
  private pushOptionalShrinkAndSetupDeletionAnimationToQueue (victim: DataNode, parent: DataNode | null, victimIsSuccessor: boolean): void {
    // If victim has one child or fewer, start shrinking after highlighting
    if (victim.left == null || victim.right == null) {
      this.functionQueue.push({ framesToWait: 0, function: () => { victim.displayNode.startShrinkingIntoNothing(); return { framesAfterCall: SHRINK_DURATION_FRAMES + FRAMES_AFTER_SHRINK, description: victimIsSuccessor ? DELETION_DESCRIPTIONS.DELETE_SUCCESSOR : DELETION_DESCRIPTIONS.DELETE_NODE } } })
    }
    // Save args to call setupDeletionAnimation later
    this.functionQueue.push({ framesToWait: 0, function: () => this.setupDeletionAnimation(victim, parent, victimIsSuccessor) })
  }

  // Deletes node and tells nodes to start moving to new target positions
  private setupDeletionAnimation (victim: DataNode, parent: DataNode | null, victimIsSuccessor: boolean): DelayedFunctionCallFunctionResult {
    if (parent != null && !parent.isParentOf(victim)) {
      throw new Error('parent is not the parent of node')
    }

    // BST deletion
    if (victim.left === null && victim.right === null) {
      // Case 1: Node has no children
      if (parent == null) {
        // Node is the root
        this.root = null
      } else if (parent.left === victim) {
        parent.left = null
      } else {
        parent.right = null
      }
      this.setTargetPositions()
      return { framesAfterCall: MOVE_DURATION_FRAMES, description: victimIsSuccessor ? DELETION_DESCRIPTIONS.DELETE_SUCCESSOR : DELETION_DESCRIPTIONS.DELETE_NODE }
    } else if (victim.left === null || victim.right === null) {
      // Case 2: Node has one child
      const child = victim.left ?? victim.right
      if (parent == null) {
        // Node is the root
        this.root = child
      } else if (parent.left === victim) {
        parent.left = child
      } else {
        parent.right = child
      }
      this.setTargetPositions()
      return { framesAfterCall: MOVE_DURATION_FRAMES, description: victimIsSuccessor ? DELETION_DESCRIPTIONS.DELETE_SUCCESSOR : DELETION_DESCRIPTIONS.DELETE_NODE }
    } else {
      // Case 3: Node has two children, swap with smallest node in right subtree
      victim.displayNode.highlight(FIND_SUCCESSOR_HIGHLIGHT_COLOR, Infinity)

      let currParent: DataNode = victim
      let currNode: DataNode = victim.right
      const path: DataNode[] = [currNode]
      while (currNode.left != null) {
        currParent = currNode
        currNode = currNode.left
        path.push(currNode)
      }
      // Requires that setupDeletionAnimation is the last function in the queue, which should be the case
      this.pushNodeHighlightingOntoFunctionQueue(path, FIND_SUCCESSOR_HIGHLIGHT_COLOR, DELETION_DESCRIPTIONS.FIND_SUCCESSOR)
      // currNode is the successor, currParent is the successor's parent
      this.functionQueue.push({ framesToWait: FRAMES_BEFORE_HIGHLIGHT_SUCCESSOR, function: () => { currNode.displayNode.highlight(FIND_SUCCESSOR_HIGHLIGHT_COLOR, Infinity); return { framesAfterCall: 0, description: DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR } } })
      this.functionQueue.push({ framesToWait: FRAMES_BEFORE_REPLACE_WITH_SUCCESSOR, function: () => { victim.displayNode.value = currNode.displayNode.value; return { framesAfterCall: 0, description: DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR } } })
      this.functionQueue.push({ framesToWait: FRAMES_BEFORE_UNHIGHLIGHT_VICTIM, function: () => { victim.displayNode.unhighlight(); return { framesAfterCall: 0, description: DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR } } })
      this.pushOptionalShrinkAndSetupDeletionAnimationToQueue(currNode, currParent, true)
      return { framesAfterCall: FRAMES_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN, description: DELETION_DESCRIPTIONS.FIND_SUCCESSOR }
    }
  }

  // Animation: highlight path, then highlight node if found
  find (value: number): void {
    // If the tree is empty, do nothing
    if (this.root == null) {
      return
    }

    // Find the path the tree takes to find the node to delete
    const path: DataNode[] = []
    let currNode: DataNode | null = this.root
    while (currNode != null && currNode.displayNode.value !== value) {
      path.push(currNode)
      if (value < currNode.displayNode.value) {
        currNode = currNode.left
      } else {
        currNode = currNode.right
      }
    }
    // Highlight victim node too
    if (currNode != null) {
      path.push(currNode)
    }

    this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, FIND_DESCRIPTIONS.FIND_NODE)

    // If found, highlight again in a different color
    this.functionQueue.push({
      framesToWait: 0,
      function: () => {
        if (currNode != null) {
          currNode.displayNode.highlight(HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND, HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES)
          return { framesAfterCall: HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES + FRAMES_AFTER_FIND, description: FIND_DESCRIPTIONS.FOUND_NODE }
        } else return { framesAfterCall: FRAMES_AFTER_FIND, description: FIND_DESCRIPTIONS.DID_NOT_FIND_NODE }
      }
    })
  } */

  setArrowDirection (arrowDirection: ArrowDirection): void {
    this.arrowDirection = arrowDirection
  }
}
