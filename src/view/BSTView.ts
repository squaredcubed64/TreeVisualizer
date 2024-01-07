import {
  ROOT_TARGET_X,
  ROOT_TARGET_Y,
  TARGET_X_GAP,
  TARGET_Y_GAP,
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
  FILL_COLOR,
  STROKE_COLOR,
  ARROW_HEAD_ANGLE,
  ARROW_HEAD_LENGTH,
  ARROW_LINE_WIDTH
} from './Constants'
import { drawArrowFromNodeToNode } from './Utils'
import type DisplayNode from './DisplayNode'
import type DelayedFunctionCall from './DelayedFunctionCall'
import type DelayedFunctionCallFunctionResult from './DelayedFunctionCallFunctionResult'
import type DisplayTreeShape from './DisplayTreeShape'
import type ViewInsertionInformation from './ViewInsertionInformation'

export default class BSTView {
  private shape: DisplayTreeShape
  private readonly functionQueue: DelayedFunctionCall[]
  private functionAtFrontOfQueueWasCalled: boolean
  private currentDescription: string
  private currentAnimationId: number
  private animationSpeed: number

  constructor () {
    this.shape = { inorderTraversal: [], layers: [], arrows: [] }
    this.functionQueue = []
    this.functionAtFrontOfQueueWasCalled = false
    this.currentDescription = ''
    this.currentAnimationId = 0
    this.animationSpeed = 1
  }

  // Animation: highlight path, grow inserted node, then move nodes to new target positions
  insert (viewInsertionInformation: ViewInsertionInformation): void {
    const { shapeWithPlaceholder, path, valueToInsert, placeholderNode } = viewInsertionInformation

    // If the tree is empty, set the root without animating
    if (this.shape.inorderTraversal.length === 0) {
      this.preparePlaceholderColorsAndValue(placeholderNode, valueToInsert)
      placeholderNode.x = ROOT_TARGET_X
      placeholderNode.y = ROOT_TARGET_Y
      this.shape = shapeWithPlaceholder
      this.setTargetPositions()
      return
    }

    // Animate finding where to insert
    this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, INSERTION_DESCRIPTIONS.FIND_WHERE_TO_INSERT)

