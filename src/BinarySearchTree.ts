import DisplayNode from './DisplayNode.js'
import DataNode from './DataNode.js'
import type Tree from './Tree.js'
import {
  ROOT_TARGET_X,
  ROOT_TARGET_Y,
  TARGET_X_GAP,
  TARGET_Y_GAP,
  MAX_RADIUS,
  FILL_COLOR,
  STROKE_COLOR,
  ARROW_HEAD_ANGLE,
  ARROW_HEAD_LENGTH,
  ARROW_LINE_WIDTH,
  FRAMES_BETWEEN_HIGHLIGHTS,
  FRAMES_BEFORE_FIRST_HIGHLIGHT,
  // MOVE_DURATION_FRAMES,
  HIGHLIGHT_DURATION_FRAMES,
  SHRINK_DURATION_FRAMES,
  FRAMES_AFTER_SHRINK,
  TOTAL_HIGHLIGHT_DURATION_FRAMES
} from './constants.js'

// For debugging
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toString (node: DataNode | null, depth: number = 0): string {
  if (node == null) {
    return ''
  }
  let out = '\t'.repeat(depth) + node.displayNode.value.toString() + '\n'
  out += toString(node.left, depth + 1)
  out += toString(node.right, depth + 1)
  return out
}

function drawArrow (fromX: number, fromY: number, toX: number, toY: number, context: CanvasRenderingContext2D): void {
  const dx = toX - fromX
  const dy = toY - fromY
  const angle = Math.atan2(dy, dx)

  context.beginPath()
  context.lineWidth = ARROW_LINE_WIDTH
  context.moveTo(fromX, fromY)
  context.lineTo(toX, toY)
  context.lineTo(toX - ARROW_HEAD_LENGTH * Math.cos(angle - ARROW_HEAD_ANGLE), toY - ARROW_HEAD_LENGTH * Math.sin(angle - ARROW_HEAD_ANGLE))
  context.moveTo(toX, toY)
  context.lineTo(toX - ARROW_HEAD_LENGTH * Math.cos(angle + ARROW_HEAD_ANGLE), toY - ARROW_HEAD_LENGTH * Math.sin(angle + ARROW_HEAD_ANGLE))
  context.stroke()
}

function drawArrowFromNodeToNode (fromNode: DataNode, toNode: DataNode, context: CanvasRenderingContext2D): void {
  const dx = toNode.displayNode.x - fromNode.displayNode.x
  const dy = toNode.displayNode.y - fromNode.displayNode.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const xOffsetFromCenter = dx * toNode.displayNode.currentRadius / dist
  const yOffsetFromCenter = dy * toNode.displayNode.currentRadius / dist
  drawArrow(fromNode.displayNode.x, fromNode.displayNode.y, toNode.displayNode.x - xOffsetFromCenter, toNode.displayNode.y - yOffsetFromCenter, context)
}

function makeDataNode (targetX: number, targetY: number, value: number): DataNode {
  return new DataNode(new DisplayNode(targetX, targetY, MAX_RADIUS, FILL_COLOR, STROKE_COLOR, value))
}

export default class BinarySearchTree implements Tree {
  root: DataNode | null
  framesUntilSetupInsertionAnimation: number
  setupInsertionAnimationValue: number
  setupInsertionAnimationParent: DataNode | null

  framesUntilShrinkAnimation: number
  framesUntilSetupDeletionAnimation: number
  // Also referenced for the shrink animation
  setupDeletionAnimationNode: DataNode | null
  setupDeletionAnimationParent: DataNode | null

  constructor () {
    this.root = null
    this.framesUntilSetupInsertionAnimation = -1
    this.setupInsertionAnimationValue = -1
    this.setupInsertionAnimationParent = null
    this.framesUntilShrinkAnimation = -1
    this.framesUntilSetupDeletionAnimation = -1
    this.setupDeletionAnimationNode = null
    this.setupDeletionAnimationParent = null
  }

