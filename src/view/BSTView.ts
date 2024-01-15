import DisplayNode from "./DisplayNode";
import TreeView from "./TreeView";
import type BSTInsertionInformation from "../controller/operationInformation/BSTInsertionInformation";
import { assert } from "../../Utils";
import type TreeShape from "../controller/TreeShape";
import type BSTFindInformation from "../controller/operationInformation/BSTFindInformation";
import type BSTDeletionInformation from "../controller/operationInformation/deletionInformation/BSTDeletionInformation";
import type BSTSecondaryDescription from "../controller/secondaryDescription/BSTSecondaryDescription";
import type BSTPathInstruction from "../controller/pathInstruction/BSTPathInstruction";
import { DURATION_MULTIPLIER } from "./Constants";

/**
 * Handles the animation of BST operations.
 */
export default class BSTView extends TreeView {
  protected static readonly FRAMES_BETWEEN_HIGHLIGHTS =
    DURATION_MULTIPLIER * 60;

  private static readonly FRAMES_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN =
    DURATION_MULTIPLIER * 60;

  private static readonly FRAMES_BEFORE_REPLACE_WITH_SUCCESSOR =
    DURATION_MULTIPLIER * 60;

  private static readonly FRAMES_BEFORE_UNHIGHLIGHT_VICTIM =
    DURATION_MULTIPLIER * 60;

  private static readonly FRAMES_AFTER_UNSUCCESSFUL_DELETE =
    DURATION_MULTIPLIER * 60;

  private static readonly HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES =
    DURATION_MULTIPLIER * 60;

  private static readonly FRAMES_AFTER_FIND = DURATION_MULTIPLIER * 0;
  private static readonly FIND_SUCCESSOR_HIGHLIGHT_COLOR = "green";
  private static readonly HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND = "green";
  private static readonly INSERTION_DESCRIPTIONS = {
    FIND_WHERE_TO_INSERT: "Find where to insert the new node.",
    INSERT_NEW_NODE: "Insert the new node.",
  };

  private static readonly DELETION_DESCRIPTIONS = {
    FIND_NODE_TO_DELETE: "Find the node to delete.",
    DELETE_NODE: "Delete the node.",
    // These are for the case where the victim node has two children.
    FIND_SUCCESSOR:
      "Find the successor of the node to set the node's value to.",
    REPLACE_NODE_WITH_SUCCESSOR: "Replace the node's value with its successor.",
    DELETE_SUCCESSOR: "Delete the successor node.",
    DID_NOT_FIND_NODE: "Did not find the node.",
  };

  private static readonly FIND_DESCRIPTIONS = {
    FIND_NODE: "Find the node.",
    FOUND_NODE: "Found the node.",
    DID_NOT_FIND_NODE: "Did not find the node.",
  };

  /**
   * Highlights the path of insertion, grows the inserted node, then move nodes to new target positions.
   * @param insertionInformation The information the view needs to animate the insertion.
   */
  public insert(
    insertionInformation: BSTInsertionInformation<DisplayNode>,
  ): void {
    const {
      shape: shapeWithPlaceholder,
      pathFromRootToTarget: path,
      value,
    } = insertionInformation;
    const placeholderNode = shapeWithPlaceholder.inorderTraversal.find((node) =>
      isNaN(node.x),
    );
    assert(placeholderNode != null, "Placeholder node not found");

    // If the tree is empty, set the root without animating
    if (this.shape.inorderTraversal.length === 0) {
      placeholderNode.value = value;
      placeholderNode.x = TreeView.ROOT_TARGET_X;
      placeholderNode.y = TreeView.ROOT_TARGET_Y;
      this.animateShapeChange(shapeWithPlaceholder);
      return;
    }

    // Animate finding where to insert
    this.pushNodeHighlightingOntoFunctionQueue(
      path,
      BSTView.INSERTION_DESCRIPTIONS.FIND_WHERE_TO_INSERT,
    );

    // Animate inserting
    this.functionQueue.push({
      framesToWait: 0,
      func: () => {
        this.setupInsertionAnimation(
          value,
          shapeWithPlaceholder,
          placeholderNode,
          path[path.length - 1].node,
        );
      },
      framesAfterCall: DisplayNode.MOVE_DURATION_FRAMES,
      description: BSTView.INSERTION_DESCRIPTIONS.INSERT_NEW_NODE,
    });
  }

