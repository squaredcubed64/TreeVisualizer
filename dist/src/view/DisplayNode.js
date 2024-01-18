import assert from "../../Assert";
import TreeView from "./TreeView";
/**
 * A node that is drawn on the canvas.
 */
var DisplayNode = /** @class */ (function () {
    function DisplayNode(x, y, fillColor, strokeColor, value) {
        this.currentRadius = 0;
        this.thickHighlightColor = null;
        this.timeSinceStartedMovingMs = 0;
        this.timeSinceStartedGrowingMs = 0;
        this.timeUntilShrunkMs = -1;
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
    DisplayNode.easeInOutCurve = function (x) {
        return x * x * (3 - 2 * x);
    };
    /**
     * Curve that starts at (0, 0) and ends at (1, 1), with movement being slow at the start and springy at the end.
     * @param x A number between 0 and 1
     * @returns The y value of the curve at x
     */
    DisplayNode.bounceCurve = function (x) {
        if (x < 0.6) {
            return DisplayNode.easeInOutCurve(x) / 0.648;
        }
        else {
            return 1 + Math.sin(7.5 * Math.PI * (x - 0.6)) / Math.exp(4 * x);
        }
    };
    /**
     * Returns a damping curve function based on the given parameters.
     * The damping curve oscillates indefinitely, but the oscillations' amplitude decreases exponentially.
     *
     * @param amplitude - The amplitude of the damping curve.
     * @param dampingFactor - The damping factor of the damping curve.
     * @param frequency - The frequency of the damping curve.
     * @param phase - The phase of the damping curve.
     * @returns A damping curve function.
     */
    DisplayNode.getDampingCurve = function (amplitude, dampingFactor, frequency, phase) {
        return function (x) {
            if (x === Infinity) {
                return 1;
            }
            return (1 -
                amplitude *
                    Math.exp(-dampingFactor * x) *
                    Math.cos(frequency * x + phase));
        };
    };
    /**
     * Curve that starts at ~(0, 0), hits ~(1, 1), and strongly oscillates around y = 1.
     * @param x A number greater than 0
     * @returns The y value of the curve at x
     */
    DisplayNode.strongDampingCurve = function (x) {
        return DisplayNode.getDampingCurve(1.04, 0.5, 1.9, -0.3)(x);
    };
    /**
     * Curve that starts at ~(0, 0), hits ~(1, 1), and weakly oscillates around y = 1.
     * @param x A number greater than 0
     * @returns The y value of the curve at x
     */
    DisplayNode.weakDampingCurve = function (x) {
        return DisplayNode.getDampingCurve(1.13, 1, 2.07, -0.5)(x);
    };
    /**
     * Curve that represents the motion of the node as it moves from its previous position to its target position.
     */
    DisplayNode.motionCurve = function (progress) {
        assert(progress >= 0, "progress must be nonnegative");
        return DisplayNode.strongDampingCurve(progress);
    };
    /**
     * Curve that represents the growth of the node's radius as it is inserted.
     */
    DisplayNode.radiusGrowthCurve = function (progress) {
        assert(progress >= 0, "progress must be nonnegative");
        return DisplayNode.weakDampingCurve(progress);
    };
    /**
     * Curve that represents the shrinking of the node's radius as it is deleted.
     *
     * It starts at (0, 1) and ends at (1, 0), with shrinking being slow at the start and end.
     * @param progress The proportion of the animation's time that has passed, between 0 and 1
     * @returns The proportion of the max radius that the radius should be, between 0 and 1
     */
    DisplayNode.radiusShrinkingCurve = function (progress) {
        assert(progress >= 0 && progress <= 1, "progress must be between 0 and 1");
        return 1 - DisplayNode.easeInOutCurve(progress);
    };
    /**
     * Move the node to the given coordinates over MOVE_DURATION_MS milliseconds.
     * @param targetX The x coordinate to move to
     * @param targetY The y coordinate to move to
     */
    DisplayNode.prototype.moveTo = function (targetX, targetY) {
        this.timeSinceStartedMovingMs = 0;
        this.previousX = this.x;
        this.previousY = this.y;
        this.targetX = targetX;
        this.targetY = targetY;
    };
    /**
     * Highlight the node with the given color for the given length of time.
     * @param color The color to highlight the node with.
     * @param durationMs The length of time to highlight the node for. Can be set to Infinity to keep the node highlighted.
     */
    DisplayNode.prototype.highlight = function (color, durationMs) {
        if (color === void 0) { color = DisplayNode.DEFAULT_HIGHLIGHT_COLOR; }
        if (durationMs === void 0) { durationMs = DisplayNode.DEFAULT_HIGHLIGHT_DURATION_MS; }
        this.highlightColor = color;
        this.timeUntilUnhighlightedMs = durationMs;
    };
    DisplayNode.prototype.thickHighlightIndefinitely = function (color) {
        if (color === void 0) { color = DisplayNode.DEFAULT_THICK_HIGHLIGHT_COLOR; }
        this.thickHighlightColor = color;
    };
    DisplayNode.prototype.unThickHighlight = function () {
        this.thickHighlightColor = null;
    };
    /**
     * Stop highlighting the node.
     */
    DisplayNode.prototype.unhighlight = function () {
        this.timeUntilUnhighlightedMs = 0;
    };
    /**
     * Start decreasing the node's radius. It should be deleted when the radius reaches 0.
     */
    DisplayNode.prototype.startShrinkingIntoNothing = function () {
        this.timeUntilShrunkMs = DisplayNode.SHRINK_DURATION_MS;
    };
    DisplayNode.prototype.containsPoint = function (x, y) {
        return Math.hypot(this.x - x, this.y - y) <= this.currentRadius;
    };
    /**
     * Update the node's position, radius, and time left highlighted based on the given animation speed.
     * @param deltaMs The length of time to advance by. Can be a fraction.
     */
    DisplayNode.prototype.update = function (deltaMs) {
        this.timeSinceStartedMovingMs += deltaMs;
        this.timeSinceStartedGrowingMs += deltaMs;
        this.timeUntilUnhighlightedMs = Math.max(this.timeUntilUnhighlightedMs - deltaMs, 0);
        if (this.timeUntilShrunkMs !== -1) {
            this.timeUntilShrunkMs = Math.max(this.timeUntilShrunkMs - deltaMs, 0);
        }
        // motionProgress > 0
        var motionProgress = this.timeSinceStartedMovingMs / DisplayNode.MOVE_DURATION_MS;
        this.x =
            this.previousX +
                (this.targetX - this.previousX) * DisplayNode.motionCurve(motionProgress);
        this.y =
            this.previousY +
                (this.targetY - this.previousY) * DisplayNode.motionCurve(motionProgress);
        // If it is being deleted
        if (this.timeUntilShrunkMs >= 0) {
            var shrinkingProgress = (DisplayNode.SHRINK_DURATION_MS - this.timeUntilShrunkMs) /
                DisplayNode.SHRINK_DURATION_MS;
            this.currentRadius =
                DisplayNode.MAX_RADIUS *
                    DisplayNode.radiusShrinkingCurve(shrinkingProgress);
        }
        else {
            var growthProgress = this.timeSinceStartedGrowingMs / DisplayNode.GROW_DURATION_MS;
            this.currentRadius =
                DisplayNode.MAX_RADIUS * DisplayNode.radiusGrowthCurve(growthProgress);
        }
    };
    /**
     * Draw the node on the canvas.
     * @param context The canvas context to draw on
     */
    DisplayNode.prototype.draw = function (context) {
        // Thick highlight
        if (this.thickHighlightColor !== null) {
            context.beginPath();
            context.arc(this.x, this.y, this.currentRadius + DisplayNode.HIGHLIGHT_WIDTH * 2, 0, Math.PI * 2);
            context.fillStyle = this.thickHighlightColor;
            context.fill();
        }
        // Highlight
        if (this.timeUntilUnhighlightedMs > 0) {
            context.beginPath();
            context.arc(this.x, this.y, this.currentRadius + DisplayNode.HIGHLIGHT_WIDTH, 0, Math.PI * 2);
            context.fillStyle = this.highlightColor;
            context.fill();
        }
        // Draw circle
        context.beginPath();
        context.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
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
            context.fillText(this.value.toString(), this.x, this.y + DisplayNode.TEXT_Y_OFFSET);
        }
    };
    DisplayNode.MOVE_DURATION_MS = 1000 * TreeView.DURATION_MULTIPLIER;
    DisplayNode.SHRINK_DURATION_MS = 1000 * TreeView.DURATION_MULTIPLIER;
    DisplayNode.DEFAULT_HIGHLIGHT_DURATION_MS = 1000 * TreeView.DURATION_MULTIPLIER;
    DisplayNode.GROW_DURATION_MS = 1000 * TreeView.DURATION_MULTIPLIER;
    DisplayNode.BORDER_WIDTH = 1;
    DisplayNode.HIGHLIGHT_WIDTH = 5;
    DisplayNode.TEXT_COLOR = "red";
    DisplayNode.TEXT_FONT = "16px Arial";
    DisplayNode.TEXT_Y_OFFSET = 2;
    DisplayNode.MIN_RADIUS_TO_DRAW_TEXT = 10;
    DisplayNode.DEFAULT_HIGHLIGHT_COLOR = "blue";
    DisplayNode.DEFAULT_THICK_HIGHLIGHT_COLOR = "gold";
    DisplayNode.MAX_RADIUS = 30;
    return DisplayNode;
}());
export default DisplayNode;
//# sourceMappingURL=DisplayNode.js.map