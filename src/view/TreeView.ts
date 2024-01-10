import {
  ARROW_HEAD_ANGLE,
  ARROW_HEAD_LENGTH,
  ARROW_LINE_WIDTH,
  FRAMES_AFTER_LAST_HIGHLIGHT,
  FRAMES_BEFORE_FIRST_HIGHLIGHT,
  FRAMES_BETWEEN_HIGHLIGHTS,
  DEFAULT_HIGHLIGHT_DURATION_FRAMES,
  ROOT_TARGET_X,
  ROOT_TARGET_Y,
  TARGET_X_GAP,
  TARGET_Y_GAP
} from './Constants'
import type DisplayNode from './DisplayNode'
import { drawArrowFromNodeToNode } from './Utils'
import type DelayedFunctionCall from './delayedFunctionCall/DelayedFunctionCall'
import type TreeShape from '../controller/TreeShape'
import type BSTPathInstruction from '../controller/pathInstruction/BSTPathInstruction'
import { assert } from '../Utils'
import type BSTSecondaryDescription from '../controller/secondaryDescription/BSTSecondaryDescription'

export default abstract class TreeView {
  public shape: TreeShape<DisplayNode>
  public functionQueue: DelayedFunctionCall[] = []
  private functionAtFrontOfQueueWasCalled: boolean = false
  private description: string = ''
  private secondaryDescription?: string = undefined
  private currentAnimationId: number = -1
  private animationSpeed: number = 1
  private animationSpeedSetting: number = 10

  constructor () {
    this.shape = { inorderTraversal: [], layers: [], arrows: new Set() }
  }

  // Pushes methods onto functionQueue to highlight nodes along path
  public pushNodeHighlightingOntoFunctionQueue<S extends BSTSecondaryDescription> (path: Array<BSTPathInstruction<DisplayNode, S>>, highlightColor: string, description: string): void {
    assert(path.length > 0, 'Path is empty')
    for (let i = 0; i < path.length; i++) {
      const node = path[i].node
      let framesToWait: number
      if (i === 0) {
        framesToWait = FRAMES_BEFORE_FIRST_HIGHLIGHT
      } else {
        framesToWait = FRAMES_BETWEEN_HIGHLIGHTS
      }

      let framesAfterCall: number
      framesAfterCall = DEFAULT_HIGHLIGHT_DURATION_FRAMES
      if (i === path.length - 1) {
        framesAfterCall += FRAMES_AFTER_LAST_HIGHLIGHT
      }

      // TODO get secondary descriptions from path instructions
      this.functionQueue.push({ framesToWait, function: () => { node.highlight(highlightColor); return { framesAfterCall, description, secondaryDescription: this.convertSecondaryDescriptionToString(path[i].secondaryDescription) } } })
    }
  }

  // TODO perhaps move this to BSTView, depending on if AVLView uses it
  private convertSecondaryDescriptionToString (secondaryDescription: BSTSecondaryDescription): string {
    switch (secondaryDescription.type) {
      case 'insert':
        switch (secondaryDescription.direction) {
          case 'left':
            return `Go left because ${secondaryDescription.targetValue} < ${secondaryDescription.nodeValue}`
          case 'right':
            return `Go right because ${secondaryDescription.targetValue} >= ${secondaryDescription.nodeValue}`
        }
        break
      case 'find':
        switch (secondaryDescription.direction) {
          case 'left':
            return `Go left because ${secondaryDescription.targetValue} < ${secondaryDescription.nodeValue}`
          case 'right':
            return `Go right because ${secondaryDescription.targetValue} > ${secondaryDescription.nodeValue}`
          case 'stop':
            return `Stop because ${secondaryDescription.targetValue} = ${secondaryDescription.nodeValue}`
        }
        break
      case 'successor':
        switch (secondaryDescription.direction) {
          case 'left':
            return 'Go left because there is a left child'
          case 'stop':
            return 'Stop because there is no left child'
        }
    }
  }

  // Updates the functionQueue, draws on the canvas, then requests another animation frame for itself
  public animate (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Call ready functions in functionQueue
    while (this.functionQueue.length > 0 && this.functionQueue[0].framesToWait <= 0) {
      if (!this.functionAtFrontOfQueueWasCalled) {
        const functionCall = this.functionQueue[0]
        assert(functionCall !== undefined, 'Function call is undefined')
        const result = functionCall.function()
        this.description = result.description
        this.secondaryDescription = result.secondaryDescription

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
    assert(animationDescription !== null, 'animationDescription not found')
    animationDescription.textContent = this.description

    // Update secondary description
    const secondaryAnimationDescription = document.getElementById('secondaryAnimationDescription') as HTMLParagraphElement
    assert(secondaryAnimationDescription !== null, 'secondaryAnimationDescription not found')
    if (this.secondaryDescription == null) {
      secondaryAnimationDescription.textContent = ''
    } else {
      secondaryAnimationDescription.textContent = this.secondaryDescription
    }

    // Disable buttons if animation is happening
    const insertDiv = document.getElementById('insert')
    const deleteDiv = document.getElementById('delete')
    const findDiv = document.getElementById('find')
    const clearButton = document.getElementById('clearButton')
    const arrowButton = document.getElementById('arrowButton')
    assert(insertDiv !== null && deleteDiv !== null && findDiv !== null && clearButton !== null && arrowButton !== null, 'insert, delete, find, clearButton, or arrowButton not found')
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

  public stopAnimation (): void {
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
      assert(targetX !== undefined, 'TargetX is undefined')
      const targetY = nodeToTargetY.get(node)
      assert(targetY !== undefined, 'TargetY is undefined')
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

  public setArrows (arrows: Set<[DisplayNode, DisplayNode]>): void {
    this.shape.arrows = arrows
  }
}
