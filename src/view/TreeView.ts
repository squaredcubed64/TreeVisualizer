import DisplayNode from "./DisplayNode";
import type DelayedFunction from "./DelayedFunction";
import type TreeShape from "../controller/TreeShape";
import assert from "../../Assert";
import type TreeController from "../controller/TreeController";
import type TreeInsertionInformation from "../controller/operationInformation/TreeInsertionInformation";

/**
 * Provides tree animation functionality, such as calculating where nodes should be, drawing nodes and arrows,
 * and handling asynchronous actions, as represented by functions in the functionQueue.
 */
export default abstract class TreeView {
  public static readonly DURATION_MULTIPLIER = 0.6;
  protected static ROOT_TARGET_X = 700;
  protected static readonly ROOT_TARGET_Y = 150;
  protected static readonly TARGET_X_GAP = 50;
  protected static readonly TARGET_Y_GAP = 75;
  protected static readonly HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND = "orange";
  private static readonly NODE_FILL_COLOR = "pink";
  private static readonly NODE_OUTLINE_COLOR = "red";
  private static readonly ARROW_COLOR = "red";
  private static readonly ARROW_HEAD_ANGLE = Math.PI / 6;
  private static readonly ARROW_HEAD_LENGTH = 10;
  private static readonly ARROW_LINE_WIDTH = 2;
  private static readonly DEFAULT_ANIMATION_SPEED_SETTING = 100;
  private static readonly TIME_BETWEEN_RENDERS_MS = 1000 / 120;
  private static readonly TIME_AFTER_SET_ROOT_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly TIME_BEFORE_REPLACE_OR_SWAP_VALUES_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly TIME_AFTER_REPLACE_OR_SWAP_VALUES_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly TIME_AFTER_UNHIGHLIGHTING_CHANGED_NODES_MS =
    TreeView.DURATION_MULTIPLIER * 1000;

  private static readonly SET_ROOT_DESCRIPTION =
    "The tree is empty. Setting the root node.";

  private static readonly INSERT_NEW_NODE_DESCRIPTION = "Insert the new node.";

  public shape: TreeShape<DisplayNode> = {
    inorderTraversal: [],
    layers: [],
    arrows: new Set(),
  };

  public functionQueue: DelayedFunction[] = [];
  private functionAtFrontOfQueueWasCalled: boolean = false;
  private description: string = "";
  private secondaryDescription?: string = undefined;
  private currentAnimationId: number = -1;
  private animationSpeed: number = 1;
  private animationSpeedSetting: number =
    TreeView.DEFAULT_ANIMATION_SPEED_SETTING;

  private readonly controller: TreeController;
  private lastRenderTimeMs: number = performance.now();

  public constructor(controller: TreeController) {
    this.controller = controller;
  }

  /**
   * Note: The controller needs this to maintain its map from data nodes to display nodes
   * @returns A placeholder node that is used to represent a node that is being inserted
   */
  public static makePlaceholderNode(): DisplayNode {
    return new DisplayNode(
      NaN,
      NaN,
      TreeView.NODE_FILL_COLOR,
      TreeView.NODE_OUTLINE_COLOR,
      NaN,
    );
  }

  /**
   * Centers the tree the next time the tree's shape changes
   * @param canvasWidth The width of the id="canvas" element
   */
  public static centerTree(canvasWidth: number): void {
    TreeView.ROOT_TARGET_X = canvasWidth / 2;
  }

  public static getDisableableElements(): HTMLElement[] {
    const insertDiv = document.getElementById("insert");
    const deleteDiv = document.getElementById("delete");
    const findDiv = document.getElementById("find");
    const clearButton = document.getElementById("clearButton");
    const arrowButton = document.getElementById("arrowButton");
    assert(
      insertDiv !== null &&
        deleteDiv !== null &&
        findDiv !== null &&
        clearButton !== null &&
        arrowButton !== null,
      "insertDiv, deleteDiv, findDiv, clearButton, or arrowButton not found",
    );
    return [insertDiv, deleteDiv, findDiv, clearButton, arrowButton];
  }

  public static disableElements(elements: HTMLElement[]): void {
    elements.forEach((element) => {
      element.classList.add("disabled");
    });
  }

  public static enableElements(elements: HTMLElement[]): void {
    elements.forEach((element) => {
      element.classList.remove("disabled");
    });
  }

  /**
   * Draws an arrow from (fromX, fromY) to (toX, toY)
   */
  private static drawArrow(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    lineWidth: number,
    opacity: number,
    context: CanvasRenderingContext2D,
  ): void {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    context.beginPath();
    context.strokeStyle = TreeView.ARROW_COLOR;
    context.lineWidth = lineWidth;
    context.globalAlpha = opacity;
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);

