import { assert } from '../Utils'

export default class DisplayNode {
  public static readonly MOVE_DURATION_FRAMES = 150
  public static readonly SHRINK_DURATION_FRAMES = 60
  public static readonly DEFAULT_HIGHLIGHT_DURATION_FRAMES = 60
  private static readonly BORDER_WIDTH = 1
  private static readonly HIGHLIGHT_WIDTH = 5
  private static readonly GROW_DURATION_FRAMES = 30
  private static readonly TEXT_COLOR = 'red'
  private static readonly TEXT_FONT = '16px Arial'
  private static readonly TEXT_Y_OFFSET = 2
  private static readonly MIN_RADIUS_TO_DRAW_TEXT = 10
  private static readonly DEFAULT_HIGHLIGHT_COLOR = 'blue'
  private static readonly MAX_RADIUS = 30

  public x: number
  public y: number
  public currentRadius: number = 0
  public fillColor: string
  public strokeColor: string
  public value: number
  private previousX: number
  private previousY: number
  private targetX: number
  private targetY: number
  private highlightColor: string
  private framesUntilStop: number = 0
  private framesUntilUnhighlighted: number
  private framesUntilGrown: number = DisplayNode.GROW_DURATION_FRAMES
  private framesUntilShrunk: number = -1

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
  }

  private static easeInOutCurve (x: number): number {
    return x * x * (3 - 2 * x)
  }

  private static bounceCurve (x: number): number {
    if (x < 0.6) {
      return DisplayNode.easeInOutCurve(x) / 0.648
    } else {
      return 1 + Math.sin(7.5 * Math.PI * (x - 0.6)) / Math.exp(4 * x)
    }
  }

  // Curves that start at 0, 0 and go to 1, 1
  private static motionCurve (progress: number): number {
    assert(progress >= 0 && progress <= 1, 'progress must be between 0 and 1')
    return DisplayNode.easeInOutCurve(progress)
  }

  private static radiusGrowthCurve (progress: number): number {
    assert(progress >= 0 && progress <= 1, 'progress must be between 0 and 1')
    return DisplayNode.easeInOutCurve(progress)
  }

  // Curve that starts at 1, 1 and goes to 0, 0
  private static radiusShrinkingCurve (progress: number): number {
    assert(progress >= 0 && progress <= 1, 'progress must be between 0 and 1')
    return 1 - DisplayNode.easeInOutCurve(progress)
  }

  public drawAndUpdate (context: CanvasRenderingContext2D, animationSpeed: number): void {
    this.draw(context)
    this.update(animationSpeed)
  }

  public moveTo (targetX: number, targetY: number): void {
    this.framesUntilStop = DisplayNode.MOVE_DURATION_FRAMES
    this.previousX = this.x
    this.previousY = this.y
    this.targetX = targetX
    this.targetY = targetY
  }

  public highlight (color: string = DisplayNode.DEFAULT_HIGHLIGHT_COLOR, durationFrames: number = DisplayNode.DEFAULT_HIGHLIGHT_DURATION_FRAMES): void {
    this.highlightColor = color
    this.framesUntilUnhighlighted = durationFrames
  }

  public unhighlight (): void {
    this.framesUntilUnhighlighted = 0
  }

  public startShrinkingIntoNothing (): void {
    this.framesUntilShrunk = DisplayNode.SHRINK_DURATION_FRAMES
  }

  // animationSpeed is a multiplier for the speed of all changes
  private update (animationSpeed: number): void {
    this.framesUntilStop = Math.max(this.framesUntilStop - animationSpeed, 0)
    this.framesUntilGrown = Math.max(this.framesUntilGrown - animationSpeed, 0)
    this.framesUntilUnhighlighted = Math.max(this.framesUntilUnhighlighted - animationSpeed, 0)
    if (this.framesUntilShrunk !== -1) {
      this.framesUntilShrunk = Math.max(this.framesUntilShrunk - animationSpeed, 0)
    }

    // 0 < motionProgress < 1
    const motionProgress = (DisplayNode.MOVE_DURATION_FRAMES - this.framesUntilStop) / DisplayNode.MOVE_DURATION_FRAMES
    this.x = this.previousX + (this.targetX - this.previousX) * DisplayNode.motionCurve(motionProgress)
    this.y = this.previousY + (this.targetY - this.previousY) * DisplayNode.motionCurve(motionProgress)

    // If it is being deleted
    if (this.framesUntilShrunk >= 0) {
      const shrinkingProgress = (DisplayNode.SHRINK_DURATION_FRAMES - this.framesUntilShrunk) / DisplayNode.SHRINK_DURATION_FRAMES
      this.currentRadius = DisplayNode.MAX_RADIUS * DisplayNode.radiusShrinkingCurve(shrinkingProgress)
    } else {
      const growthProgress = (DisplayNode.GROW_DURATION_FRAMES - this.framesUntilGrown) / DisplayNode.GROW_DURATION_FRAMES
      this.currentRadius = DisplayNode.MAX_RADIUS * DisplayNode.radiusGrowthCurve(growthProgress)
    }
  }

  private draw (context: CanvasRenderingContext2D): void {
    // Highlight
    if (this.framesUntilUnhighlighted > 0) {
      context.beginPath()
      context.arc(this.x, this.y, this.currentRadius + DisplayNode.HIGHLIGHT_WIDTH, 0, Math.PI * 2, false)
      context.fillStyle = this.highlightColor
      context.fill()
    }

    // Draw circle
    context.beginPath()
    context.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false)
    context.fillStyle = this.fillColor
    context.fill()
    context.lineWidth = DisplayNode.BORDER_WIDTH
    context.strokeStyle = this.strokeColor
    context.stroke()

    // Add text
    if (this.currentRadius >= DisplayNode.MIN_RADIUS_TO_DRAW_TEXT) {
      context.fillStyle = DisplayNode.TEXT_COLOR
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.font = DisplayNode.TEXT_FONT
      context.fillText(this.value.toString(), this.x, this.y + DisplayNode.TEXT_Y_OFFSET)
    }
  }
}
