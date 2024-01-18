import DataNode from "../src/model/DataNode";
import ArrowDirection from "../src/controller/ArrowDirection";
import { describe, it, expect, beforeEach } from "vitest";
describe("DataNode", function () {
    var rootNode;
    beforeEach(function () {
        rootNode = new DataNode(5);
        rootNode.left = new DataNode(3);
        rootNode.right = new DataNode(7);
        rootNode.left.left = new DataNode(2);
        rootNode.left.right = new DataNode(4);
        rootNode.right.left = new DataNode(6);
        rootNode.right.right = new DataNode(8);
    });
    it("should return the correct preorder traversal", function () {
        var _a, _b, _c, _d;
        var expectedTraversal = [
            rootNode,
            rootNode.left,
            (_a = rootNode.left) === null || _a === void 0 ? void 0 : _a.left,
            (_b = rootNode.left) === null || _b === void 0 ? void 0 : _b.right,
            rootNode.right,
            (_c = rootNode.right) === null || _c === void 0 ? void 0 : _c.left,
            (_d = rootNode.right) === null || _d === void 0 ? void 0 : _d.right,
        ];
        var actualTraversal = rootNode.getTraversal(ArrowDirection.PREORDER);
        expect(actualTraversal).toEqual(expectedTraversal);
    });
    it("should return the correct inorder traversal", function () {
        var _a, _b, _c, _d;
        var expectedTraversal = [
            (_a = rootNode.left) === null || _a === void 0 ? void 0 : _a.left,
            rootNode.left,
            (_b = rootNode.left) === null || _b === void 0 ? void 0 : _b.right,
            rootNode,
            (_c = rootNode.right) === null || _c === void 0 ? void 0 : _c.left,
            rootNode.right,
            (_d = rootNode.right) === null || _d === void 0 ? void 0 : _d.right,
        ];
        var actualTraversal = rootNode.getTraversal(ArrowDirection.INORDER);
        expect(actualTraversal).toEqual(expectedTraversal);
    });
    it("should return the correct postorder traversal", function () {
        var _a, _b, _c, _d;
        var expectedTraversal = [
            (_a = rootNode.left) === null || _a === void 0 ? void 0 : _a.left,
            (_b = rootNode.left) === null || _b === void 0 ? void 0 : _b.right,
            rootNode.left,
            (_c = rootNode.right) === null || _c === void 0 ? void 0 : _c.left,
            (_d = rootNode.right) === null || _d === void 0 ? void 0 : _d.right,
            rootNode.right,
            rootNode,
        ];
        var actualTraversal = rootNode.getTraversal(ArrowDirection.POSTORDER);
        expect(actualTraversal).toEqual(expectedTraversal);
    });
    it("should throw an error when getting traversal for parent to child", function () {
        expect(function () { return rootNode.getTraversal(ArrowDirection.PARENT_TO_CHILD); }).toThrow("Cannot get traversal for parent to child");
    });
});
//# sourceMappingURL=DataNode.test.js.map