    context.lineTo(
      toX -
        TreeView.ARROW_HEAD_LENGTH *
          Math.cos(angle - TreeView.ARROW_HEAD_ANGLE),
      toY -
        TreeView.ARROW_HEAD_LENGTH *
          Math.sin(angle - TreeView.ARROW_HEAD_ANGLE),
    );

    context.moveTo(toX, toY);
    context.lineTo(
      toX -
        TreeView.ARROW_HEAD_LENGTH *
          Math.cos(angle + TreeView.ARROW_HEAD_ANGLE),
      toY -
        TreeView.ARROW_HEAD_LENGTH *
          Math.sin(angle + TreeView.ARROW_HEAD_ANGLE),
    );
    context.stroke();
    context.globalAlpha = 1;
  }

  /**
   * Draws an arrow from fromNode to toNode
   * @param fromNode The node to draw the arrow from
   * @param toNode The node to draw the arrow to
   * @param context The canvas context to draw on
   */
  private static drawArrowFromNodeToNode(
    fromNode: DisplayNode,
    toNode: DisplayNode,
    context: CanvasRenderingContext2D,
  ): void {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dist = Math.hypot(dx, dy);
    const xOffsetFromCenter = (dx * toNode.currentRadius) / dist;
    const yOffsetFromCenter = (dy * toNode.currentRadius) / dist;
    const arrowVisibilityMultiplier =
      (fromNode.currentRadius * toNode.currentRadius) /
      DisplayNode.MAX_RADIUS ** 2;

    TreeView.drawArrow(
      fromNode.x,
      fromNode.y,
      toNode.x - xOffsetFromCenter,
      toNode.y - yOffsetFromCenter,
      TreeView.ARROW_LINE_WIDTH * arrowVisibilityMultiplier,
      arrowVisibilityMultiplier,
      context,
    );
  }

  public abstract insert(
    insertionInformation: TreeInsertionInformation<DisplayNode>,
  ): void;
  public abstract delete(deletionInformation: any): void;
  public abstract find(findInformation: any): void;

  /**
   * Sets the target positions of all nodes in the tree, based on the tree's shape
   */
  public setTargetPositions(): void {
    if (this.shape.inorderTraversal.length === 0) {
      return;
    }
    const nodeToTargetX = this.getTargetXs();
    const nodeToTargetY = this.getTargetYs();
    // Use of inorder traversal here is arbitrary
    for (const node of this.shape.inorderTraversal) {
      const targetX = nodeToTargetX.get(node);
      assert(targetX !== undefined, "TargetX is undefined");
      const targetY = nodeToTargetY.get(node);
      assert(targetY !== undefined, "TargetY is undefined");
      node.moveTo(targetX, targetY);
    }
  }

  /**
   * @param animationSpeedSetting The animation speed setting, from 0 to 199
   */
  public setAnimationSpeedSetting(animationSpeedSetting: number): void {
    this.animationSpeedSetting = animationSpeedSetting;
    if (animationSpeedSetting === 199) {
      this.animationSpeed = Infinity;
    } else {
      this.animationSpeed =
        1.02 **
        (animationSpeedSetting - TreeView.DEFAULT_ANIMATION_SPEED_SETTING);
    }
  }

  public getAnimationSpeedSetting(): number {
    return this.animationSpeedSetting;
  }

  public setArrows(arrows: Set<[DisplayNode, DisplayNode]>): void {
    this.shape.arrows = arrows;
  }

  /**
   * Calls functions in functionQueue if they are ready, draws the tree,
   * updates descriptions, disables buttons if an animation is happening, and requests another animation frame
   * @param canvas The canvas to draw on
   * @param context canvas's context
   */
  public animate(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
  ): void {
    const nowMs = performance.now();
    const deltaMs = nowMs - this.lastRenderTimeMs;

    if (deltaMs >= TreeView.TIME_BETWEEN_RENDERS_MS) {
      this.render(canvas, context);

      this.lastRenderTimeMs = nowMs;

      this.updateFunctionQueue(deltaMs * this.animationSpeed);

      this.shape.inorderTraversal.forEach((node) => {
        node.update(deltaMs, this.animationSpeed);
      });
    }

    this.currentAnimationId = requestAnimationFrame(() => {
      this.animate(canvas, context);
    });
  }

  public stopAnimation(): void {
    cancelAnimationFrame(this.currentAnimationId);
  }

  /**
   * Highlight the clicked node and display its properties in a popup
   * @param x The x coordinate of the click (relative to the canvas)
   * @param y The y coordinate of the click (relative to the canvas)
   */
  public handleHover(x: number, y: number): void {
    const hoveredNode = this.shape.inorderTraversal.find((node) => {
      return node.containsPoint(x, y);
    });

    const nodePopup = document.getElementById("nodePopup");
    assert(nodePopup !== null, "nodePopup not found");
    this.shape.inorderTraversal.forEach((node) => {
      node.unThickHighlight();
    });

    if (hoveredNode !== undefined) {
      hoveredNode.thickHighlightIndefinitely();
      const { height, balance, leftHeight, rightHeight } =
        this.controller.getPropertiesOfNode(hoveredNode);
      nodePopup.innerHTML =
        `Value: ${hoveredNode.value} <br>` +
        `Height: ${height} <br>` +
        `Balance factor: ${balance} <br>` +
        `Height of left subtree: ${leftHeight} <br>` +
        `Height of right subtree: ${rightHeight} <br>`;
    } else {
      nodePopup.innerHTML = "Hover over a node to see its properties.";
    }
  }

  /**
   * Sets the tree's shape to the given shape, and sets the target positions of all nodes in the tree
   * @param newShape The shape the tree gradually changes to
   */
  protected animateShapeChange(newShape: TreeShape<DisplayNode>): void {
    this.shape = newShape;
    this.setTargetPositions();
  }

  protected animateSettingRoot(
    shapeWithPlaceholder: TreeShape<DisplayNode>,
    placeholderNode: DisplayNode,
    value: number,
  ): void {
    placeholderNode.value = value;
    placeholderNode.x = TreeView.ROOT_TARGET_X;
    placeholderNode.y = TreeView.ROOT_TARGET_Y;
    this.functionQueue.push({
      timeToWaitMs: 0,
      func: () => {
        this.animateShapeChange(shapeWithPlaceholder);
      },
      timeAfterCallMs: TreeView.TIME_AFTER_SET_ROOT_MS,
      description: TreeView.SET_ROOT_DESCRIPTION,
    });
  }

  protected pushInsertionItself(
    valueToInsert: number,
    shapeAfterInsertion: TreeShape<DisplayNode>,
    node: DisplayNode,
    parent: DisplayNode,
    directionFromParentToNode: "left" | "right",
  ): void {
    this.functionQueue.push({
      func: () => {
        this.animateInsertionItself(
          valueToInsert,
          shapeAfterInsertion,
          node,
          parent,
          directionFromParentToNode,
        );
      },
      timeAfterCallMs: DisplayNode.MOVE_DURATION_MS,
      description: TreeView.INSERT_NEW_NODE_DESCRIPTION,
    });
  }

  protected pushDeletionItself(
    node: DisplayNode,
    shapeAfterDeletion: TreeShape<DisplayNode>,
    description: string,
  ): void {
    this.functionQueue.push({
      func: () => {
        node.startShrinkingIntoNothing();
      },
      timeAfterCallMs: DisplayNode.SHRINK_DURATION_MS,
      description,
    });

    this.functionQueue.push({
      func: () => {
        this.animateShapeChange(shapeAfterDeletion);
      },
      timeAfterCallMs: DisplayNode.MOVE_DURATION_MS,
      description,
    });
  }

  /**
   * Animates the insertion of the new node
   * @param valueToInsert The value to insert into the tree
   * @param shapeAfterInsertion The shape of the tree. It includes a placeholder node, which is the node that's being inserted
   * @param node The node that's being inserted
   * @param parent The parent of the node that's being inserted
   * @returns The animation's time taken and description
   */
  protected animateInsertionItself(
    valueToInsert: number,
    shapeAfterInsertion: TreeShape<DisplayNode>,
    node: DisplayNode,
    parent: DisplayNode,
    directionFromParentToNode: "left" | "right",
  ): void {
    node.value = valueToInsert;
    if (directionFromParentToNode === "left") {
      node.x = parent.x - TreeView.TARGET_X_GAP;
    } else {
      node.x = parent.x + TreeView.TARGET_X_GAP;
    }
    node.y = parent.y + TreeView.TARGET_Y_GAP;

    this.animateShapeChange(shapeAfterInsertion);
  }

  protected pushReplaceOrSwapValues(
    type: "replace" | "swap" | "none",
    fromNode: DisplayNode,
    toNode: DisplayNode,
    highlightColor: string,
    description: string,
    secondaryDescription?: string,
  ): void {
    this.functionQueue.push({
      func: () => {
        fromNode.highlight(highlightColor, Infinity);
        toNode.highlight(highlightColor, Infinity);
      },
      timeAfterCallMs: TreeView.TIME_BEFORE_REPLACE_OR_SWAP_VALUES_MS,
      description,
      secondaryDescription,
    });

    this.functionQueue.push({
      func: () => {
        if (type === "replace") {
          toNode.value = fromNode.value;
        } else if (type === "swap") {
          [toNode.value, fromNode.value] = [fromNode.value, toNode.value];
        }
      },
      timeAfterCallMs: TreeView.TIME_AFTER_REPLACE_OR_SWAP_VALUES_MS,
      description,
      secondaryDescription,
    });

    this.functionQueue.push({
      func: () => {
        fromNode.unhighlight();
        toNode.unhighlight();
      },
      timeAfterCallMs: TreeView.TIME_AFTER_UNHIGHLIGHTING_CHANGED_NODES_MS,
      description,
      secondaryDescription,
    });
  }

  protected pushPause(pauseTimeMs: number, description: string): void {
    this.functionQueue.push({
      func: () => {},
      timeAfterCallMs: pauseTimeMs,
      description,
    });
  }

  /**
   * Calls functions at the front of functionQueue if they are ready, or updates their time if they are not ready
   * @param deltaMs The number of milliseconds to adjust the functionQueue's time by
   */
  private updateFunctionQueue(deltaMs: number): void {
    for (const delayedFunction of this.functionQueue) {
      if (delayedFunction.timeToWaitMs === undefined) {
        delayedFunction.timeToWaitMs = 0;
      }
    }

    // Call ready functions in functionQueue
    while (this.functionQueue.length > 0) {
      assert(
        this.functionQueue[0].timeToWaitMs !== undefined,
        "timeToWaitMs is undefined",
      );
      if (this.functionQueue[0].timeToWaitMs > 0) {
        break;
      }

      if (this.functionAtFrontOfQueueWasCalled) {
        this.functionAtFrontOfQueueWasCalled = false;
        this.functionQueue.shift();
      } else {
        const { func, timeAfterCallMs } = this.functionQueue[0];
        func();

        // Keep function at front of queue for timeAfterCallMs, to give the animation time to complete and show the description
        this.functionAtFrontOfQueueWasCalled = true;
        this.functionQueue[0].timeToWaitMs = timeAfterCallMs;
      }
    }

    if (this.functionQueue.length > 0) {
      this.description = this.functionQueue[0].description;
      this.secondaryDescription = this.functionQueue[0].secondaryDescription;
    }

    if (this.functionQueue.length > 0) {
      assert(
        this.functionQueue[0].timeToWaitMs !== undefined,
        "timeToWaitMs is undefined",
      );
      this.functionQueue[0].timeToWaitMs -= deltaMs;
    }
  }

  private render(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
  ): void {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw arrows first
    this.shape.arrows.forEach((pair) => {
      TreeView.drawArrowFromNodeToNode(pair[0], pair[1], context);
    });

    // Draw nodes
    this.shape.inorderTraversal.forEach((node) => {
      node.draw(context);
    });

    // Update description
    const animationDescription = document.getElementById(
      "animationDescription",
    ) as HTMLParagraphElement;
    assert(animationDescription !== null, "animationDescription not found");
    animationDescription.textContent = this.description;

    // Update secondary description
    const secondaryAnimationDescription = document.getElementById(
      "secondaryAnimationDescription",
    ) as HTMLParagraphElement;
    assert(
      secondaryAnimationDescription !== null,
      "secondaryAnimationDescription not found",
    );
    if (this.secondaryDescription == null) {
      secondaryAnimationDescription.textContent = "";
    } else {
      secondaryAnimationDescription.textContent = this.secondaryDescription;
    }

    if (this.functionQueue.length === 0) {
      TreeView.enableElements(TreeView.getDisableableElements());
    } else {
      TreeView.disableElements(TreeView.getDisableableElements());
    }
  }

  /**
   * @returns The target x coordinates of all nodes in the tree.
   * The root node is centered horizontally, and nodes are evenly spaced horizontally in inorder traversal order.
   */
  private getTargetXs(): Map<DisplayNode, number> {
    const nodeToTargetX = new Map<DisplayNode, number>();
    const root = this.shape.layers[0][0];
    const rootIndex = this.shape.inorderTraversal.indexOf(root);
    for (let i = 0; i < this.shape.inorderTraversal.length; i++) {
      const node = this.shape.inorderTraversal[i];
      nodeToTargetX.set(
        node,
        TreeView.ROOT_TARGET_X + (i - rootIndex) * TreeView.TARGET_X_GAP,
      );
    }
    return nodeToTargetX;
  }

  /**
   * @returns The target y coordinates of all nodes in the tree. Layers are evenly spaced vertically.
   */
  private getTargetYs(): Map<DisplayNode, number> {
    const nodeToTargetY = new Map<DisplayNode, number>();
    for (let i = 0; i < this.shape.layers.length; i++) {
      const layer = this.shape.layers[i];
      const layerY = TreeView.ROOT_TARGET_Y + i * TreeView.TARGET_Y_GAP;
      for (const node of layer) {
        nodeToTargetY.set(node, layerY);
      }
    }
    return nodeToTargetY;
  }
}