  /**
   * Animates the deletion of a node, which always includes highlighting the path to the victim node.
   *
   * If the victim node is found, also shrinks the victim node and moves nodes to new target positions.
   *
   * If the victim node has two children, also highlights the path to the successor node and animates the deletion of the successor node.
   * @param viewDeletionInformation The information the view needs to animate the deletion.
   */
  public delete(
    viewDeletionInformation: BSTDeletionInformation<DisplayNode>,
  ): void {
    switch (viewDeletionInformation.type) {
      // Animation: highlight path to victim, shrink victim node, then move nodes to new target positions
      case "LEQ1Child": {
        const {
          shape,
          pathFromRootToTarget: path,
          victimNode,
        } = viewDeletionInformation;
        this.pushNodeHighlightingOntoFunctionQueue(
          path,
          BSTView.DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE,
        );
        this.functionQueue.push({
          framesToWait: 0,
          func: () => {
            victimNode.startShrinkingIntoNothing();
          },
          framesAfterCall: DisplayNode.SHRINK_DURATION_FRAMES,
          description: BSTView.DELETION_DESCRIPTIONS.DELETE_NODE,
        });
        this.functionQueue.push({
          framesToWait: 0,
          func: () => {
            this.animateShapeChange(shape);
          },
          framesAfterCall: DisplayNode.SHRINK_DURATION_FRAMES,
          description: BSTView.DELETION_DESCRIPTIONS.DELETE_NODE,
        });
        break;
      }
      // Animation: highlight path to victim, keep victim highlighted, highlight path to successor, highlight successor, set the victim's value to the successor's value, unhighlight victim and successor, shrink successor, then move nodes to new target positions
      case "2Children": {
        const {
          shape,
          pathFromRootToTarget: path,
          victimNode,
          pathToSuccessor,
          successorNode,
        } = viewDeletionInformation;
        this.pushNodeHighlightingOntoFunctionQueue(
          path,
          BSTView.DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE,
        );
        this.functionQueue.push({
          framesToWait: 0,
          func: () => {
            victimNode.highlight(
              BSTView.FIND_SUCCESSOR_HIGHLIGHT_COLOR,
              Infinity,
            );
          },
          framesAfterCall: 0,
          description: BSTView.DELETION_DESCRIPTIONS.FIND_SUCCESSOR,
        });
        this.pushNodeHighlightingOntoFunctionQueue(
          pathToSuccessor,
          BSTView.FIND_SUCCESSOR_HIGHLIGHT_COLOR,
          BSTView.DELETION_DESCRIPTIONS.FIND_SUCCESSOR,
        );
        this.functionQueue.push({
          framesToWait: 0,
          func: () => {
            successorNode.highlight(
              BSTView.FIND_SUCCESSOR_HIGHLIGHT_COLOR,
              Infinity,
            );
          },
          framesAfterCall: 0,
          description:
            BSTView.DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR,
        });
        this.functionQueue.push({
          framesToWait: BSTView.FRAMES_BEFORE_REPLACE_WITH_SUCCESSOR,
          func: () => {
            victimNode.value = successorNode.value;
          },
          framesAfterCall: 0,
          description:
            BSTView.DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR,
        });
        this.functionQueue.push({
          framesToWait: BSTView.FRAMES_BEFORE_UNHIGHLIGHT_VICTIM,
          func: () => {
            victimNode.unhighlight();
            successorNode.unhighlight();
          },
          framesAfterCall: 0,
          description:
            BSTView.DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR,
        });
        this.functionQueue.push({
          framesToWait:
            BSTView.FRAMES_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN,
          func: () => {
            successorNode.startShrinkingIntoNothing();
          },
          framesAfterCall: DisplayNode.SHRINK_DURATION_FRAMES,
          description: BSTView.DELETION_DESCRIPTIONS.DELETE_SUCCESSOR,
        });
        this.functionQueue.push({
          framesToWait: 0,
          func: () => {
            this.animateShapeChange(shape);
          },
          framesAfterCall: DisplayNode.MOVE_DURATION_FRAMES,
          description: BSTView.DELETION_DESCRIPTIONS.DELETE_SUCCESSOR,
        });
        break;
      }
      // Animation: highlight path, then do nothing
      case "VictimNotFound": {
        const { pathFromRootToTarget: path } = viewDeletionInformation;
        if (path.length !== 0) {
          this.pushNodeHighlightingOntoFunctionQueue(
            path,
            BSTView.DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE,
          );
        }
        this.functionQueue.push({
          framesToWait: BSTView.FRAMES_AFTER_UNSUCCESSFUL_DELETE,
          func: () => {},
          framesAfterCall: 0,
          description: BSTView.DELETION_DESCRIPTIONS.DID_NOT_FIND_NODE,
        });
        break;
      }
    }
  }

