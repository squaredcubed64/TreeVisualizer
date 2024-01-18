import assert from "../../Assert";
import TreeView from "../view/TreeView";
var TreeController = /** @class */ (function () {
    function TreeController() {
        this.dataNodeToDisplayNode = new Map();
    }
    TreeController.centerTree = function (canvasWidth) {
        TreeView.centerTree(canvasWidth);
    };
    TreeController.prototype.setAnimationSpeedSetting = function (animationSpeedSetting) {
        this.view.setAnimationSpeedSetting(animationSpeedSetting);
    };
    TreeController.prototype.getAnimationSpeedSetting = function () {
        return this.view.getAnimationSpeedSetting();
    };
    TreeController.prototype.animate = function () {
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");
        assert(context !== null, "context is null");
        this.view.animate(canvas, context);
    };
    TreeController.prototype.stopAnimation = function () {
        this.view.stopAnimation();
    };
    TreeController.prototype.handleHover = function (x, y) {
        this.view.handleHover(x, y);
    };
    TreeController.prototype.getPropertiesOfNode = function (node) {
        return this.model.getPropertiesOfNode(this.reverseTranslateNode(node));
    };
    TreeController.prototype.translateNode = function (dataNode) {
        var displayNode = this.dataNodeToDisplayNode.get(dataNode);
        assert(displayNode !== undefined, "dataNode not found in map");
        return displayNode;
    };
    TreeController.prototype.reverseTranslateNode = function (displayNode) {
        var result;
        this.dataNodeToDisplayNode.forEach(function (mapDisplayNode, dataNode) {
            if (mapDisplayNode === displayNode) {
                result = dataNode;
            }
        });
        if (result === undefined) {
            throw new Error("displayNode not found in map");
        }
        return result;
    };
    TreeController.prototype.translateShape = function (shape) {
        var inorderTraversal = shape.inorderTraversal, layers = shape.layers, arrows = shape.arrows;
        return {
            inorderTraversal: this.translateArray(inorderTraversal),
            layers: this.translateLayers(layers),
            arrows: this.translateArrows(arrows),
        };
    };
    TreeController.prototype.translateArray = function (dataNodeArray) {
        var _this = this;
        return dataNodeArray.map(function (dataNode) {
            return _this.translateNode(dataNode);
        });
    };
    TreeController.prototype.translateLayers = function (layers) {
        var _this = this;
        return layers.map(function (layer) { return _this.translateArray(layer); });
    };
    TreeController.prototype.translateArrows = function (arrows) {
        var _this = this;
        return new Set(Array.from(arrows).map(function (arrow) { return _this.translateArray(arrow); }));
    };
    return TreeController;
}());
export default TreeController;
//# sourceMappingURL=TreeController.js.map