  // Animation: highlight path, then simultaneously grow inserted node and move other nodes to new target positions
  // Note: equivalent values are inserted to the right
  insert (value: number): void {
    // If the tree is empty, insert without any animation
    if (this.root == null) {
      this.root = makeDataNode(ROOT_TARGET_X, ROOT_TARGET_Y, value)
      return
    }

    // Find the path to where the new node will be inserted
    const path: DataNode[] = []
    let currNode: DataNode | null = this.root
    while (currNode != null) {
      path.push(currNode)
      if (value < currNode.displayNode.value) {
        currNode = currNode.left
      } else {
        currNode = currNode.right
      }
    }

    this.setupNodesToHighlightAlongPath(path)

    // Save args to call setupInsertionAnimation later
    this.framesUntilSetupInsertionAnimation = TOTAL_HIGHLIGHT_DURATION_FRAMES(path.length)
    this.setupInsertionAnimationValue = value
    this.setupInsertionAnimationParent = path[path.length - 1]
  }

  setupNodesToHighlightAlongPath (path: DataNode[]): void {
    for (let i = 0; i < path.length; i++) {
      const node = path[i]
      node.displayNode.highlightAfterDelay(FRAMES_BEFORE_FIRST_HIGHLIGHT + i * (HIGHLIGHT_DURATION_FRAMES + FRAMES_BETWEEN_HIGHLIGHTS))
    }
  }

  // Creates node and tells nodes to start moving to new target positions
  setupInsertionAnimation (value: number, parent: DataNode): void {
    if (value < parent.displayNode.value) {
      parent.left = makeDataNode(parent.displayNode.targetX - TARGET_X_GAP, parent.displayNode.targetY + TARGET_Y_GAP, value)
    } else {
      parent.right = makeDataNode(parent.displayNode.targetX + TARGET_X_GAP, parent.displayNode.targetY + TARGET_Y_GAP, value)
    }
    this.setTargetPositions()
  }

  // Animation: highlight path, shrink victim node, then move other nodes to new target positions
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

    this.setupNodesToHighlightAlongPath(path)

