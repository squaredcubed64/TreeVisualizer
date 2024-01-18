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
import BSTModel from "../src/model/BSTModel";
import DataNode from "../src/model/DataNode";
import ArrowDirection from "../src/controller/ArrowDirection";
import { describe, it, expect, beforeEach } from "vitest";
import assert from "../Assert";
import BSTController from "../src/controller/BSTController";
var MockBSTController = /** @class */ (function (_super) {
    __extends(MockBSTController, _super);
    function MockBSTController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MockBSTController;
}(BSTController));
describe("BSTModel", function () {
    var bstModel;
    var mockBSTController;
    beforeEach(function () {
        mockBSTController = new MockBSTController();
        bstModel = new BSTModel(mockBSTController);
    });
    function insertValuesAndReturnResultantAndExpectedShape(arrowDirection) {
        if (arrowDirection === void 0) { arrowDirection = ArrowDirection.PARENT_TO_CHILD; }
        bstModel.arrowDirection = arrowDirection;
        var parentValue = 5;
        var leftChildValue = 3;
        var rightChildValue = 7;
        bstModel.insert(parentValue);
        bstModel.insert(leftChildValue);
        var resultantShape = bstModel.insert(rightChildValue).insertionInformation.shape;
        var parentNode = new DataNode(parentValue);
        var leftChildNode = new DataNode(leftChildValue);
        var rightChildNode = new DataNode(rightChildValue);
        parentNode.left = leftChildNode;
        parentNode.right = rightChildNode;
        var expectedArrows = new Set();
        switch (arrowDirection) {
            case ArrowDirection.PARENT_TO_CHILD:
                expectedArrows.add([parentNode, leftChildNode]);
                expectedArrows.add([parentNode, rightChildNode]);
                break;
            case ArrowDirection.PREORDER:
                expectedArrows.add([parentNode, leftChildNode]);
                expectedArrows.add([leftChildNode, rightChildNode]);
                break;
            case ArrowDirection.INORDER:
                expectedArrows.add([leftChildNode, parentNode]);
                expectedArrows.add([parentNode, rightChildNode]);
                break;
            case ArrowDirection.POSTORDER:
                expectedArrows.add([leftChildNode, rightChildNode]);
                expectedArrows.add([rightChildNode, parentNode]);
                break;
        }
        var expectedShape = {
            inorderTraversal: [leftChildNode, parentNode, rightChildNode],
            layers: [[parentNode], [leftChildNode, rightChildNode]],
            arrows: expectedArrows,
        };
        return [resultantShape, expectedShape];
    }
    it("should return the correct inorder traversal after insertion", function () {
        var _a = insertValuesAndReturnResultantAndExpectedShape(), resultantShape = _a[0], expectedShape = _a[1];
        expect(resultantShape.inorderTraversal).toEqual(expectedShape.inorderTraversal);
    });
    it("should return the correct layers after insertion", function () {
        var _a = insertValuesAndReturnResultantAndExpectedShape(), resultantShape = _a[0], expectedShape = _a[1];
        expect(resultantShape.layers).toEqual(expectedShape.layers);
    });
    it("should return the correct arrows after insertion for the PARENT_TO_CHILD ArrowDirection", function () {
        var _a = insertValuesAndReturnResultantAndExpectedShape(ArrowDirection.PARENT_TO_CHILD), resultantShape = _a[0], expectedShape = _a[1];
        expect(resultantShape.arrows).toEqual(expectedShape.arrows);
    });
    it("should return the correct arrows after insertion for the PREORDER ArrowDirection", function () {
        var _a = insertValuesAndReturnResultantAndExpectedShape(ArrowDirection.PREORDER), resultantShape = _a[0], expectedShape = _a[1];
        expect(resultantShape.arrows).toEqual(expectedShape.arrows);
    });
    it("should return the correct arrows after insertion for the INORDER ArrowDirection", function () {
        var _a = insertValuesAndReturnResultantAndExpectedShape(ArrowDirection.INORDER), resultantShape = _a[0], expectedShape = _a[1];
        expect(resultantShape.arrows).toEqual(expectedShape.arrows);
    });
    it("should return the correct arrows after insertion for the POSTORDER ArrowDirection", function () {
        var _a = insertValuesAndReturnResultantAndExpectedShape(ArrowDirection.POSTORDER), resultantShape = _a[0], expectedShape = _a[1];
        expect(resultantShape.arrows).toEqual(expectedShape.arrows);
    });
    function inorderTraversalAndLayersHaveSameValues(shape1, shape2) {
        var inorderTraversal1 = shape1.inorderTraversal;
        var inorderTraversal2 = shape2.inorderTraversal;
        if (inorderTraversal1.length !== inorderTraversal2.length) {
            return false;
        }
        for (var i = 0; i < inorderTraversal1.length; i++) {
            if (inorderTraversal1[i].value !== inorderTraversal2[i].value) {
                return false;
            }
        }
        var layers1 = shape1.layers;
        var layers2 = shape2.layers;
        if (layers1.length !== layers2.length) {
            return false;
        }
        for (var i = 0; i < layers1.length; i++) {
            var layer1 = layers1[i];
            var layer2 = layers2[i];
            if (layer1.length !== layer2.length) {
                return false;
            }
            for (var j = 0; j < layer1.length; j++) {
                if (layer1[j].value !== layer2[j].value) {
                    return false;
                }
            }
        }
        return true;
    }
    it("should return the correct shape after deleting a node with no children", function () {
        bstModel.insert(5);
        bstModel.insert(3);
        var modelDeletionInformation = bstModel.delete(3);
        assert(modelDeletionInformation.type === "LEQ1Child", "Expected deletion information to be of type LEQ1Child");
        var shape = modelDeletionInformation.shape;
        var expectedShape = {
            inorderTraversal: [new DataNode(5)],
            layers: [[new DataNode(5)]],
            arrows: new Set(),
        };
        expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true);
    });
    it("should return the correct shape after deleting a node with 1 child", function () {
        bstModel.insert(5);
        bstModel.insert(3);
        bstModel.insert(2);
        var modelDeletionInformation = bstModel.delete(3);
        assert(modelDeletionInformation.type === "LEQ1Child", "Expected deletion information to be of type LEQ1Child");
        var shape = modelDeletionInformation.shape;
        var expectedShape = {
            inorderTraversal: [new DataNode(2), new DataNode(5)],
            layers: [[new DataNode(5)], [new DataNode(2)]],
            arrows: new Set([[new DataNode(5), new DataNode(2)]]),
        };
        expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true);
    });
    it("should return the correct shape after deleting a node with 2 children", function () {
        bstModel.insert(5);
        bstModel.insert(3);
        bstModel.insert(2);
        bstModel.insert(4);
        var modelDeletionInformation = bstModel.delete(3);
        assert(modelDeletionInformation.type === "2Children", "Expected deletion information to be of type 2Children");
        var shape = modelDeletionInformation.shape;
        var expectedShape = {
            inorderTraversal: [new DataNode(2), new DataNode(4), new DataNode(5)],
            layers: [[new DataNode(5)], [new DataNode(4)], [new DataNode(2)]],
            arrows: new Set([
                [new DataNode(5), new DataNode(2)],
                [new DataNode(2), new DataNode(4)],
            ]),
        };
        expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true);
    });
    it("should return the correct shape after deleting a root node with no children", function () {
        bstModel.insert(5);
        var modelDeletionInformation = bstModel.delete(5);
        assert(modelDeletionInformation.type === "LEQ1Child", "Expected deletion information to be of type LEQ1Child");
        var shape = modelDeletionInformation.shape;
        var expectedShape = {
            inorderTraversal: [],
            layers: [],
            arrows: new Set(),
        };
        expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true);
    });
    it("should return the correct shape after deleting a root node with 1 child", function () {
        bstModel.insert(5);
        bstModel.insert(7);
        var modelDeletionInformation = bstModel.delete(5);
        assert(modelDeletionInformation.type === "LEQ1Child", "Expected deletion information to be of type LEQ1Child");
        var shape = modelDeletionInformation.shape;
        var expectedShape = {
            inorderTraversal: [new DataNode(7)],
            layers: [[new DataNode(7)]],
            arrows: new Set(),
        };
        expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true);
    });
    it("should return the correct shape after deleting a root node with 2 children", function () {
        bstModel.insert(5);
        bstModel.insert(3);
        bstModel.insert(7);
        var modelDeletionInformation = bstModel.delete(5);
        assert(modelDeletionInformation.type === "2Children", "Expected deletion information to be of type 2Children");
        var shape = modelDeletionInformation.shape;
        var expectedShape = {
            inorderTraversal: [new DataNode(3), new DataNode(7)],
            layers: [[new DataNode(7)], [new DataNode(3)]],
            arrows: new Set([[new DataNode(7), new DataNode(3)]]),
        };
        expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true);
    });
    it("should return the correct shape after failing to find the victim node", function () {
        bstModel.insert(5);
        bstModel.insert(3);
        var modelDeletionInformation = bstModel.delete(7);
        expect(modelDeletionInformation.type).toBe("VictimNotFound");
    });
    it("should return the correct shape after failing to find the victim node in an empty tree", function () {
        var modelDeletionInformation = bstModel.delete(7);
        expect(modelDeletionInformation.type).toBe("VictimNotFound");
    });
    function pathsHaveSameValues(path1, path2) {
        if (path1.length !== path2.length) {
            return false;
        }
        for (var i = 0; i < path1.length; i++) {
            var pathInstruction1 = path1[i];
            var pathNode2 = path2[i];
            if (pathInstruction1.node.value !== pathNode2.value) {
                return false;
            }
        }
        return true;
    }
    it("should find a node correctly", function () {
        var value = 5;
        bstModel.insert(value);
        var expectedPath = [new DataNode(value)];
        var expectedNodeFound = new DataNode(value);
        var findInfo = bstModel.find(value);
        expect(pathsHaveSameValues(findInfo.pathFromRootToTarget, expectedPath)).toBe(true);
        expect(findInfo.nodeFound).toEqual(expectedNodeFound);
    });
});
//# sourceMappingURL=BSTModel.test.js.map