import {
  MOVE_DURATION_FRAMES,
  HIGHLIGHT_DURATION_FRAMES,
  HIGHLIGHT_COLOR,
  BORDER_WIDTH,
  HIGHLIGHT_WIDTH,
  GROW_DURATION_FRAMES,
  TEXT_COLOR,
  TEXT_FONT,
  TEXT_Y_OFFSET
} from './constants.js'

export default class DisplayNode {
  x: number
  y: number
  targetX: number
  targetY: number
  currentRadius: number
  maxRadius: number
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
    maxRadius: number,
    fillColor: string,
    strokeColor: string,
    value: number
  ) {
    this.x = x
    this.y = y
    this.targetX = x
    this.targetY = y
    this.maxRadius = maxRadius
    this.fillColor = fillColor
    this.strokeColor = strokeColor
    this.value = value
    this.speedX = 0
    this.speedY = 0
    this.framesUntilStop = 0
    this.currentRadius = 0
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

    if (this.currentRadius < this.maxRadius) {
      this.currentRadius += this.maxRadius / GROW_DURATION_FRAMES
    }

    this.x += this.speedX
    this.y += this.speedY
  }

  draw (context: CanvasRenderingContext2D): void {
    // Highlight
    if (this.framesUntilUnhighlighted > 0) {
      context.beginPath()
      context.arc(this.x, this.y, this.currentRadius + HIGHLIGHT_WIDTH, 0, Math.PI * 2, false)
      context.fillStyle = HIGHLIGHT_COLOR
      context.fill()
    }

    // Draw circle
    context.beginPath()
    context.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false)
    context.fillStyle = this.fillColor
    context.fill()
    context.lineWidth = BORDER_WIDTH
    context.strokeStyle = this.strokeColor
    context.stroke()

    // Add text
    context.fillStyle = TEXT_COLOR
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = TEXT_FONT
    context.fillText(this.value.toString(), this.x, this.y + TEXT_Y_OFFSET)
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
