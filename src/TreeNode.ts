const FRAMES_TO_MOVE = 300;

class TreeNode {
  x: number;
  y: number;
  radius: number;
  fillColor: string;
  strokeColor: string;
  private speedX: number;
  private speedY: number;
  private framesUntilStop: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    fillColor: string,
    strokeColor: string
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.speedX = 0;
    this.speedY = 0;
    this.framesUntilStop = 0;
  }

  update() {
    if (this.framesUntilStop === 0) {
      this.stop();
    } else if (this.framesUntilStop > 0) {
      this.framesUntilStop--;
    }
    this.x += this.speedX;
    this.y += this.speedY;
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.fillColor;
    context.fill();
    context.strokeStyle = this.strokeColor;
    context.stroke();
  }

  drawAndUpdate (context: CanvasRenderingContext2D) {
    this.draw(context);
    this.update();
  }

  stop() {
    this.speedX = 0;
    this.speedY = 0;
  }

  moveTo(targetX: number, targetY: number) {
    this.framesUntilStop = FRAMES_TO_MOVE;
    this.speedX = (targetX - this.x) / FRAMES_TO_MOVE;
    this.speedY = (targetY - this.y) / FRAMES_TO_MOVE;
  }
}

export default TreeNode;
