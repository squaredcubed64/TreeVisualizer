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
import BSTModel from "../model/BSTModel";
import BSTView from "../view/BSTView";
import TreeView from "../view/TreeView";
import TreeController from "./TreeController";
/**
 * The controller for the BST. It is responsible for translating the model's return types into the view's parameter types
 */
var BSTController = /** @class */ (function (_super) {
    __extends(BSTController, _super);
    function BSTController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.model = new BSTModel(_this);
        _this.view = new BSTView(_this);
        return _this;
    }
    BSTController.prototype.setArrowDirection = function (arrowDirection) {
        this.model.arrowDirection = arrowDirection;
        this.view.setArrows(this.translateArrows(this.model.getArrows()));
    };
    BSTController.prototype.getArrowDirection = function () {
        return this.model.arrowDirection;
    };
    /**
     * Inserts a value into the model and updates the view accordingly.
     * @param value The value to insert
     */
    BSTController.prototype.insert = function (value) {
        var _a = this.model.insert(value), insertionInformation = _a.insertionInformation, insertedNode = _a.insertedNode;
        // A placeholder for the node that's being inserted. The view will update this upon insertion.
        var placeholderNode = TreeView.makePlaceholderNode();
        this.dataNodeToDisplayNode.set(insertedNode, placeholderNode);
        this.view.insert(this.translateInsertionInformation(insertionInformation));
    };
    /**
     * Deletes a value from the model and updates the view accordingly.
     * @param value The value to delete
     */
    BSTController.prototype.delete = function (value) {
        var deletionInformation = this.model.delete(value);
        this.view.delete(this.translateDeletionInformation(deletionInformation));
    };
    /**
     * Finds a value in the model and updates the view accordingly.
     * @param value The value to find
     */
    BSTController.prototype.find = function (value) {
        var findInformation = this.model.find(value);
        this.view.find(this.translateFindInformation(findInformation));
    };
    BSTController.prototype.translateInsertionInformation = function (insertionInformation) {
        var shape = insertionInformation.shape, pathFromRootToTarget = insertionInformation.pathFromRootToTarget, value = insertionInformation.value;
        return {
            shape: this.translateShape(shape),
            pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
            value: value,
        };
    };
    BSTController.prototype.translateDeletionInformation = function (deletionInformation) {
        switch (deletionInformation.type) {
            case "LEQ1Child": {
                var shape = deletionInformation.shape, pathFromRootToTarget = deletionInformation.pathFromRootToTarget, victimNode = deletionInformation.victimNode;
                return {
                    type: "LEQ1Child",
                    shape: this.translateShape(shape),
                    pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
                    victimNode: this.translateNode(victimNode),
                };
            }
            case "2Children": {
                var shape = deletionInformation.shape, pathFromRootToTarget = deletionInformation.pathFromRootToTarget, victimNode = deletionInformation.victimNode, pathFromTargetsRightChildToSuccessor = deletionInformation.pathFromTargetsRightChildToSuccessor, successorNode = deletionInformation.successorNode;
                return {
                    type: "2Children",
                    shape: this.translateShape(shape),
                    pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
                    victimNode: this.translateNode(victimNode),
                    pathFromTargetsRightChildToSuccessor: this.translatePath(pathFromTargetsRightChildToSuccessor),
                    successorNode: this.translateNode(successorNode),
                };
            }
            case "VictimNotFound": {
                var pathFromRootToTarget = deletionInformation.pathFromRootToTarget;
                return {
                    type: "VictimNotFound",
                    pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
                };
            }
        }
    };
    BSTController.prototype.translateFindInformation = function (findInformation) {
        var pathFromRootToTarget = findInformation.pathFromRootToTarget, nodeFound = findInformation.nodeFound;
        return {
            pathFromRootToTarget: this.translatePath(pathFromRootToTarget),
            nodeFound: nodeFound !== null ? this.translateNode(nodeFound) : null,
        };
    };
    BSTController.prototype.translatePath = function (path) {
        var _this = this;
        return path.map(function (pathInstruction) {
            var node = pathInstruction.node, secondaryDescription = pathInstruction.secondaryDescription;
            return { node: _this.translateNode(node), secondaryDescription: secondaryDescription };
        });
    };
    return BSTController;
}(TreeController));
export default BSTController;
//# sourceMappingURL=BSTController.js.map