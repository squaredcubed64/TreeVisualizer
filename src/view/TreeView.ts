import DisplayNode from "./DisplayNode";
import type DelayedFunction from "./DelayedFunction";
import type TreeShape from "../controller/TreeShape";
import assert from "../../Assert";
import type TreeController from "../controller/TreeController";

/**
 * Provides tree animation functionality, such as calculating where nodes should be, drawing nodes and arrows,
 * and handling asynchronous actions, as represented by functions in the functionQueue.
 */
export default abstract class TreeView {
  protected static ROOT_TARGET_X = 700;
  protected static readonly ROOT_TARGET_Y = 150;
  protected static readonly TARGET_X_GAP = 50;
  protected static readonly TARGET_Y_GAP = 75;
  private static readonly FILL_COLOR = "pink";
  private static readonly STROKE_COLOR = "red";
  private static readonly ARROW_HEAD_ANGLE = Math.PI / 6;
  private static readonly ARROW_HEAD_LENGTH = 10;
  private static readonly ARROW_LINE_WIDTH = 2;
  private static readonly DEFAULT_ANIMATION_SPEED_SETTING = 100;

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
      TreeView.FILL_COLOR,
      TreeView.STROKE_COLOR,
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
   * @param fromX x coordinate of the start of the arrow
   * @param fromY y coordinate of the start of the arrow
   * @param toX x coordinate of the end of the arrow
   * @param toY y coordinate of the end of the arrow
   * @param context The canvas context to draw on
   */
  private static drawArrow(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    context: CanvasRenderingContext2D,
  ): void {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    context.beginPath();
    context.lineWidth = TreeView.ARROW_LINE_WIDTH;
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
    TreeView.drawArrow(
      fromNode.x,
      fromNode.y,
      toNode.x - xOffsetFromCenter,
      toNode.y - yOffsetFromCenter,
      context,
    );
  }

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
        1.03 **
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
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Call ready functions in functionQueue
    while (
      this.functionQueue.length > 0 &&
      this.functionQueue[0].framesToWait <= 0
    ) {
      if (!this.functionAtFrontOfQueueWasCalled) {
        const { func, framesAfterCall, description, secondaryDescription } =
          this.functionQueue[0];
        func();
        this.description = description;
        this.secondaryDescription = secondaryDescription;

        // Keep function at front of queue for framesAfterCall frames, to give the animation time to complete and show the description
        if (framesAfterCall > 0) {
          this.functionAtFrontOfQueueWasCalled = true;
          this.functionQueue[0].framesToWait = framesAfterCall;
        } else {
          this.functionQueue.shift();
        }
      } else {
        this.functionAtFrontOfQueueWasCalled = false;
        this.functionQueue.shift();
      }
    }

    if (this.functionQueue.length > 0) {
      this.functionQueue[0].framesToWait -= this.animationSpeed;
    }

    // Draw arrows first
    this.shape.arrows.forEach((pair) => {
      TreeView.drawArrowFromNodeToNode(pair[0], pair[1], context);
    });

    // Draw nodes
    this.shape.inorderTraversal.forEach((node) => {
      node.drawAndUpdate(context, this.animationSpeed);
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

  /*
    if (distance < nodeRadius) {
      // Node was clicked
      const nodePopup = document.getElementById('nodePopup');
      assert(nodePopup !== null, "nodePopup not found");

      // Update the popup with the node's properties
      nodePopup.innerHTML = `
        <p>Property 1: ${node.properties.property1}</p>
        <p>Property 2: ${node.properties.property2}</p>
        <!-- Add more properties as needed -->
      `;

      // Make the popup visible
      nodePopup.style.display = 'block';
    }
  });
*/

  /**
   * Sets the tree's shape to the given shape, and sets the target positions of all nodes in the tree
   * @param newShape The shape the tree gradually changes to
   */
  protected animateShapeChange(newShape: TreeShape<DisplayNode>): void {
    this.shape = newShape;
    this.setTargetPositions();
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
