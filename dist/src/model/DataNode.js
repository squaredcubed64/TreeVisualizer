var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import ArrowDirection from "../controller/ArrowDirection";
/**
 * A node in the data structure. It contains a value and pointers to its left and right children.
 *
 * Also contains a height value, which its tree is responsible for updating.
 */
var DataNode = /** @class */ (function () {
    function DataNode(value) {
        this.left = null;
        this.right = null;
        this.height = 1;
        this.value = value;
    }
    /**
     * @returns The number of vertices from this node to its deepest leaf, NOT the height parameter
     *
     * @description Used to display information about a node in the popup when a node is clicked
     */
    DataNode.prototype.getCalculatedHeight = function () {
        var leftHeight = this.left != null ? this.left.getCalculatedHeight() : 0;
        var rightHeight = this.right != null ? this.right.getCalculatedHeight() : 0;
        return Math.max(leftHeight, rightHeight) + 1;
    };
    /**
     * @returns The balance of this node, which is the difference between the heights of its left and right subtrees.
     * It does not use the height parameter.
     *
     * @description Used to display information about a node in the popup when a node is clicked
     */
    DataNode.prototype.getCalculatedBalance = function () {
        var leftHeight = this.left != null ? this.left.getCalculatedHeight() : 0;
        var rightHeight = this.right != null ? this.right.getCalculatedHeight() : 0;
        return leftHeight - rightHeight;
    };
    /**
     * @param arrowDirection The direction of the traversal. Must not be PARENT_TO_CHILD.
     * @returns The nodes in the traversal, in the order they are visited.
     */
    DataNode.prototype.getTraversal = function (arrowDirection) {
        switch (arrowDirection) {
            case ArrowDirection.PREORDER:
                return this.getPreorderTraversal();
            case ArrowDirection.INORDER:
                return this.getInorderTraversal();
            case ArrowDirection.POSTORDER:
                return this.getPostorderTraversal();
            case ArrowDirection.PARENT_TO_CHILD:
                throw new Error("Cannot get traversal for parent to child");
            default:
                throw new Error("Invalid arrow direction");
        }
    };
    DataNode.prototype.getPreorderTraversal = function () {
        var leftNodes = this.left != null ? this.left.getPreorderTraversal() : [];
        var rightNodes = this.right != null ? this.right.getPreorderTraversal() : [];
        return __spreadArray(__spreadArray([this], leftNodes, true), rightNodes, true);
    };
    DataNode.prototype.getInorderTraversal = function () {
        var leftNodes = this.left != null ? this.left.getInorderTraversal() : [];
        var rightNodes = this.right != null ? this.right.getInorderTraversal() : [];
        return __spreadArray(__spreadArray(__spreadArray([], leftNodes, true), [this], false), rightNodes, true);
    };
    DataNode.prototype.getPostorderTraversal = function () {
        var leftNodes = this.left != null ? this.left.getPostorderTraversal() : [];
        var rightNodes = this.right != null ? this.right.getPostorderTraversal() : [];
        return __spreadArray(__spreadArray(__spreadArray([], leftNodes, true), rightNodes, true), [this], false);
    };
    return DataNode;
}());
export default DataNode;
//# sourceMappingURL=DataNode.js.map