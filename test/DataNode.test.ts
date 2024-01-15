import DataNode from "../src/model/DataNode";
import ArrowDirection from "../src/controller/ArrowDirection";
import { describe, it, expect, beforeEach } from "vitest";

describe("DataNode", () => {
  let rootNode: DataNode;

  beforeEach(() => {
    rootNode = new DataNode(5);
    rootNode.left = new DataNode(3);
    rootNode.right = new DataNode(7);
    rootNode.left.left = new DataNode(2);
    rootNode.left.right = new DataNode(4);
    rootNode.right.left = new DataNode(6);
    rootNode.right.right = new DataNode(8);
  });

  it("should return the correct preorder traversal", () => {
    const expectedTraversal = [
      rootNode,
      rootNode.left,
      rootNode.left?.left,
      rootNode.left?.right,
      rootNode.right,
      rootNode.right?.left,
      rootNode.right?.right,
    ];
    const actualTraversal = rootNode.getTraversal(ArrowDirection.PREORDER);
    expect(actualTraversal).toEqual(expectedTraversal);
  });

  it("should return the correct inorder traversal", () => {
    const expectedTraversal = [
      rootNode.left?.left,
      rootNode.left,
      rootNode.left?.right,
      rootNode,
      rootNode.right?.left,
      rootNode.right,
      rootNode.right?.right,
    ];
    const actualTraversal = rootNode.getTraversal(ArrowDirection.INORDER);
    expect(actualTraversal).toEqual(expectedTraversal);
  });

  it("should return the correct postorder traversal", () => {
    const expectedTraversal = [
      rootNode.left?.left,
      rootNode.left?.right,
      rootNode.left,
      rootNode.right?.left,
      rootNode.right?.right,
      rootNode.right,
      rootNode,
    ];
    const actualTraversal = rootNode.getTraversal(ArrowDirection.POSTORDER);
    expect(actualTraversal).toEqual(expectedTraversal);
  });

  it("should throw an error when getting traversal for parent to child", () => {
    expect(() => rootNode.getTraversal(ArrowDirection.PARENT_TO_CHILD)).toThrow(
      "Cannot get traversal for parent to child",
    );
  });
});
