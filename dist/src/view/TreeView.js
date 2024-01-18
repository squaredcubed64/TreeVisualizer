import DisplayNode from "./DisplayNode";
import assert from "../../Assert";
/**
 * Provides tree animation functionality, such as calculating where nodes should be, drawing nodes and arrows,
 * and handling asynchronous actions, as represented by functions in the functionQueue.
 */
var TreeView = /** @class */ (function () {
    function TreeView(controller) {
        this.shape = {
            inorderTraversal: [],
            layers: [],
            arrows: new Set(),
        };
        this.functionQueue = [];
        this.functionAtFrontOfQueueWasCalled = false;
        this.description = "";
        this.secondaryDescription = undefined;
        this.currentAnimationId = -1;
        this.animationSpeed = 1;
        this.animationSpeedSetting = TreeView.DEFAULT_ANIMATION_SPEED_SETTING;
        this.lastRenderTimeMs = performance.now();
        this.controller = controller;
    }
    /**
     * Note: The controller needs this to maintain its map from data nodes to display nodes
     * @returns A placeholder node that is used to represent a node that is being inserted
     */
    TreeView.makePlaceholderNode = function () {
        return new DisplayNode(NaN, NaN, TreeView.FILL_COLOR, TreeView.STROKE_COLOR, NaN);
    };
    /**
     * Centers the tree the next time the tree's shape changes
     * @param canvasWidth The width of the id="canvas" element
     */
    TreeView.centerTree = function (canvasWidth) {
        TreeView.ROOT_TARGET_X = canvasWidth / 2;
    };
    TreeView.getDisableableElements = function () {
        var insertDiv = document.getElementById("insert");
        var deleteDiv = document.getElementById("delete");
        var findDiv = document.getElementById("find");
        var clearButton = document.getElementById("clearButton");
        var arrowButton = document.getElementById("arrowButton");
        assert(insertDiv !== null &&
            deleteDiv !== null &&
            findDiv !== null &&
            clearButton !== null &&
            arrowButton !== null, "insertDiv, deleteDiv, findDiv, clearButton, or arrowButton not found");
        return [insertDiv, deleteDiv, findDiv, clearButton, arrowButton];
    };
    TreeView.disableElements = function (elements) {
        elements.forEach(function (element) {
            element.classList.add("disabled");
        });
    };
    TreeView.enableElements = function (elements) {
        elements.forEach(function (element) {
            element.classList.remove("disabled");
        });
    };
    /**
     * Draws an arrow from (fromX, fromY) to (toX, toY)
     * @param fromX x coordinate of the start of the arrow
     * @param fromY y coordinate of the start of the arrow
     * @param toX x coordinate of the end of the arrow
     * @param toY y coordinate of the end of the arrow
     * @param context The canvas context to draw on
     */
    TreeView.drawArrow = function (fromX, fromY, toX, toY, context) {
        var dx = toX - fromX;
        var dy = toY - fromY;
        var angle = Math.atan2(dy, dx);
        context.beginPath();
        context.lineWidth = TreeView.ARROW_LINE_WIDTH;
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.lineTo(toX -
            TreeView.ARROW_HEAD_LENGTH *
                Math.cos(angle - TreeView.ARROW_HEAD_ANGLE), toY -
            TreeView.ARROW_HEAD_LENGTH *
                Math.sin(angle - TreeView.ARROW_HEAD_ANGLE));
        context.moveTo(toX, toY);
        context.lineTo(toX -
            TreeView.ARROW_HEAD_LENGTH *
                Math.cos(angle + TreeView.ARROW_HEAD_ANGLE), toY -
            TreeView.ARROW_HEAD_LENGTH *
                Math.sin(angle + TreeView.ARROW_HEAD_ANGLE));
        context.stroke();
    };
    /**
     * Draws an arrow from fromNode to toNode
     * @param fromNode The node to draw the arrow from
     * @param toNode The node to draw the arrow to
     * @param context The canvas context to draw on
     */
    TreeView.drawArrowFromNodeToNode = function (fromNode, toNode, context) {
        var dx = toNode.x - fromNode.x;
        var dy = toNode.y - fromNode.y;
        var dist = Math.hypot(dx, dy);
        var xOffsetFromCenter = (dx * toNode.currentRadius) / dist;
        var yOffsetFromCenter = (dy * toNode.currentRadius) / dist;
        TreeView.drawArrow(fromNode.x, fromNode.y, toNode.x - xOffsetFromCenter, toNode.y - yOffsetFromCenter, context);
    };
    /**
     * Sets the target positions of all nodes in the tree, based on the tree's shape
     */
    TreeView.prototype.setTargetPositions = function () {
        if (this.shape.inorderTraversal.length === 0) {
            return;
        }
        var nodeToTargetX = this.getTargetXs();
        var nodeToTargetY = this.getTargetYs();
        // Use of inorder traversal here is arbitrary
        for (var _i = 0, _a = this.shape.inorderTraversal; _i < _a.length; _i++) {
            var node = _a[_i];
            var targetX = nodeToTargetX.get(node);
            assert(targetX !== undefined, "TargetX is undefined");
            var targetY = nodeToTargetY.get(node);
            assert(targetY !== undefined, "TargetY is undefined");
            node.moveTo(targetX, targetY);
        }
    };
    /**
     * @param animationSpeedSetting The animation speed setting, from 0 to 199
     */
    TreeView.prototype.setAnimationSpeedSetting = function (animationSpeedSetting) {
        this.animationSpeedSetting = animationSpeedSetting;
        if (animationSpeedSetting === 199) {
            this.animationSpeed = Infinity;
        }
        else {
            this.animationSpeed =
                Math.pow(1.03, (animationSpeedSetting - TreeView.DEFAULT_ANIMATION_SPEED_SETTING));
        }
    };
    TreeView.prototype.getAnimationSpeedSetting = function () {
        return this.animationSpeedSetting;
    };
    TreeView.prototype.setArrows = function (arrows) {
        this.shape.arrows = arrows;
    };
    /**
     * Calls functions in functionQueue if they are ready, draws the tree,
     * updates descriptions, disables buttons if an animation is happening, and requests another animation frame
     * @param canvas The canvas to draw on
     * @param context canvas's context
     */
    TreeView.prototype.animate = function (canvas, context) {
        var _this = this;
        var nowMs = performance.now();
        var deltaMs = nowMs - this.lastRenderTimeMs;
        if (deltaMs >= TreeView.TIME_BETWEEN_RENDERS_MS) {
            this.render(canvas, context);
            this.lastRenderTimeMs = nowMs;
            var deltaAdjustedForAnimationSpeedMs_1 = deltaMs * this.animationSpeed;
            this.updateFunctionQueue(deltaAdjustedForAnimationSpeedMs_1);
            this.shape.inorderTraversal.forEach(function (node) {
                node.update(deltaAdjustedForAnimationSpeedMs_1);
            });
        }
        this.currentAnimationId = requestAnimationFrame(function () {
            _this.animate(canvas, context);
        });
    };
    TreeView.prototype.stopAnimation = function () {
        cancelAnimationFrame(this.currentAnimationId);
    };
    /**
     * Highlight the clicked node and display its properties in a popup
     * @param x The x coordinate of the click (relative to the canvas)
     * @param y The y coordinate of the click (relative to the canvas)
     */
    TreeView.prototype.handleHover = function (x, y) {
        var hoveredNode = this.shape.inorderTraversal.find(function (node) {
            return node.containsPoint(x, y);
        });
        var nodePopup = document.getElementById("nodePopup");
        assert(nodePopup !== null, "nodePopup not found");
        this.shape.inorderTraversal.forEach(function (node) {
            node.unThickHighlight();
        });
        if (hoveredNode !== undefined) {
            hoveredNode.thickHighlightIndefinitely();
            var _a = this.controller.getPropertiesOfNode(hoveredNode), height = _a.height, balance = _a.balance, leftHeight = _a.leftHeight, rightHeight = _a.rightHeight;
            nodePopup.innerHTML =
                "Value: ".concat(hoveredNode.value, " <br>") +
                    "Height: ".concat(height, " <br>") +
                    "Balance factor: ".concat(balance, " <br>") +
                    "Height of left subtree: ".concat(leftHeight, " <br>") +
                    "Height of right subtree: ".concat(rightHeight, " <br>");
        }
        else {
            nodePopup.innerHTML = "Hover over a node to see its properties.";
        }
    };
    /**
     * Sets the tree's shape to the given shape, and sets the target positions of all nodes in the tree
     * @param newShape The shape the tree gradually changes to
     */
    TreeView.prototype.animateShapeChange = function (newShape) {
        this.shape = newShape;
        this.setTargetPositions();
    };
    /**
     * Calls functions at the front of functionQueue if they are ready, or updates their time if they are not ready
     * @param deltaMs The number of milliseconds to adjust the functionQueue's time by
     */
    TreeView.prototype.updateFunctionQueue = function (deltaMs) {
        // Call ready functions in functionQueue
        while (this.functionQueue.length > 0 &&
            this.functionQueue[0].timeToWaitMs <= 0) {
            if (!this.functionAtFrontOfQueueWasCalled) {
                var _a = this.functionQueue[0], func = _a.func, timeAfterCallMs = _a.timeAfterCallMs, description = _a.description, secondaryDescription = _a.secondaryDescription;
                func();
                this.description = description;
                this.secondaryDescription = secondaryDescription;
                // Keep function at front of queue for timeAfterCallMs, to give the animation time to complete and show the description
                if (timeAfterCallMs > 0) {
                    this.functionAtFrontOfQueueWasCalled = true;
                    this.functionQueue[0].timeToWaitMs = timeAfterCallMs;
                }
                else {
                    this.functionQueue.shift();
                }
            }
            else {
                this.functionAtFrontOfQueueWasCalled = false;
                this.functionQueue.shift();
            }
        }
        if (this.functionQueue.length > 0) {
            this.functionQueue[0].timeToWaitMs -= deltaMs;
        }
    };
    TreeView.prototype.render = function (canvas, context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Draw arrows first
        this.shape.arrows.forEach(function (pair) {
            TreeView.drawArrowFromNodeToNode(pair[0], pair[1], context);
        });
        // Draw nodes
        this.shape.inorderTraversal.forEach(function (node) {
            node.draw(context);
        });
        // Update description
        var animationDescription = document.getElementById("animationDescription");
        assert(animationDescription !== null, "animationDescription not found");
        animationDescription.textContent = this.description;
        // Update secondary description
        var secondaryAnimationDescription = document.getElementById("secondaryAnimationDescription");
        assert(secondaryAnimationDescription !== null, "secondaryAnimationDescription not found");
        if (this.secondaryDescription == null) {
            secondaryAnimationDescription.textContent = "";
        }
        else {
            secondaryAnimationDescription.textContent = this.secondaryDescription;
        }
        if (this.functionQueue.length === 0) {
            TreeView.enableElements(TreeView.getDisableableElements());
        }
        else {
            TreeView.disableElements(TreeView.getDisableableElements());
        }
    };
    /**
     * @returns The target x coordinates of all nodes in the tree.
     * The root node is centered horizontally, and nodes are evenly spaced horizontally in inorder traversal order.
     */
    TreeView.prototype.getTargetXs = function () {
        var nodeToTargetX = new Map();
        var root = this.shape.layers[0][0];
        var rootIndex = this.shape.inorderTraversal.indexOf(root);
        for (var i = 0; i < this.shape.inorderTraversal.length; i++) {
            var node = this.shape.inorderTraversal[i];
            nodeToTargetX.set(node, TreeView.ROOT_TARGET_X + (i - rootIndex) * TreeView.TARGET_X_GAP);
        }
        return nodeToTargetX;
    };
    /**
     * @returns The target y coordinates of all nodes in the tree. Layers are evenly spaced vertically.
     */
    TreeView.prototype.getTargetYs = function () {
        var nodeToTargetY = new Map();
        for (var i = 0; i < this.shape.layers.length; i++) {
            var layer = this.shape.layers[i];
            var layerY = TreeView.ROOT_TARGET_Y + i * TreeView.TARGET_Y_GAP;
            for (var _i = 0, layer_1 = layer; _i < layer_1.length; _i++) {
                var node = layer_1[_i];
                nodeToTargetY.set(node, layerY);
            }
        }
        return nodeToTargetY;
    };
    TreeView.DURATION_MULTIPLIER = 0.6;
    TreeView.ROOT_TARGET_X = 700;
    TreeView.ROOT_TARGET_Y = 150;
    TreeView.TARGET_X_GAP = 50;
    TreeView.TARGET_Y_GAP = 75;
    TreeView.FILL_COLOR = "pink";
    TreeView.STROKE_COLOR = "red";
    TreeView.ARROW_HEAD_ANGLE = Math.PI / 6;
    TreeView.ARROW_HEAD_LENGTH = 10;
    TreeView.ARROW_LINE_WIDTH = 2;
    TreeView.DEFAULT_ANIMATION_SPEED_SETTING = 100;
    TreeView.TIME_BETWEEN_RENDERS_MS = 1000 / 120;
    return TreeView;
}());
export default TreeView;
//# sourceMappingURL=TreeView.js.map