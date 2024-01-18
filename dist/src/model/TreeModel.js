import assert from "../../Assert";
import ArrowDirection from "../controller/ArrowDirection";
/**
 * Provides logic for calculating a tree's arrows, shape, and layers
 */
var TreeModel = /** @class */ (function () {
    function TreeModel(controller) {
        this.arrowDirection = ArrowDirection.PARENT_TO_CHILD;
        this.root = null;
        this.controller = controller;
    }
    /**
     * @returns An array of pairs of nodes to draw arrows between
     */
    TreeModel.prototype.getArrows = function () {
        if (this.root == null) {
            return new Set();
        }
        var arrows = new Set();
        // Draw arrows first
        if (this.arrowDirection === ArrowDirection.PARENT_TO_CHILD) {
            var arbitraryTraversal = this.root.getTraversal(ArrowDirection.INORDER);
            arbitraryTraversal.forEach(function (node) {
                if (node.left != null) {
                    arrows.add([node, node.left]);
                }
                if (node.right != null) {
                    arrows.add([node, node.right]);
                }
            });
        }
        else {
            var traversal = this.root.getTraversal(this.arrowDirection);
            for (var i = 0; i < traversal.length - 1; i++) {
                var node = traversal[i];
                var nextNode = traversal[i + 1];
                arrows.add([node, nextNode]);
            }
        }
        return arrows;
    };
    TreeModel.prototype.getPropertiesOfNode = function (node) {
        return {
            height: node.getCalculatedHeight(),
            balance: node.getCalculatedBalance(),
            leftHeight: node.left != null ? node.left.getCalculatedHeight() : 0,
            rightHeight: node.right != null ? node.right.getCalculatedHeight() : 0,
        };
    };
    /**
     * @returns An object containing the inorder traversal, layers, and arrows of the tree
     */
    TreeModel.prototype.getShape = function () {
        if (this.root == null) {
            return { inorderTraversal: [], layers: [], arrows: new Set() };
        }
        var inorderTraversal = this.root.getTraversal(ArrowDirection.INORDER);
        var layers = this.getLayers();
        var arrows = this.getArrows();
        return { inorderTraversal: inorderTraversal, layers: layers, arrows: arrows };
    };
    /**
     * @returns An array of arrays of nodes, where each array is a layer of the tree
     */
    TreeModel.prototype.getLayers = function () {
        if (this.root == null) {
            return [];
        }
        var layers = [];
        var queue = [this.root];
        while (queue.length > 0) {
            var numNodesInLayer = queue.length;
            var layer = [];
            for (var _ = 0; _ < numNodesInLayer; _++) {
                var node = queue.shift();
                assert(node !== undefined, "Node is undefined");
                layer.push(node);
                if (node.left != null) {
                    queue.push(node.left);
                }
                if (node.right != null) {
                    queue.push(node.right);
                }
            }
            layers.push(layer);
        }
        return layers;
    };
    return TreeModel;
}());
export default TreeModel;
//# sourceMappingURL=TreeModel.js.map