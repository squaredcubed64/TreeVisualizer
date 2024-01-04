import {
  MOVE_DURATION_FRAMES,
  HIGHLIGHT_DURATION_FRAMES as DEFAULT_HIGHLIGHT_DURATION_FRAMES,
  BORDER_WIDTH,
  HIGHLIGHT_WIDTH,
  GROW_DURATION_FRAMES,
  TEXT_COLOR,
  TEXT_FONT,
  TEXT_Y_OFFSET,
  SHRINK_DURATION_FRAMES,
  DEFAULT_HIGHLIGHT_COLOR,
  motionCurve,
  MAX_RADIUS,
  radiusGrowthCurve,
  radiusShrinkingCurve,
  MIN_RADIUS_TO_DRAW_TEXT
} from './Constants'

export default class DisplayNode {
  x: number
  y: number
  private previousX: number
  private previousY: number
  targetX: number
  targetY: number
  currentRadius: number
  private readonly fillColor: string
  private readonly strokeColor: string
  private highlightColor: string
  public value: number
  private framesUntilStop: number
  private framesUntilUnhighlighted: number
  private framesUntilGrown: number
  private framesUntilShrunk: number

  constructor (
    x: number,
    y: number,
    fillColor: string,
    strokeColor: string,
    value: number
  ) {
    this.x = x
    this.y = y
    this.previousX = x
    this.previousY = y
    this.targetX = x
    this.targetY = y
    this.fillColor = fillColor
    this.strokeColor = strokeColor
    this.value = value
    this.framesUntilStop = 0
    this.framesUntilGrown = GROW_DURATION_FRAMES
    this.framesUntilShrunk = -1
    this.currentRadius = 0
  }

  // animationSpeed is a multiplier for the speed of all changes
  update (animationSpeed: number): void {
    this.framesUntilStop = Math.max(this.framesUntilStop - animationSpeed, 0)
    this.framesUntilGrown = Math.max(this.framesUntilGrown - animationSpeed, 0)
    this.framesUntilUnhighlighted = Math.max(this.framesUntilUnhighlighted - animationSpeed, 0)
    if (this.framesUntilShrunk !== -1) {
      this.framesUntilShrunk = Math.max(this.framesUntilShrunk - animationSpeed, 0)
    }

    // 0 < motionProgress < 1
    const motionProgress = (MOVE_DURATION_FRAMES - this.framesUntilStop) / MOVE_DURATION_FRAMES
    this.x = this.previousX + (this.targetX - this.previousX) * motionCurve(motionProgress)
    this.y = this.previousY + (this.targetY - this.previousY) * motionCurve(motionProgress)

    // If it is being deleted
    if (this.framesUntilShrunk >= 0) {
      const shrinkingProgress = (SHRINK_DURATION_FRAMES - this.framesUntilShrunk) / SHRINK_DURATION_FRAMES
      this.currentRadius = MAX_RADIUS * radiusShrinkingCurve(shrinkingProgress)
    } else {
      const growthProgress = (GROW_DURATION_FRAMES - this.framesUntilGrown) / GROW_DURATION_FRAMES
      this.currentRadius = MAX_RADIUS * radiusGrowthCurve(growthProgress)
    }
  }

  draw (context: CanvasRenderingContext2D): void {
    // Highlight
    if (this.framesUntilUnhighlighted > 0) {
      context.beginPath()
      context.arc(this.x, this.y, this.currentRadius + HIGHLIGHT_WIDTH, 0, Math.PI * 2, false)
      context.fillStyle = this.highlightColor
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
    if (this.currentRadius >= MIN_RADIUS_TO_DRAW_TEXT) {
      context.fillStyle = TEXT_COLOR
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.font = TEXT_FONT
      context.fillText(this.value.toString(), this.x, this.y + TEXT_Y_OFFSET)
    }
  }

  drawAndUpdate (context: CanvasRenderingContext2D, animationSpeed: number): void {
    this.draw(context)
    this.update(animationSpeed)
  }

  moveTo (targetX: number, targetY: number): void {
    this.framesUntilStop = MOVE_DURATION_FRAMES
    this.previousX = this.x
    this.previousY = this.y
    this.targetX = targetX
    this.targetY = targetY
  }

  highlight (color: string = DEFAULT_HIGHLIGHT_COLOR, durationFrames: number = DEFAULT_HIGHLIGHT_DURATION_FRAMES): void {
    this.highlightColor = color
    this.framesUntilUnhighlighted = durationFrames
  }

  unhighlight (): void {
    this.framesUntilUnhighlighted = 0
  }

  startShrinkingIntoNothing (): void {
    this.framesUntilShrunk = SHRINK_DURATION_FRAMES
  }
}
