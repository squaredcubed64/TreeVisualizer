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
  MOVE_DURATION_FRAMES,
  HIGHLIGHT_DURATION_FRAMES,
  SHRINK_DURATION_FRAMES,
  FRAMES_AFTER_SHRINK,
  FRAMES_AFTER_LAST_HIGHLIGHT,
  FRAMES_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN,
  DEFAULT_HIGHLIGHT_COLOR,
  FIND_SUCCESSOR_HIGHLIGHT_COLOR,
  FRAMES_BEFORE_REPLACE_WITH_SUCCESSOR,
  FRAMES_BEFORE_HIGHLIGHT_SUCCESSOR,
  FRAMES_BEFORE_UNHIGHLIGHT_VICTIM,
  HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES,
  HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND,
  FRAMES_AFTER_FIND,
  INSERTION_DESCRIPTIONS,
  DELETION_DESCRIPTIONS,
  FIND_DESCRIPTIONS,
  ArrowDirection
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

// Used to implement animations
interface DelayedFunctionCall {
  // The time between reaching the front of the queue and being called
  // The total time between function calls equals the framesAfterCall returned by one function plus the framesToWait of the next function
  framesToWait: number
  function: DelayedFunctionCallFunction
}

type DelayedFunctionCallFunction = () => DelayedFunctionCallFunctionResult

interface DelayedFunctionCallFunctionResult {
  // The time between being called and leaving the queue
  // Most functions will return the time it will take to complete the animation or that plus a buffer
  framesAfterCall: number
  // What should be displayed while the animation occurs
  description: string
}

export default class BinarySearchTree implements Tree {
  private root: DataNode | null
  private readonly functionQueue: DelayedFunctionCall[]
  private functionAtFrontOfQueueWasCalled: boolean
  private currentDescription: string
  private arrowDirection: ArrowDirection
  private currentAnimationId: number

  constructor () {
    this.root = null
    this.functionQueue = []
    this.functionAtFrontOfQueueWasCalled = false
    this.currentDescription = ''
    this.arrowDirection = ArrowDirection.PARENT_TO_CHILD
    this.currentAnimationId = 0
  }

  // Animation: highlight path, grow inserted node, then move nodes to new target positions
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

