import { ARROW_HEAD_ANGLE, ARROW_HEAD_LENGTH, ARROW_LINE_WIDTH, FILL_COLOR, STROKE_COLOR } from './Constants'
import DataNode from './DataNode'
import DisplayNode from './DisplayNode'

// Curves that start at 0, 0 and go to 1, 1
export const motionCurve = (progress: number): number => {
  if (progress < 0 || progress > 1) {
    throw new Error('progress must be between 0 and 1')
  }
  return progress * progress * (3 - 2 * progress)
}
export const radiusGrowthCurve = (progress: number): number => {
  if (progress < 0 || progress > 1) {
    throw new Error('progress must be between 0 and 1')
  }
  return progress * progress * (3 - 2 * progress)
}
// Curve that starts at 1, 1 and goes to 0, 0
export const radiusShrinkingCurve = (progress: number): number => {
  if (progress < 0 || progress > 1) {
    throw new Error('progress must be between 0 and 1')
  }
  return 1 - progress * progress * (3 - 2 * progress)
}

export const resizeCanvas = (canvas: HTMLCanvasElement): void => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, context: CanvasRenderingContext2D): void => {
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

export const drawArrowFromNodeToNode = (fromNode: DataNode, toNode: DataNode, context: CanvasRenderingContext2D): void => {
  const dx = toNode.displayNode.x - fromNode.displayNode.x
  const dy = toNode.displayNode.y - fromNode.displayNode.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const xOffsetFromCenter = dx * toNode.displayNode.currentRadius / dist
  const yOffsetFromCenter = dy * toNode.displayNode.currentRadius / dist
  drawArrow(fromNode.displayNode.x, fromNode.displayNode.y, toNode.displayNode.x - xOffsetFromCenter, toNode.displayNode.y - yOffsetFromCenter, context)
}

export const makeDataNode = (targetX: number, targetY: number, value: number): DataNode => {
  return new DataNode(new DisplayNode(targetX, targetY, FILL_COLOR, STROKE_COLOR, value))
}