    if (currNode !== null) {
      // If the victim node has one child or fewer, start shrinking after highlighting
      if (currNode.left == null || currNode.right == null) {
        this.framesUntilShrinkAnimation = TOTAL_HIGHLIGHT_DURATION_FRAMES(path.length)
      }
      // add logic here
      // Save args to call setupDeletionAnimation later
      this.framesUntilSetupDeletionAnimation = TOTAL_HIGHLIGHT_DURATION_FRAMES(path.length) + SHRINK_DURATION_FRAMES + FRAMES_AFTER_SHRINK
      this.setupDeletionAnimationNode = currNode
      this.setupDeletionAnimationParent = currParent
    }
  }

  // Deletes node and tells nodes to start moving to new target positions
  setupDeletionAnimation (node: DataNode, parent: DataNode | null): void {
    if (parent != null && !parent.isParentOf(node)) {
      throw new Error('parent is not the parent of node')
    }

    // BST deletion
    if (node.left === null && node.right === null) {
      // Case 1: Node has no children
      if (parent == null) {
        // Node is the root
        this.root = null
      } else if (parent.left === node) {
        parent.left = null
      } else {
        parent.right = null
      }
    } else if (node.left === null || node.right === null) {
      // Case 2: Node has one child
      const child = node.left ?? node.right
      if (parent == null) {
        // Node is the root
        this.root = child
      } else if (parent.left === node) {
        parent.left = child
      } else {
        parent.right = child
      }
    } else {
      // Case 3: Node has two children, swap with smallest node in right subtree
      let successorParent: DataNode = node
      let successor: DataNode = node.right
      while (successor.left != null) {
        successorParent = successor
        successor = successor.left
      }
      node.displayNode.value = successor.displayNode.value
      this.setupDeletionAnimation(successor, successorParent)
      return
    }

    this.setTargetPositions()
  }

  find (value: number): DisplayNode | null {
    return null
  }

  animate (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Insert a new node and have other nodes move to accomodate
    if (this.framesUntilSetupInsertionAnimation === 0) {
      if (this.setupInsertionAnimationParent == null) {
        throw new Error('Parent is null. If the tree is empty, this should have been handled by insert')
      }
      this.setupInsertionAnimation(this.setupInsertionAnimationValue, this.setupInsertionAnimationParent)
      this.framesUntilSetupInsertionAnimation = -1
    } else if (this.framesUntilSetupInsertionAnimation > 0) {
      this.framesUntilSetupInsertionAnimation--
    }

    // Tell victim node to start shrinking
    if (this.framesUntilShrinkAnimation === 0) {
      if (this.setupDeletionAnimationNode == null) {
        throw new Error('Node is null. If the victim node is not in the tree, this should have been handled by delete')
      }
      this.setupDeletionAnimationNode.displayNode.startShrinkingIntoNothing()
      this.framesUntilShrinkAnimation = -1
    } else if (this.framesUntilShrinkAnimation > 0) {
      this.framesUntilShrinkAnimation--
    }

    // Delete a node and have other nodes move to accomodate
    if (this.framesUntilSetupDeletionAnimation === 0) {
      if (this.setupDeletionAnimationNode == null) {
        throw new Error('Node is null. If the victim node is not in the tree, this should have been handled by delete')
      }
      this.setupDeletionAnimation(this.setupDeletionAnimationNode, this.setupDeletionAnimationParent)
      this.framesUntilSetupDeletionAnimation = -1
    } else if (this.framesUntilSetupDeletionAnimation > 0) {
      this.framesUntilSetupDeletionAnimation--
    }

    if (this.root != null) {
      const inorderTraversal = this.root.inorderTraversal()

      // Draw arrows first
      inorderTraversal.forEach((node) => {
        if (node.left != null) {
          drawArrowFromNodeToNode(node, node.left, context)
        }
        if (node.right != null) {
          drawArrowFromNodeToNode(node, node.right, context)
        }
      })

      inorderTraversal.forEach((node) => {
        node.displayNode.drawAndUpdate(context)
      })
    }
    requestAnimationFrame(() => { this.animate(canvas, context) })
  }

  // Nodes are equally spaced horizontally based on their inorder traversal
  targetXs (): Map<DataNode, number> {
    const nodeToTargetX = new Map<DataNode, number>()
    if (this.root == null) {
      throw new Error('Root is null')
    }

    const inorderTraversal = this.root.inorderTraversal()
    const rootIndex = inorderTraversal.indexOf(this.root)
    for (let i = 0; i < inorderTraversal.length; i++) {
      const node = inorderTraversal[i]
      nodeToTargetX.set(node, ROOT_TARGET_X + (i - rootIndex) * TARGET_X_GAP)
    }
    return nodeToTargetX
  }

  // Layers are equally spaced vertically based on their depth
  targetYs (): Map<DataNode, number> {
    const nodeToTargetY = new Map<DataNode, number>()
    if (this.root == null) {
      throw new Error('Root is null')
    }

    const queue = [this.root]
    let depth = 0
    while (queue.length > 0) {
      const numNodesInLayer = queue.length
      for (let _ = 0; _ < numNodesInLayer; _++) {
        const node = queue.shift()
        if (node == null) {
          throw new Error('Node is null')
        }

        nodeToTargetY.set(node, ROOT_TARGET_Y + depth * TARGET_Y_GAP)
        if (node.left != null) {
          queue.push(node.left)
        }
        if (node.right != null) {
          queue.push(node.right)
        }
      }
      depth++
    }
    return nodeToTargetY
  }

  setTargetPositions (): void {
    if (this.root == null) {
      return
    }
    const nodeToTargetX = this.targetXs()
    const nodeToTargetY = this.targetYs()
    for (const node of this.root.inorderTraversal()) {
      const targetX = nodeToTargetX.get(node)
      if (targetX == null) {
        throw new Error('TargetX is null')
      }
      const targetY = nodeToTargetY.get(node)
      if (targetY == null) {
        throw new Error('TargetY is null')
      }
      node.displayNode.moveTo(targetX, targetY)
    }
  }
}
