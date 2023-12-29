import DisplayNode from './DisplayNode.js'
import DataNode from './DataNode.js'
import type Tree from './Tree.js'
import {
  ROOT_TARGET_X,
  ROOT_TARGET_Y,
  TARGET_X_GAP,
  TARGET_Y_GAP,
  RADIUS,
  FILL_COLOR,
  STROKE_COLOR,
  ARROW_HEAD_ANGLE,
  ARROW_HEAD_LENGTH,
  ARROW_LINE_WIDTH,
  FRAMES_BETWEEN_HIGHLIGHTS,
  FRAMES_BEFORE_FIRST_HIGHLIGHT,
  FRAMES_AFTER_LAST_HIGHLIGHT,
  // MOVE_DURATION_FRAMES,
  HIGHLIGHT_DURATION_FRAMES
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

export default class BinarySearchTree implements Tree {
  root: DataNode | null
  timeUntilSetupInsertionAnimation: number
  setupInsertionAnimationValue: number
  setupInsertionAnimationParent: DataNode | null

  constructor () {
    this.root = null
    this.timeUntilSetupInsertionAnimation = -1
    this.setupInsertionAnimationValue = -1
    this.setupInsertionAnimationParent = null
  }

  // Equivalent values are inserted to the right
  insert (value: number): void {
    // If the tree is empty, insert without any animation
    if (this.root == null) {
      this.root = new DataNode(new DisplayNode(ROOT_TARGET_X, ROOT_TARGET_Y, RADIUS, FILL_COLOR, STROKE_COLOR, value))
      return
    }

    const path = this.pathToNode(value)
    this.setupInsertionPathAnimation(path)

    // Save args to call setupInsertionAnimation later
    this.timeUntilSetupInsertionAnimation = FRAMES_BEFORE_FIRST_HIGHLIGHT + (path.length - 1) * FRAMES_BETWEEN_HIGHLIGHTS + (path.length) * HIGHLIGHT_DURATION_FRAMES + FRAMES_AFTER_LAST_HIGHLIGHT
    this.setupInsertionAnimationValue = value
    this.setupInsertionAnimationParent = path[path.length - 1]
  }

  // Tells nodes to highlight after a delay
  setupInsertionPathAnimation (path: DataNode[]): void {
    for (let i = 0; i < path.length; i++) {
      const node = path[i]
      node.displayNode.highlightAfterDelay(FRAMES_BEFORE_FIRST_HIGHLIGHT + i * (HIGHLIGHT_DURATION_FRAMES + FRAMES_BETWEEN_HIGHLIGHTS))
    }
  }

  // Tells nodes to start moving to new target positions
  setupInsertionAnimation (value: number, parent: DataNode): void {
    if (parent == null) {
      this.root = new DataNode(new DisplayNode(ROOT_TARGET_X, ROOT_TARGET_Y, RADIUS, FILL_COLOR, STROKE_COLOR, value))
    } else if (value < parent.displayNode.value) {
      parent.left = new DataNode(new DisplayNode(parent.displayNode.targetX - TARGET_X_GAP, parent.displayNode.targetY + TARGET_Y_GAP, RADIUS, FILL_COLOR, STROKE_COLOR, value))
    } else {
      parent.right = new DataNode(new DisplayNode(parent.displayNode.targetX + TARGET_X_GAP, parent.displayNode.targetY + TARGET_Y_GAP, RADIUS, FILL_COLOR, STROKE_COLOR, value))
    }
    this.setTargetPositions()
  }

  pathToNode (value: number): DataNode[] {
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
    return path
  }

  delete (value: number): boolean {
    return false
  }

  deleteFromSubtree (value: number, node: DataNode): void {

  }

  find (value: number): DisplayNode | null {
    return null
  }

  animate (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Insert a new node and have other nodes move to accomodate
    if (this.timeUntilSetupInsertionAnimation === 0) {
      if (this.setupInsertionAnimationParent == null) {
        throw new Error('setupInsertionAnimationParent is null')
      }
      this.setupInsertionAnimation(this.setupInsertionAnimationValue, this.setupInsertionAnimationParent)
      this.timeUntilSetupInsertionAnimation = -1
    } else if (this.timeUntilSetupInsertionAnimation > 0) {
      this.timeUntilSetupInsertionAnimation--
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
    const nodeToTargetX = this.targetXs()
    const nodeToTargetY = this.targetYs()
    if (this.root == null) {
      throw new Error('Root is null')
    }
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
