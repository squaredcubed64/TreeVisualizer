import {
  ARROW_HEAD_ANGLE,
  ARROW_HEAD_LENGTH,
  ARROW_LINE_WIDTH,
  FRAMES_AFTER_LAST_HIGHLIGHT,
  FRAMES_BEFORE_FIRST_HIGHLIGHT,
  FRAMES_BETWEEN_HIGHLIGHTS,
  HIGHLIGHT_DURATION_FRAMES,
  ROOT_TARGET_X,
  ROOT_TARGET_Y,
  TARGET_X_GAP,
  TARGET_Y_GAP
} from './Constants'
import type DisplayNode from './DisplayNode'
import { drawArrowFromNodeToNode } from './Utils'
import type DelayedFunctionCall from './DelayedFunctionCall'
import type DisplayTreeShape from './DisplayTreeShape'

export default class TreeView {
  public shape: DisplayTreeShape
  public functionQueue: DelayedFunctionCall[]
  private functionAtFrontOfQueueWasCalled: boolean
  private currentDescription: string
  private currentAnimationId: number
  private animationSpeed: number
  private animationSpeedSetting: number

  constructor () {
    this.shape = { inorderTraversal: [], layers: [], arrows: [] }
    this.functionQueue = []
    this.functionAtFrontOfQueueWasCalled = false
    this.currentDescription = ''
    this.currentAnimationId = -1
    this.animationSpeed = 1
    this.animationSpeedSetting = 10
  }

  // Pushes methods onto functionQueue to highlight nodes along path
  public pushNodeHighlightingOntoFunctionQueue (path: DisplayNode[], highlightColor: string, description: string): void {
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

  // Updates the functionQueue, draws on the canvas, then requests another animation frame for itself
  public animate (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
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

  public stopAnimationPermanently (): void {
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
  public setTargetPositions (): void {
    if (this.shape.inorderTraversal.length === 0) {
      return
    }
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

  public setAnimationSpeedSetting (animationSpeedSetting: number): void {
    this.animationSpeedSetting = animationSpeedSetting
    this.animationSpeed = 1.2 ** (animationSpeedSetting - 10)
  }

  public getAnimationSpeedSetting (): number {
    return this.animationSpeedSetting
  }

  public setArrows (arrows: Array<[DisplayNode, DisplayNode]>): void {
    this.shape.arrows = arrows
  }
}
