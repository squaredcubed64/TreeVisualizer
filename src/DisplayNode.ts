import {
  MOVE_DURATION_FRAMES,
  HIGHLIGHT_DURATION_FRAMES,
  HIGHLIGHT_COLOR,
  LINE_WIDTH,
  HIGHLIGHT_RADIUS
} from './constants.js'

export default class DisplayNode {
  x: number
  y: number
  targetX: number
  targetY: number
  radius: number
  fillColor: string
  strokeColor: string
  value: number
  private speedX: number
  private speedY: number
  private framesUntilStop: number
  private framesUntilHighlighted: number
  private framesUntilUnhighlighted: number

  constructor (
    x: number,
    y: number,
    radius: number,
    fillColor: string,
    strokeColor: string,
    value: number
  ) {
    this.x = x
    this.y = y
    this.targetX = x
    this.targetY = y
    this.radius = radius
    this.fillColor = fillColor
    this.strokeColor = strokeColor
    this.value = value
    this.speedX = 0
    this.speedY = 0
    this.framesUntilStop = 0
  }

  update (): void {
    if (this.framesUntilStop === 0) {
      this.stop()
    } else if (this.framesUntilStop > 0) {
      this.framesUntilStop--
    }

    if (this.framesUntilHighlighted === 0) {
      this.framesUntilUnhighlighted = HIGHLIGHT_DURATION_FRAMES
      this.framesUntilHighlighted = -1
    } else if (this.framesUntilHighlighted > 0) {
      this.framesUntilHighlighted--
    }

    if (this.framesUntilUnhighlighted > 0) {
      this.framesUntilUnhighlighted--
    }

    this.x += this.speedX
    this.y += this.speedY
  }

  draw (context: CanvasRenderingContext2D): void {
    // Highlight
    if (this.framesUntilUnhighlighted > 0) {
      context.beginPath()
      context.arc(this.x, this.y, HIGHLIGHT_RADIUS, 0, Math.PI * 2, false)
      context.fillStyle = HIGHLIGHT_COLOR
      context.fill()
    }

    // Draw circle
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    context.fillStyle = this.fillColor
    context.fill()
    context.lineWidth = LINE_WIDTH
    context.strokeStyle = this.strokeColor
    context.stroke()

    // Add text
    context.fillStyle = 'black'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = '20px Arial'
    context.fillText(this.value.toString(), this.x, this.y)
  }

  drawAndUpdate (context: CanvasRenderingContext2D): void {
    this.draw(context)
    this.update()
  }

  stop (): void {
    this.speedX = 0
    this.speedY = 0
  }

  moveTo (targetX: number, targetY: number): void {
    this.framesUntilStop = MOVE_DURATION_FRAMES
    this.speedX = (targetX - this.x) / MOVE_DURATION_FRAMES
    this.speedY = (targetY - this.y) / MOVE_DURATION_FRAMES
    this.targetX = targetX
    this.targetY = targetY
  }

  highlightAfterDelay (delayFrames: number): void {
    this.framesUntilHighlighted = delayFrames
  }
}