    this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, INSERTION_DESCRIPTIONS.FIND_WHERE_TO_INSERT)

    this.functionQueue.push({ framesToWait: 0, function: () => this.setupInsertionAnimation(value, path[path.length - 1]) })
  }

  // Pushes methods onto functionQueue to highlight nodes along path
  private pushNodeHighlightingOntoFunctionQueue (path: DataNode[], highlightColor: string, description: string): void {
    if (path.length === 0) {
      throw new Error('Path is empty')
    }
    for (let i = 0; i < path.length; i++) {
      const node = path[i]
      let framesToWait: number
      if (i === 0) {
        framesToWait = FRAMES_BEFORE_FIRST_HIGHLIGHT
      } else {
        framesToWait = FRAMES_BETWEEN_HIGHLIGHTS
      }

      let framesAfterCall: number
      framesAfterCall = HIGHLIGHT_DURATION_FRAMES
      if (i === path.length - 1) {
        framesAfterCall += FRAMES_AFTER_LAST_HIGHLIGHT
      }

      this.functionQueue.push({ framesToWait, function: () => { node.displayNode.highlight(highlightColor); return { framesAfterCall, description } } })
    }
  }

  // Creates node and tells nodes to start moving to new target positions
  private setupInsertionAnimation (value: number, parent: DataNode): DelayedFunctionCallFunctionResult {
    if (value < parent.displayNode.value) {
      parent.left = makeDataNode(parent.displayNode.targetX - TARGET_X_GAP, parent.displayNode.targetY + TARGET_Y_GAP, value)
    } else {
      parent.right = makeDataNode(parent.displayNode.targetX + TARGET_X_GAP, parent.displayNode.targetY + TARGET_Y_GAP, value)
    }
    this.setTargetPositions()
    return { framesAfterCall: MOVE_DURATION_FRAMES, description: INSERTION_DESCRIPTIONS.INSERT_NEW_NODE }
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

    this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE)
    if (currNode != null) {
      this.pushOptionalShrinkAndSetupDeletionAnimationToQueue(currNode, currParent, false)
    }
  }

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
  }

  animate (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Call ready functions in functionQueue
    while (this.functionQueue.length > 0 && this.functionQueue[0].framesToWait === 0) {
      if (!this.functionAtFrontOfQueueWasCalled) {
        const functionCall = this.functionQueue[0]
        if (functionCall == null) {
          throw new Error('Function call is null')
        }
        const result = functionCall.function()
        this.currentDescription = result.description

        // Keep function at front of queue for framesAfterCall frames, to give the animation time to complete and show the description
        if (result.framesAfterCall > 0) {
          this.functionAtFrontOfQueueWasCalled = true
          this.functionQueue[0].framesToWait = result.framesAfterCall
        } else {
          this.functionQueue.shift()
        }
      } else {
        this.functionAtFrontOfQueueWasCalled = false
        this.functionQueue.shift()
      }
    }

    if (this.functionQueue.length > 0) {
      this.functionQueue[0].framesToWait--
    }

    if (this.root != null) {
      const arbitraryTraversal = this.root.getInorderTraversal()
      // Draw arrows first
      if (this.arrowDirection === ArrowDirection.PARENT_TO_CHILD) {
        arbitraryTraversal.forEach((node) => {
          if (node.left != null) {
            drawArrowFromNodeToNode(node, node.left, context)
          }
          if (node.right != null) {
            drawArrowFromNodeToNode(node, node.right, context)
          }
        })
      } else {
        const traversal = this.root.getTraversal(this.arrowDirection)
        for (let i = 0; i < traversal.length - 1; i++) {
          const node = traversal[i]
          const nextNode = traversal[i + 1]
          drawArrowFromNodeToNode(node, nextNode, context)
        }
      }

      // Draw nodes
      arbitraryTraversal.forEach((node) => {
        node.displayNode.drawAndUpdate(context)
      })
    }

    // Update description
    const animationDescription = document.getElementById('animationDescription') as HTMLParagraphElement
    if (animationDescription == null) {
      throw new Error('animationDescription not found')
    }
    animationDescription.textContent = this.currentDescription

    // Disable buttons if animation is happening
    const operationPanel = document.getElementById('operationPanel')
    if (operationPanel == null) {
      throw new Error('operationPanel not found')
    }
    if (this.functionQueue.length === 0) {
      operationPanel.classList.remove('disabled')
    } else {
      operationPanel.classList.add('disabled')
    }

    this.currentAnimationId = requestAnimationFrame(() => { this.animate(canvas, context) })
  }

  stopAnimationPermanently (): void {
    cancelAnimationFrame(this.currentAnimationId)
  }

  // Nodes are equally spaced horizontally based on their inorder traversal
  private targetXs (): Map<DataNode, number> {
    const nodeToTargetX = new Map<DataNode, number>()
    if (this.root == null) {
      throw new Error('Root is null')
    }

    const inorderTraversal = this.root.getInorderTraversal()
    const rootIndex = inorderTraversal.indexOf(this.root)
    for (let i = 0; i < inorderTraversal.length; i++) {
      const node = inorderTraversal[i]
      nodeToTargetX.set(node, ROOT_TARGET_X + (i - rootIndex) * TARGET_X_GAP)
    }
    return nodeToTargetX
  }

  // Layers are equally spaced vertically based on their depth
  private targetYs (): Map<DataNode, number> {
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

  private setTargetPositions (): void {
    if (this.root == null) {
      return
    }
    const nodeToTargetX = this.targetXs()
    const nodeToTargetY = this.targetYs()
    for (const node of this.root.getInorderTraversal()) {
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

  setArrowDirection (arrowDirection: ArrowDirection): void {
    this.arrowDirection = arrowDirection
  }
}
