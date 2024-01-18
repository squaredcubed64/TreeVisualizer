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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import assert from "../../Assert";
import BSTModel from "./BSTModel";
// For debugging
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toString(node, depth, extra) {
    if (depth === void 0) { depth = 0; }
    if (extra === void 0) { extra = "root"; }
    if (node == null) {
        return "";
    }
    var out = "\t".repeat(depth) + extra + " " + node.value.toString() + "\n";
    out += toString(node.left, depth + 1, "left");
    out += toString(node.right, depth + 1, "right");
    return out;
}
/**
 * A Binary Search Tree data structure that calculates information the view needs for animations.
 */
var AVLModel = /** @class */ (function (_super) {
    __extends(AVLModel, _super);
    function AVLModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AVLModel.getHeight = function (node) {
        if (node === null) {
            return 0;
        }
        return node.height;
    };
    AVLModel.updateHeight = function (node) {
        node.height =
            Math.max(AVLModel.getHeight(node.left), AVLModel.getHeight(node.right)) +
                1;
    };
    AVLModel.getBalance = function (node) {
        if (node === null) {
            return 0;
        }
        return AVLModel.getHeight(node.left) - AVLModel.getHeight(node.right);
    };
    AVLModel.rotateRight = function (y) {
        assert(y.left !== null, "y.left is null");
        var x = y.left;
        var T2 = x.right;
        x.right = y;
        y.left = T2;
        AVLModel.updateHeight(y);
        AVLModel.updateHeight(x);
        return x;
    };
    AVLModel.rotateLeft = function (x) {
        assert(x.right !== null, "x.right is null");
        var y = x.right;
        var T2 = y.left;
        y.left = x;
        x.right = T2;
        AVLModel.updateHeight(x);
        AVLModel.updateHeight(y);
        return y;
    };
    /**
     * Inserts a new node into the model
     * @param value The value to insert
     * @returns The information needed to animate the insertion and the inserted node
     */
    AVLModel.prototype.insert = function (value) {
        var _a = _super.prototype.insert.call(this, value), bstInsertionInformation = _a.insertionInformation, insertedNode = _a.insertedNode;
        var pathFromRootToTarget = bstInsertionInformation.pathFromRootToTarget;
        var rotationPath = this.rebalanceAlongPath(pathFromRootToTarget.map(function (pathInstruction) { return pathInstruction.node; }));
        return {
            insertionInformation: __assign(__assign({}, bstInsertionInformation), { rotationPath: rotationPath }),
            insertedNode: insertedNode,
        };
    };
    /**
     * Deletes a node from the model
     * @param value The value to delete
     * @returns The information needed to animate the deletion
     */
    AVLModel.prototype.delete = function (value) {
        var bstDeletionInformation = _super.prototype.delete.call(this, value);
        var pathFromRootToTarget = bstDeletionInformation.pathFromRootToTarget;
        var rotationPath;
        if (bstDeletionInformation.type === "2Children") {
            var pathFromTargetsRightChildToSuccessor = bstDeletionInformation.pathFromTargetsRightChildToSuccessor;
            var pathFromRootToSuccessor = pathFromRootToTarget
                .map(function (pathInstruction) { return pathInstruction.node; })
                .concat(pathFromTargetsRightChildToSuccessor.map(function (pathInstruction) { return pathInstruction.node; }));
            rotationPath = this.rebalanceAlongPath(pathFromRootToSuccessor);
        }
        else {
            rotationPath = this.rebalanceAlongPath(pathFromRootToTarget.map(function (pathInstruction) { return pathInstruction.node; }));
        }
        return __assign(__assign({}, bstDeletionInformation), { rotationPath: rotationPath });
    };
    /**
     * Applies rotations to rebalance the tree along the given path according to AVL rules
     * @param path The path to rebalance along
     * @returns Information about the rotations that occurred
     */
    AVLModel.prototype.rebalanceAlongPath = function (path) {
        var rotationPath = [];
        while (path.length > 0) {
            var node = path.pop();
            assert(node !== undefined, "ancestor is undefined");
            rotationPath.push(this.rebalance(node, path.length === 0 ? null : path[path.length - 1]));
            AVLModel.updateHeight(node);
        }
        return rotationPath;
    };
    /**
     * Rebalances the tree at node according to AVL rules
     * @param node The node to rebalance
     * @param parent The parent of the node, or null if the node is the root
     * @returns The information the View needs to animate the step of the rotation path at node.
     */
    AVLModel.prototype.rebalance = function (node, parent) {
        var balanceFactor = AVLModel.getBalance(node);
        var shapesAfterRotation = [];
        // If this node becomes unbalanced, then there are 4 cases
        if (balanceFactor > 1) {
            if (AVLModel.getBalance(node.left) >= 0) {
                // Left Left Case
                this.handleRotation(shapesAfterRotation, node, parent, "right");
            }
            else {
                // Left Right Case
                assert(node.left !== null, "node.left is null");
                this.handleRotation(shapesAfterRotation, node.left, node, "left");
                this.handleRotation(shapesAfterRotation, node, parent, "right");
            }
        }
        else if (balanceFactor < -1) {
            if (AVLModel.getBalance(node.right) <= 0) {
                // Right Right Case
                this.handleRotation(shapesAfterRotation, node, parent, "left");
            }
            else {
                // Right Left Case
                assert(node.right !== null, "node.right is null");
                this.handleRotation(shapesAfterRotation, node.right, node, "right");
                this.handleRotation(shapesAfterRotation, node, parent, "left");
            }
        }
        var secondaryDescription = {
            type: "rotation",
            leftHeight: AVLModel.getHeight(node.left),
            rightHeight: AVLModel.getHeight(node.right),
            newBalanceFactor: balanceFactor,
            newHeight: AVLModel.getHeight(node),
        };
        return {
            node: node,
            shapesAfterRotation: shapesAfterRotation,
            secondaryDescription: secondaryDescription,
        };
    };
    /**
     * Rotates around pivot, attaches the result to the parent, and updates shapesAfterRotation
     * @param shapesAfterRotation The array to push the shapes after rotation to
     * @param pivot The node to rotate around
     * @param pivotParent The parent of the pivot, or null if the pivot is the root
     * @param rotationDirection Which direction to rotate in
     */
    AVLModel.prototype.handleRotation = function (shapesAfterRotation, pivot, pivotParent, rotationDirection) {
        // Whether the pivot is a root, left child, or right child
        var directionFromParent = pivotParent === null
            ? "root"
            : pivotParent.left === pivot
                ? "left"
                : "right";
        if (rotationDirection === "left") {
            pivot = AVLModel.rotateLeft(pivot);
        }
        else {
            pivot = AVLModel.rotateRight(pivot);
        }
        this.attach(pivot, pivotParent, directionFromParent);
        shapesAfterRotation.push(this.getShape());
    };
    /**
     * Attaches node to parent after a rotation
     * @param node The node to attach
     * @param parent The parent of the node, or null if the node is the root
     * @param directionFromParent Whether the node is a root or left child or right child of parent
     */
    AVLModel.prototype.attach = function (node, parent, directionFromParent) {
        switch (directionFromParent) {
            case "left":
                assert(parent !== null, "parent is null");
                parent.left = node;
                break;
            case "right":
                assert(parent !== null, "parent is null");
                parent.right = node;
                break;
            case "root":
                this.root = node;
                break;
        }
    };
    return AVLModel;
}(BSTModel));
export default AVLModel;
//# sourceMappingURL=AVLModel.js.map