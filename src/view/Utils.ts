import type DisplayNode from './DisplayNode'

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

const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, context: CanvasRenderingContext2D, arrowHeadAngle: number, arrowHeadLength: number, arrowLineWidth: number): void => {
  const dx = toX - fromX
  const dy = toY - fromY
  const angle = Math.atan2(dy, dx)

  context.beginPath()
  context.lineWidth = arrowLineWidth
  context.moveTo(fromX, fromY)
  context.lineTo(toX, toY)
  context.lineTo(toX - arrowHeadLength * Math.cos(angle - arrowHeadAngle), toY - arrowHeadLength * Math.sin(angle - arrowHeadAngle))
  context.moveTo(toX, toY)
  context.lineTo(toX - arrowHeadLength * Math.cos(angle + arrowHeadAngle), toY - arrowHeadLength * Math.sin(angle + arrowHeadAngle))
  context.stroke()
}

export const drawArrowFromNodeToNode = (fromNode: DisplayNode, toNode: DisplayNode, context: CanvasRenderingContext2D, arrowHeadAngle: number, arrowHeadLength: number, arrowLineWidth: number): void => {
  const dx = toNode.x - fromNode.x
  const dy = toNode.y - fromNode.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const xOffsetFromCenter = dx * toNode.currentRadius / dist
  const yOffsetFromCenter = dy * toNode.currentRadius / dist
  drawArrow(fromNode.x, fromNode.y, toNode.x - xOffsetFromCenter, toNode.y - yOffsetFromCenter, context, arrowHeadAngle, arrowHeadLength, arrowLineWidth)
}

/* export const makeDataNode = (targetX: number, targetY: number, value: number): DataNode => {
  return new DataNode(new DisplayNode(targetX, targetY, FILL_COLOR, STROKE_COLOR, value))
} */
