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
import BSTView from "./BSTView";
import DisplayNode from "./DisplayNode";
import TreeView from "./TreeView";
/**
 * Handles the animation of AVL operations.
 */
var AVLView = /** @class */ (function (_super) {
    __extends(AVLView, _super);
    function AVLView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param secondaryDescription Additional information about the rotation.
     * @returns A string describing why the rotation is or is not performed.
     */
    AVLView.convertRotationSecondaryDescriptionToString = function (secondaryDescription) {
        var leftHeight = secondaryDescription.leftHeight, rightHeight = secondaryDescription.rightHeight, newHeight = secondaryDescription.newHeight, newBalanceFactor = secondaryDescription.newBalanceFactor;
        var out = "";
        out += "The node's height is Max(".concat(leftHeight, ", ").concat(rightHeight, ") + 1 = ").concat(newHeight, ". The node's balance factor is ").concat(leftHeight, " - ").concat(rightHeight, " = ").concat(newBalanceFactor, ". ");
        if (newBalanceFactor < -1) {
            out += "Rotate because balance factor < -1.";
        }
        else if (newBalanceFactor > 1) {
            out += "Rotate because balance factor > 1.";
        }
        else {
            out += "Do not rotate because balance factor is between -1 and 1.";
        }
        return out;
    };
    /**
     * Animates the BST insertion, then animates checking the AVL property and rotating if necessary.
     * @param viewInsertionInformation The information the view needs to insert a node.
     */
    AVLView.prototype.insert = function (viewInsertionInformation) {
        _super.prototype.insert.call(this, viewInsertionInformation);
        this.pushRotationPathOntoFunctionQueue(viewInsertionInformation.rotationPath);
    };
    /**
     * Animates the BST deletion, then animates checking the AVL property and rotating if necessary.
     * @param viewDeletionInformation The information the view needs to delete a node.
     */
    AVLView.prototype.delete = function (viewDeletionInformation) {
        _super.prototype.delete.call(this, viewDeletionInformation);
        this.pushRotationPathOntoFunctionQueue(viewDeletionInformation.rotationPath);
    };
    /**
     * Pushes methods onto functionQueue to highlight nodes along rotationPath and explain why rotations are or aren't performed.
     * @param rotationPath The path along which the AVL tree updates heights and rotates. It starts at the inserted node's parent and ends at the root.
     */
    AVLView.prototype.pushRotationPathOntoFunctionQueue = function (rotationPath) {
        var _this = this;
        // Helper
        var pushRotationOntoFunctionQueue = function (shapeAfterRotation, secondaryDescription) {
            _this.functionQueue.push({
                timeToWaitMs: 0,
                func: function () {
                    _this.animateShapeChange(shapeAfterRotation);
                },
                timeAfterCallMs: DisplayNode.MOVE_DURATION_MS + AVLView.TIME_AFTER_ROTATION_MS,
                description: AVLView.ROTATION_PATH_DESCRIPTION,
                secondaryDescription: secondaryDescription,
            });
        };
        var _loop_1 = function (rotationPathInstruction) {
            var node = rotationPathInstruction.node, shapesAfterRotation = rotationPathInstruction.shapesAfterRotation, secondaryDescription = rotationPathInstruction.secondaryDescription;
            // Highlight the node and explain if a rotation must be performed and why
            this_1.functionQueue.push({
                timeToWaitMs: BSTView.TIME_BETWEEN_HIGHLIGHTS_MS,
                func: function () {
                    node.highlight(AVLView.ROTATION_PATH_HIGHLIGHT_COLOR, AVLView.ROTATION_PATH_HIGHLIGHT_DURATION_MS);
                },
                timeAfterCallMs: AVLView.ROTATION_PATH_HIGHLIGHT_DURATION_MS,
                description: AVLView.ROTATION_PATH_DESCRIPTION,
                secondaryDescription: AVLView.convertRotationSecondaryDescriptionToString(secondaryDescription),
            });
            // Animate the rotation(s)
            if (shapesAfterRotation.length === 1) {
                pushRotationOntoFunctionQueue(shapesAfterRotation[0], "Rotation");
            }
            else if (shapesAfterRotation.length === 2) {
                pushRotationOntoFunctionQueue(shapesAfterRotation[0], "First rotation");
                pushRotationOntoFunctionQueue(shapesAfterRotation[1], "Second rotation");
            }
        };
        var this_1 = this;
        for (var _i = 0, rotationPath_1 = rotationPath; _i < rotationPath_1.length; _i++) {
            var rotationPathInstruction = rotationPath_1[_i];
            _loop_1(rotationPathInstruction);
        }
    };
    AVLView.TIME_AFTER_ROTATION_MS = TreeView.DURATION_MULTIPLIER * 1000;
    AVLView.ROTATION_PATH_HIGHLIGHT_DURATION_MS = TreeView.DURATION_MULTIPLIER * 2000;
    AVLView.ROTATION_PATH_HIGHLIGHT_COLOR = "red";
    AVLView.ROTATION_PATH_DESCRIPTION = "Go back up the tree, rotating nodes as necessary to maintain the AVL property.";
    return AVLView;
}(BSTView));
export default AVLView;
//# sourceMappingURL=AVLView.js.map