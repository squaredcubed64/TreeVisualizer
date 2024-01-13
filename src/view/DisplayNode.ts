import { assert } from "../Utils";
import { DURATION_MULTIPLIER } from "./Constants";

/**
 * A node that is drawn on the canvas.
 */
export default class DisplayNode {
  public static readonly MOVE_DURATION_FRAMES = 150 * DURATION_MULTIPLIER;
  public static readonly SHRINK_DURATION_FRAMES = 60 * DURATION_MULTIPLIER;
  public static readonly DEFAULT_HIGHLIGHT_DURATION_FRAMES =
    60 * DURATION_MULTIPLIER;

  private static readonly GROW_DURATION_FRAMES = 30 * DURATION_MULTIPLIER;
  private static readonly BORDER_WIDTH = 1;
  private static readonly HIGHLIGHT_WIDTH = 5;
  private static readonly TEXT_COLOR = "red";
  private static readonly TEXT_FONT = "16px Arial";
  private static readonly TEXT_Y_OFFSET = 2;
  private static readonly MIN_RADIUS_TO_DRAW_TEXT = 10;
  private static readonly DEFAULT_HIGHLIGHT_COLOR = "blue";
  private static readonly MAX_RADIUS = 30;

  public x: number;
  public y: number;
  public currentRadius: number = 0;
  public fillColor: string;
  public strokeColor: string;
  public value: number;
  private previousX: number;
  private previousY: number;
  private targetX: number;
  private targetY: number;
  private highlightColor: string;
  private framesUntilStop: number = 0;
  private framesUntilUnhighlighted: number;
  private framesUntilGrown: number = DisplayNode.GROW_DURATION_FRAMES;
  private framesUntilShrunk: number = -1;

  public constructor(
    x: number,
    y: number,
    fillColor: string,
    strokeColor: string,
    value: number,
  ) {
    this.x = x;
    this.y = y;
    this.previousX = x;
    this.previousY = y;
    this.targetX = x;
    this.targetY = y;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.value = value;
  }

  /**
   * Curve that starts at (0, 0) and ends at (1, 1), with movement being slow at the start and end.
   * @param x A number between 0 and 1
   * @returns The y value of the curve at x
   */
  private static easeInOutCurve(x: number): number {
    return x * x * (3 - 2 * x);
  }

  /**
   * Curve that starts at (0, 0) and ends at (1, 1), with movement being slow at the start and springy at the end.
   * @param x A number between 0 and 1
   * @returns The y value of the curve at x
   */
  private static bounceCurve(x: number): number {
    if (x < 0.6) {
      return DisplayNode.easeInOutCurve(x) / 0.648;
    } else {
      return 1 + Math.sin(7.5 * Math.PI * (x - 0.6)) / Math.exp(4 * x);
    }
  }

  /**
   * Curve that represents the motion of the node as it moves from its previous position to its target position.
   *
   * It starts at (0, 0) and ends at (1, 1), with movement being slow at the start and end.
   * @param progress The proportion of the animation's time that has passed, between 0 and 1
   * @returns The proportion of the animation's distance that should be covered, between 0 and 1
   */
  private static motionCurve(progress: number): number {
    assert(progress >= 0 && progress <= 1, "progress must be between 0 and 1");
    return DisplayNode.easeInOutCurve(progress);
  }

  /**
   * Curve that represents the growth of the node's radius as it is inserted.
   *
   * It starts at (0, 0) and ends at (1, 1), with growth being slow at the start and end.
   * @param progress The proportion of the animation's time that has passed, between 0 and 1
   * @returns The proportion of the max radius that the radius should be, between 0 and 1
   */
  private static radiusGrowthCurve(progress: number): number {
    assert(progress >= 0 && progress <= 1, "progress must be between 0 and 1");
    return DisplayNode.easeInOutCurve(progress);
  }

  /**
   * Curve that represents the shrinking of the node's radius as it is deleted.
   *
   * It starts at (0, 1) and ends at (1, 0), with shrinking being slow at the start and end.
   * @param progress The proportion of the animation's time that has passed, between 0 and 1
   * @returns The proportion of the max radius that the radius should be, between 0 and 1
   */
  private static radiusShrinkingCurve(progress: number): number {
    assert(progress >= 0 && progress <= 1, "progress must be between 0 and 1");
    return 1 - DisplayNode.easeInOutCurve(progress);
  }

  public drawAndUpdate(
    context: CanvasRenderingContext2D,
    animationSpeed: number,
  ): void {
    this.draw(context);
    this.update(animationSpeed);
  }