  /**
   * Animates the finding of a node
   *
   * Highlights the path to the node, then highlights the node if it is found.
   * @param viewFindInformation The information the view needs to animate the find.
   */
  public find(viewFindInformation: BSTFindInformation<DisplayNode>): void {
    const { pathFromRootToTarget: path, nodeFound } = viewFindInformation;
    if (path.length !== 0) {
      this.pushNodeHighlightingOntoFunctionQueue(
        path,
        BSTView.FIND_DESCRIPTIONS.FIND_NODE,
      );
    }
    if (nodeFound != null) {
      this.functionQueue.push({
        framesToWait: 0,
        func: () => {
          nodeFound.highlight(
            BSTView.HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND,
            BSTView.HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES,
          );
        },
        framesAfterCall:
          BSTView.HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES +
          BSTView.FRAMES_AFTER_FIND,
        description: BSTView.FIND_DESCRIPTIONS.FOUND_NODE,
      });
    } else {
      this.functionQueue.push({
        framesToWait: 0,
        func: () => {},
        framesAfterCall: BSTView.FRAMES_AFTER_FIND,
        description: BSTView.FIND_DESCRIPTIONS.DID_NOT_FIND_NODE,
      });
    }
  }

  protected convertSecondaryDescriptionToString(
    secondaryDescription: BSTSecondaryDescription,
  ): string {
    switch (secondaryDescription.type) {
      case "insert":
        switch (secondaryDescription.direction) {
          case "left":
            return `Go left because ${secondaryDescription.targetValue} < ${secondaryDescription.nodeValue}`;
          case "right":
            return `Go right because ${secondaryDescription.targetValue} >= ${secondaryDescription.nodeValue}`;
        }
        break;
      case "find":
        switch (secondaryDescription.direction) {
          case "left":
            return `Go left because ${secondaryDescription.targetValue} < ${secondaryDescription.nodeValue}`;
          case "right":
            return `Go right because ${secondaryDescription.targetValue} > ${secondaryDescription.nodeValue}`;
          case "stop":
            return `Stop because ${secondaryDescription.targetValue} = ${secondaryDescription.nodeValue}`;
        }
        break;
      case "successor":
        switch (secondaryDescription.direction) {
          case "left":
            return "Go left because there is a left child";
          case "stop":
            return "Stop because there is no left child";
        }
    }
  }

  /**
   * Prepares the placeholder node and tells nodes to start moving to new target positions
   * @param valueToInsert The value to insert into the tree
   * @param shapeWithPlaceholder The shape of the tree with a placeholder node, which is the node that's being inserted
   * @param placeholderNode The node that's being inserted
   * @param parent The parent of the node that's being inserted
   * @returns The animation's time taken and description
   */
  private setupInsertionAnimation(
    valueToInsert: number,
    shapeWithPlaceholder: TreeShape<DisplayNode>,
    placeholderNode: DisplayNode,
    parent: DisplayNode,
  ): void {
    placeholderNode.value = valueToInsert;
    if (placeholderNode.value < parent.value) {
      placeholderNode.x = parent.x - TreeView.TARGET_X_GAP;
    } else {
      placeholderNode.x = parent.x + TreeView.TARGET_X_GAP;
    }
    placeholderNode.y = parent.y + TreeView.TARGET_Y_GAP;

    this.animateShapeChange(shapeWithPlaceholder);
  }

  /**
   * Pushes methods onto functionQueue to highlight nodes along path
   * @param path The path to highlight nodes in
   * @param description The description to display when highlighting the nodes
   * @param highlightColor The color to highlight the nodes with
   */
  private pushNodeHighlightingOntoFunctionQueue<
    S extends BSTSecondaryDescription,
  >(
    path: Array<BSTPathInstruction<DisplayNode, S>>,
    description: string,
    highlightColor?: string,
  ): void {
    for (const { node, secondaryDescription } of path) {
      this.functionQueue.push({
        framesToWait: BSTView.FRAMES_BETWEEN_HIGHLIGHTS,
        func: () => {
          node.highlight(highlightColor);
        },
        framesAfterCall: DisplayNode.DEFAULT_HIGHLIGHT_DURATION_FRAMES,
        description,
        secondaryDescription:
          this.convertSecondaryDescriptionToString(secondaryDescription),
      });
    }
  }
}
