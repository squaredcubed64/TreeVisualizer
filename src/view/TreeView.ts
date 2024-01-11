import DisplayNode from './DisplayNode'
import type DelayedFunctionCall from './delayedFunctionCall/DelayedFunctionCall'
import type TreeShape from '../controller/TreeShape'
import { assert } from '../Utils'

export default abstract class TreeView {
  protected static ROOT_TARGET_X = 700
  protected static readonly ROOT_TARGET_Y = 50
  protected static readonly TARGET_X_GAP = 75
  protected static readonly TARGET_Y_GAP = 75
  private static readonly FILL_COLOR = 'pink'
  private static readonly STROKE_COLOR = 'red'
  private static readonly ARROW_HEAD_ANGLE = Math.PI / 6
  private static readonly ARROW_HEAD_LENGTH = 10
  private static readonly ARROW_LINE_WIDTH = 2

  public shape: TreeShape<DisplayNode>
  public functionQueue: DelayedFunctionCall[] = []
  private functionAtFrontOfQueueWasCalled: boolean = false
  private description: string = ''
  private secondaryDescription?: string = undefined
  private currentAnimationId: number = -1
  private animationSpeed: number = 1
  private animationSpeedSetting: number = 10

  public constructor () {
    this.shape = { inorderTraversal: [], layers: [], arrows: new Set() }
  }

  public static makePlaceholderNode (): DisplayNode {
    return new DisplayNode(NaN, NaN, 'placeholder', 'placeholder', NaN)
  }

  public static centerTree (canvasWidth: number): void {
    TreeView.ROOT_TARGET_X = canvasWidth / 2
  }

  protected static preparePlaceholderColorsAndValue (placeholderNode: DisplayNode, value: number): void {
    placeholderNode.fillColor = TreeView.FILL_COLOR
    placeholderNode.strokeColor = TreeView.STROKE_COLOR
    placeholderNode.value = value
  }

  private static drawArrow (fromX: number, fromY: number, toX: number, toY: number, context: CanvasRenderingContext2D): void {
    const dx = toX - fromX
    const dy = toY - fromY
    const angle = Math.atan2(dy, dx)

    context.beginPath()
    context.lineWidth = TreeView.ARROW_LINE_WIDTH
    context.moveTo(fromX, fromY)
    context.lineTo(toX, toY)
    context.lineTo(toX - TreeView.ARROW_HEAD_LENGTH * Math.cos(angle - TreeView.ARROW_HEAD_ANGLE), toY - TreeView.ARROW_HEAD_LENGTH * Math.sin(angle - TreeView.ARROW_HEAD_ANGLE))
    context.moveTo(toX, toY)
    context.lineTo(toX - TreeView.ARROW_HEAD_LENGTH * Math.cos(angle + TreeView.ARROW_HEAD_ANGLE), toY - TreeView.ARROW_HEAD_LENGTH * Math.sin(angle + TreeView.ARROW_HEAD_ANGLE))
    context.stroke()
  }

  private static drawArrowFromNodeToNode (fromNode: DisplayNode, toNode: DisplayNode, context: CanvasRenderingContext2D): void {
    const dx = toNode.x - fromNode.x
    const dy = toNode.y - fromNode.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const xOffsetFromCenter = dx * toNode.currentRadius / dist
    const yOffsetFromCenter = dy * toNode.currentRadius / dist
    TreeView.drawArrow(fromNode.x, fromNode.y, toNode.x - xOffsetFromCenter, toNode.y - yOffsetFromCenter, context)
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
      TreeView.drawArrowFromNodeToNode(pair[0], pair[1], context)
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

  protected animateShapeChange (newShape: TreeShape<DisplayNode>): void {
    this.shape = newShape
    this.setTargetPositions()
  }

  // Nodes are equally spaced horizontally based on their inorder traversal
  private calculateTargetXs (): Map<DisplayNode, number> {
    const nodeToTargetX = new Map<DisplayNode, number>()
    const root = this.shape.layers[0][0]
    const rootIndex = this.shape.inorderTraversal.indexOf(root)
    for (let i = 0; i < this.shape.inorderTraversal.length; i++) {
      const node = this.shape.inorderTraversal[i]
      nodeToTargetX.set(node, TreeView.ROOT_TARGET_X + (i - rootIndex) * TreeView.TARGET_X_GAP)
    }
    return nodeToTargetX
  }

  // Layers are equally spaced vertically based on their depth
  private calculateTargetYs (): Map<DisplayNode, number> {
    const nodeToTargetY = new Map<DisplayNode, number>()
    for (let i = 0; i < this.shape.layers.length; i++) {
      const layer = this.shape.layers[i]
      const layerY = TreeView.ROOT_TARGET_Y + i * TreeView.TARGET_Y_GAP
      for (const node of layer) {
        nodeToTargetY.set(node, layerY)
      }
    }
    return nodeToTargetY
  }
}