  /**
   * Move the node to the given coordinates over MOVE_DURATION_FRAMES frames.
   * @param targetX The x coordinate to move to
   * @param targetY The y coordinate to move to
   */
  public moveTo(targetX: number, targetY: number): void {
    this.framesUntilStop = DisplayNode.MOVE_DURATION_FRAMES;
    this.previousX = this.x;
    this.previousY = this.y;
    this.targetX = targetX;
    this.targetY = targetY;
  }

  /**
   * Highlight the node with the given color for the given number of frames.
   * @param color The color to highlight the node with.
   * @param durationFrames The number of frames to highlight the node for. Can be set to Infinity to keep the node highlighted.
   */
  public highlight(
    color: string = DisplayNode.DEFAULT_HIGHLIGHT_COLOR,
    durationFrames: number = DisplayNode.DEFAULT_HIGHLIGHT_DURATION_FRAMES,
  ): void {
    this.highlightColor = color;
    this.framesUntilUnhighlighted = durationFrames;
  }

  /**
   * Stop highlighting the node.
   */
  public unhighlight(): void {
    this.framesUntilUnhighlighted = 0;
  }

  /**
   * Start decreasing the node's radius. It should be deleted when the radius reaches 0.
   */
  public startShrinkingIntoNothing(): void {
    this.framesUntilShrunk = DisplayNode.SHRINK_DURATION_FRAMES;
  }

  /**
   * Update the node's position, radius, and time left highlighted based on the given animation speed.
   * @param animationSpeed The number of frames to advance by. Can be a fraction.
   */
  private update(animationSpeed: number): void {
    this.framesUntilStop = Math.max(this.framesUntilStop - animationSpeed, 0);
    this.framesUntilGrown = Math.max(this.framesUntilGrown - animationSpeed, 0);
    this.framesUntilUnhighlighted = Math.max(
      this.framesUntilUnhighlighted - animationSpeed,
      0,
    );
    if (this.framesUntilShrunk !== -1) {
      this.framesUntilShrunk = Math.max(
        this.framesUntilShrunk - animationSpeed,
        0,
      );
    }

    // 0 < motionProgress < 1
    const motionProgress =
      (DisplayNode.MOVE_DURATION_FRAMES - this.framesUntilStop) /
      DisplayNode.MOVE_DURATION_FRAMES;
    this.x =
      this.previousX +
      (this.targetX - this.previousX) * DisplayNode.motionCurve(motionProgress);
    this.y =
      this.previousY +
      (this.targetY - this.previousY) * DisplayNode.motionCurve(motionProgress);

    // If it is being deleted
    if (this.framesUntilShrunk >= 0) {
      const shrinkingProgress =
        (DisplayNode.SHRINK_DURATION_FRAMES - this.framesUntilShrunk) /
        DisplayNode.SHRINK_DURATION_FRAMES;
      this.currentRadius =
        DisplayNode.MAX_RADIUS *
        DisplayNode.radiusShrinkingCurve(shrinkingProgress);
    } else {
      const growthProgress =
        (DisplayNode.GROW_DURATION_FRAMES - this.framesUntilGrown) /
        DisplayNode.GROW_DURATION_FRAMES;
      this.currentRadius =
        DisplayNode.MAX_RADIUS * DisplayNode.radiusGrowthCurve(growthProgress);
    }
  }

  /**
   * Draw the node on the canvas.
   * @param context The canvas context to draw on
   */
  private draw(context: CanvasRenderingContext2D): void {
    // Highlight
    if (this.framesUntilUnhighlighted > 0) {
      context.beginPath();
      context.arc(
        this.x,
        this.y,
        this.currentRadius + DisplayNode.HIGHLIGHT_WIDTH,
        0,
        Math.PI * 2,
        false,
      );
      context.fillStyle = this.highlightColor;
      context.fill();
    }

    // Draw circle
    context.beginPath();
    context.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false);
    context.fillStyle = this.fillColor;
    context.fill();
    context.lineWidth = DisplayNode.BORDER_WIDTH;
    context.strokeStyle = this.strokeColor;
    context.stroke();

    // Add text
    if (this.currentRadius >= DisplayNode.MIN_RADIUS_TO_DRAW_TEXT) {
      context.fillStyle = DisplayNode.TEXT_COLOR;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = DisplayNode.TEXT_FONT;
      context.fillText(
        this.value.toString(),
        this.x,
        this.y + DisplayNode.TEXT_Y_OFFSET,
      );
    }
  }
}
