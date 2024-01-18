var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import DisplayNode from "./DisplayNode";
import TreeView from "./TreeView";
import assert from "../../Assert";
/**
 * Handles the animation of BST operations.
 */
var BSTView = /** @class */ (function (_super) {
    __extends(BSTView, _super);
    function BSTView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Highlights the path of insertion, grows the inserted node, then move nodes to new target positions.
     * @param insertionInformation The information the view needs to animate the insertion.
     */
    BSTView.prototype.insert = function (insertionInformation) {
        var _this = this;
        var shapeWithPlaceholder = insertionInformation.shape, pathFromRootToTarget = insertionInformation.pathFromRootToTarget, value = insertionInformation.value;
        var placeholderNode = shapeWithPlaceholder.inorderTraversal.find(function (node) {
            return isNaN(node.x);
        });
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
        this.pushNodeHighlightingOntoFunctionQueue(pathFromRootToTarget, BSTView.INSERTION_DESCRIPTIONS.FIND_WHERE_TO_INSERT);
        // Animate inserting
        this.functionQueue.push({
            timeToWaitMs: 0,
            func: function () {
                _this.setupInsertionAnimation(value, shapeWithPlaceholder, placeholderNode, pathFromRootToTarget[pathFromRootToTarget.length - 1].node);
            },
            timeAfterCallMs: DisplayNode.MOVE_DURATION_MS,
            description: BSTView.INSERTION_DESCRIPTIONS.INSERT_NEW_NODE,
        });
    };
    /**
     * Animates the deletion of a node, which always includes highlighting the path to the victim node.
     *
     * If the victim node is found, also shrinks the victim node and moves nodes to new target positions.
     *
     * If the victim node has two children, also highlights the path to the successor node and animates the deletion of the successor node.
     * @param viewDeletionInformation The information the view needs to animate the deletion.
     */
    BSTView.prototype.delete = function (viewDeletionInformation) {
        var _this = this;
        switch (viewDeletionInformation.type) {
            // Animation: highlight path to victim, shrink victim node, then move nodes to new target positions
            case "LEQ1Child": {
                var shape_1 = viewDeletionInformation.shape, pathFromRootToTarget = viewDeletionInformation.pathFromRootToTarget, victimNode_1 = viewDeletionInformation.victimNode;
                this.pushNodeHighlightingOntoFunctionQueue(pathFromRootToTarget, BSTView.DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE);
                this.functionQueue.push({
                    timeToWaitMs: 0,
                    func: function () {
                        victimNode_1.startShrinkingIntoNothing();
                    },
                    timeAfterCallMs: DisplayNode.SHRINK_DURATION_MS,
                    description: BSTView.DELETION_DESCRIPTIONS.DELETE_NODE,
                });
                this.functionQueue.push({
                    timeToWaitMs: 0,
                    func: function () {
                        _this.animateShapeChange(shape_1);
                    },
                    timeAfterCallMs: DisplayNode.SHRINK_DURATION_MS,
                    description: BSTView.DELETION_DESCRIPTIONS.DELETE_NODE,
                });
                break;
            }
            // Animation: highlight path to victim, keep victim highlighted, highlight path to successor, highlight successor, set the victim's value to the successor's value, unhighlight victim and successor, shrink successor, then move nodes to new target positions
            case "2Children": {
                var shape_2 = viewDeletionInformation.shape, pathFromRootToTarget = viewDeletionInformation.pathFromRootToTarget, victimNode_2 = viewDeletionInformation.victimNode, pathFromTargetsRightChildToSuccessor = viewDeletionInformation.pathFromTargetsRightChildToSuccessor, successorNode_1 = viewDeletionInformation.successorNode;
                this.pushNodeHighlightingOntoFunctionQueue(pathFromRootToTarget, BSTView.DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE);
                this.functionQueue.push({
                    timeToWaitMs: 0,
                    func: function () {
                        victimNode_2.highlight(BSTView.FIND_SUCCESSOR_HIGHLIGHT_COLOR, Infinity);
                    },
                    timeAfterCallMs: 0,
                    description: BSTView.DELETION_DESCRIPTIONS.FIND_SUCCESSOR,
                });
                this.pushNodeHighlightingOntoFunctionQueue(pathFromTargetsRightChildToSuccessor, BSTView.DELETION_DESCRIPTIONS.FIND_SUCCESSOR, BSTView.FIND_SUCCESSOR_HIGHLIGHT_COLOR);
                this.functionQueue.push({
                    timeToWaitMs: 0,
                    func: function () {
                        successorNode_1.highlight(BSTView.FIND_SUCCESSOR_HIGHLIGHT_COLOR, Infinity);
                    },
                    timeAfterCallMs: 0,
                    description: BSTView.DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR,
                });
                this.functionQueue.push({
                    timeToWaitMs: BSTView.TIME_BEFORE_REPLACE_WITH_SUCCESSOR_MS,
                    func: function () {
                        victimNode_2.value = successorNode_1.value;
                    },
                    timeAfterCallMs: 0,
                    description: BSTView.DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR,
                });
                this.functionQueue.push({
                    timeToWaitMs: BSTView.TIME_BEFORE_UNHIGHLIGHT_VICTIM_MS,
                    func: function () {
                        victimNode_2.unhighlight();
                        successorNode_1.unhighlight();
                    },
                    timeAfterCallMs: BSTView.TIME_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN_MS,
                    description: BSTView.DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR,
                });
                this.functionQueue.push({
                    timeToWaitMs: 0,
                    func: function () {
                        successorNode_1.startShrinkingIntoNothing();
                    },
                    timeAfterCallMs: DisplayNode.SHRINK_DURATION_MS,
                    description: BSTView.DELETION_DESCRIPTIONS.DELETE_SUCCESSOR,
                });
                this.functionQueue.push({
                    timeToWaitMs: 0,
                    func: function () {
                        _this.animateShapeChange(shape_2);
                    },
                    timeAfterCallMs: DisplayNode.MOVE_DURATION_MS,
                    description: BSTView.DELETION_DESCRIPTIONS.DELETE_SUCCESSOR,
                });
                break;
            }
            // Animation: highlight path, then do nothing
            case "VictimNotFound": {
                var pathFromRootToTarget = viewDeletionInformation.pathFromRootToTarget;
                if (pathFromRootToTarget.length !== 0) {
                    this.pushNodeHighlightingOntoFunctionQueue(pathFromRootToTarget, BSTView.DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE);
                }
                this.functionQueue.push({
                    timeToWaitMs: BSTView.TIME_AFTER_UNSUCCESSFUL_DELETE_MS,
                    func: function () { },
                    timeAfterCallMs: 0,
                    description: BSTView.DELETION_DESCRIPTIONS.DID_NOT_FIND_NODE,
                });
                break;
            }
        }
    };
    /**
     * Animates the finding of a node
     *
     * Highlights the path to the node, then highlights the node if it is found.
     * @param viewFindInformation The information the view needs to animate the find.
     */
    BSTView.prototype.find = function (viewFindInformation) {
        var pathFromRootToTarget = viewFindInformation.pathFromRootToTarget, nodeFound = viewFindInformation.nodeFound;
        if (pathFromRootToTarget.length !== 0) {
            this.pushNodeHighlightingOntoFunctionQueue(pathFromRootToTarget, BSTView.FIND_DESCRIPTIONS.FIND_NODE);
        }
        if (nodeFound != null) {
            this.functionQueue.push({
                timeToWaitMs: 0,
                func: function () {
                    nodeFound.highlight(BSTView.HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND, BSTView.HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_MS);
                },
                timeAfterCallMs: BSTView.HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_MS +
                    BSTView.TIME_AFTER_FIND_MS,
                description: BSTView.FIND_DESCRIPTIONS.FOUND_NODE,
            });
        }
        else {
            this.functionQueue.push({
                timeToWaitMs: 0,
                func: function () { },
                timeAfterCallMs: BSTView.TIME_AFTER_FIND_MS,
                description: BSTView.FIND_DESCRIPTIONS.DID_NOT_FIND_NODE,
            });
        }
    };
    BSTView.prototype.convertSecondaryDescriptionToString = function (secondaryDescription) {
        switch (secondaryDescription.type) {
            case "insert":
                switch (secondaryDescription.direction) {
                    case "left":
                        return "Go left because ".concat(secondaryDescription.targetValue, " < ").concat(secondaryDescription.nodeValue);
                    case "right":
                        return "Go right because ".concat(secondaryDescription.targetValue, " >= ").concat(secondaryDescription.nodeValue);
                }
                break;
            case "find":
                switch (secondaryDescription.direction) {
                    case "left":
                        return "Go left because ".concat(secondaryDescription.targetValue, " < ").concat(secondaryDescription.nodeValue);
                    case "right":
                        return "Go right because ".concat(secondaryDescription.targetValue, " > ").concat(secondaryDescription.nodeValue);
                    case "stop":
                        return "Stop because ".concat(secondaryDescription.targetValue, " = ").concat(secondaryDescription.nodeValue);
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
    };
    /**
     * Prepares the placeholder node and tells nodes to start moving to new target positions
     * @param valueToInsert The value to insert into the tree
     * @param shapeWithPlaceholder The shape of the tree with a placeholder node, which is the node that's being inserted
     * @param placeholderNode The node that's being inserted
     * @param parent The parent of the node that's being inserted
     * @returns The animation's time taken and description
     */
    BSTView.prototype.setupInsertionAnimation = function (valueToInsert, shapeWithPlaceholder, placeholderNode, parent) {
        placeholderNode.value = valueToInsert;
        if (placeholderNode.value < parent.value) {
            placeholderNode.x = parent.x - TreeView.TARGET_X_GAP;
        }
        else {
            placeholderNode.x = parent.x + TreeView.TARGET_X_GAP;
        }
        placeholderNode.y = parent.y + TreeView.TARGET_Y_GAP;
        this.animateShapeChange(shapeWithPlaceholder);
    };
    /**
     * Pushes methods onto functionQueue to highlight nodes along path
     * @param path The path to highlight nodes in
     * @param description The description to display when highlighting the nodes
     * @param highlightColor The color to highlight the nodes with
     */
    BSTView.prototype.pushNodeHighlightingOntoFunctionQueue = function (path, description, highlightColor) {
        var _loop_1 = function (node, secondaryDescription) {
            this_1.functionQueue.push({
                timeToWaitMs: BSTView.TIME_BETWEEN_HIGHLIGHTS_MS,
                func: function () {
                    node.highlight(highlightColor);
                },
                timeAfterCallMs: DisplayNode.DEFAULT_HIGHLIGHT_DURATION_MS,
                description: description,
                secondaryDescription: this_1.convertSecondaryDescriptionToString(secondaryDescription),
            });
        };
        var this_1 = this;
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var _a = path_1[_i], node = _a.node, secondaryDescription = _a.secondaryDescription;
            _loop_1(node, secondaryDescription);
        }
    };
    BSTView.TIME_BETWEEN_HIGHLIGHTS_MS = TreeView.DURATION_MULTIPLIER * 1000;
    BSTView.TIME_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN_MS = TreeView.DURATION_MULTIPLIER * 1000;
    BSTView.TIME_BEFORE_REPLACE_WITH_SUCCESSOR_MS = TreeView.DURATION_MULTIPLIER * 1000;
    BSTView.TIME_BEFORE_UNHIGHLIGHT_VICTIM_MS = TreeView.DURATION_MULTIPLIER * 1000;
    BSTView.TIME_AFTER_UNSUCCESSFUL_DELETE_MS = TreeView.DURATION_MULTIPLIER * 1000;
    BSTView.HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_MS = TreeView.DURATION_MULTIPLIER * 1000;
    BSTView.TIME_AFTER_FIND_MS = TreeView.DURATION_MULTIPLIER * 0;
    BSTView.FIND_SUCCESSOR_HIGHLIGHT_COLOR = "green";
    BSTView.HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND = "green";
    BSTView.INSERTION_DESCRIPTIONS = {
        FIND_WHERE_TO_INSERT: "Find where to insert the new node.",
        INSERT_NEW_NODE: "Insert the new node.",
    };
    BSTView.DELETION_DESCRIPTIONS = {
        FIND_NODE_TO_DELETE: "Find the node to delete.",
        DELETE_NODE: "Delete the node.",
        // These are for the case where the victim node has two children.
        FIND_SUCCESSOR: "Find the successor of the node to set the node's value to.",
        REPLACE_NODE_WITH_SUCCESSOR: "Replace the node's value with its successor.",
        DELETE_SUCCESSOR: "Delete the successor node.",
        DID_NOT_FIND_NODE: "Did not find the node.",
    };
    BSTView.FIND_DESCRIPTIONS = {
        FIND_NODE: "Find the node.",
        FOUND_NODE: "Found the node.",
        DID_NOT_FIND_NODE: "Did not find the node.",
    };
    return BSTView;
}(TreeView));
export default BSTView;
//# sourceMappingURL=BSTView.js.map