    // Animate inserting
    this.functionQueue.push({ framesToWait: 0, function: () => this.setupInsertionAnimation(valueToInsert, shapeWithPlaceholder, placeholderNode, path[path.length - 1]) })
  }

  // Pushes methods onto functionQueue to highlight nodes along path
  private pushNodeHighlightingOntoFunctionQueue (path: DisplayNode[], highlightColor: string, description: string): void {
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

      this.functionQueue.push({ framesToWait, function: () => { node.highlight(highlightColor); return { framesAfterCall, description } } })
    }
  }

  // Prepares the placeholder node and tells nodes to start moving to new target positions
  private setupInsertionAnimation (valueToInsert: number, shapeWithPlaceholder: DisplayTreeShape, placeholderNode: DisplayNode, parent: DisplayNode): DelayedFunctionCallFunctionResult {
    this.preparePlaceholderColorsAndValue(placeholderNode, valueToInsert)
    if (placeholderNode.value < parent.value) {
      placeholderNode.x = parent.x - TARGET_X_GAP
    } else {
      placeholderNode.x = parent.x + TARGET_X_GAP
    }
    placeholderNode.y = parent.y + TARGET_Y_GAP

    this.shape = shapeWithPlaceholder
    this.setTargetPositions()
    return { framesAfterCall: MOVE_DURATION_FRAMES, description: INSERTION_DESCRIPTIONS.INSERT_NEW_NODE }
  }

  private preparePlaceholderColorsAndValue (placeholderNode: DisplayNode, value: number): void {
    placeholderNode.fillColor = FILL_COLOR
    placeholderNode.strokeColor = STROKE_COLOR
    placeholderNode.value = value
  }

  // Animation: highlight path, shrink victim node, then move other nodes to new target positions
  /* delete (value: number): void {
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

  // Updates the functionQueue, draws on the canvas, then requests another animation frame for itself
  animate (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Call ready functions in functionQueue
    while (this.functionQueue.length > 0 && this.functionQueue[0].framesToWait <= 0) {
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
      this.functionQueue[0].framesToWait -= this.animationSpeed
    }

    // Draw arrows first
    this.shape.arrows.forEach((pair) => {
      drawArrowFromNodeToNode(pair[0], pair[1], context, ARROW_HEAD_ANGLE, ARROW_HEAD_LENGTH, ARROW_LINE_WIDTH)
    })

    // Draw nodes
    this.shape.inorderTraversal.forEach((node) => {
      node.drawAndUpdate(context, this.animationSpeed)
    })

    // Update description
    const animationDescription = document.getElementById('animationDescription') as HTMLParagraphElement
    if (animationDescription == null) {
      throw new Error('animationDescription not found')
    }
    animationDescription.textContent = this.currentDescription

    // Disable buttons if animation is happening
    const insertDiv = document.getElementById('insert')
    const deleteDiv = document.getElementById('delete')
    const findDiv = document.getElementById('find')
    const clearButton = document.getElementById('clearButton')
    const arrowButton = document.getElementById('arrowButton')
    if (insertDiv == null || deleteDiv == null || findDiv == null || clearButton == null || arrowButton == null) {
      throw new Error('insert, delete, find, clearButton, or arrowButton not found')
    }
    const operations = [insertDiv, deleteDiv, findDiv, clearButton, arrowButton]
    if (this.functionQueue.length === 0) {
      operations.forEach((operation) => {
        operation.classList.remove('disabled')
      })
    } else {
      operations.forEach((operation) => {
        operation.classList.add('disabled')
      })
    }

    this.currentAnimationId = requestAnimationFrame(() => { this.animate(canvas, context) })
  }

  stopAnimationPermanently (): void {
    cancelAnimationFrame(this.currentAnimationId)
  }

  // Nodes are equally spaced horizontally based on their inorder traversal
  private calculateTargetXs (): Map<DisplayNode, number> {
    const nodeToTargetX = new Map<DisplayNode, number>()
    const root = this.shape.layers[0][0]
    const rootIndex = this.shape.inorderTraversal.indexOf(root)
    for (let i = 0; i < this.shape.inorderTraversal.length; i++) {
      const node = this.shape.inorderTraversal[i]
      nodeToTargetX.set(node, ROOT_TARGET_X + (i - rootIndex) * TARGET_X_GAP)
    }
    return nodeToTargetX
  }

  // Layers are equally spaced vertically based on their depth
  private calculateTargetYs (): Map<DisplayNode, number> {
    const nodeToTargetY = new Map<DisplayNode, number>()
    for (let i = 0; i < this.shape.layers.length; i++) {
      const layer = this.shape.layers[i]
      const layerY = ROOT_TARGET_Y + i * TARGET_Y_GAP
      for (const node of layer) {
        nodeToTargetY.set(node, layerY)
      }
    }
    return nodeToTargetY
  }

  // Tell all nodes to start moving to new targets
  private setTargetPositions (): void {
    const nodeToTargetX = this.calculateTargetXs()
    const nodeToTargetY = this.calculateTargetYs()
    // Use of inorder traversal here is arbitrary
    for (const node of this.shape.inorderTraversal) {
      const targetX = nodeToTargetX.get(node)
      if (targetX == null) {
        throw new Error('TargetX is null')
      }
      const targetY = nodeToTargetY.get(node)
      if (targetY == null) {
        throw new Error('TargetY is null')
      }
      node.moveTo(targetX, targetY)
    }
  }

  setAnimationSpeed (speedSetting: number): void {
    this.animationSpeed = 1.2 ** (speedSetting - 10)
  }
}
