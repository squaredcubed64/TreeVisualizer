const FRAMES_TO_MOVE = 300

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
    this.x += this.speedX
    this.y += this.speedY
  }

  draw (context: CanvasRenderingContext2D): void {
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    context.fillStyle = this.fillColor
    context.fill()
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
    this.framesUntilStop = FRAMES_TO_MOVE
    this.speedX = (targetX - this.x) / FRAMES_TO_MOVE
    this.speedY = (targetY - this.y) / FRAMES_TO_MOVE
    this.targetX = targetX
    this.targetY = targetY
  }
}
