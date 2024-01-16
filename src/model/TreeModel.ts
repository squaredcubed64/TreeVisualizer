import assert from "../../Assert";
import ArrowDirection from "../controller/ArrowDirection";
import type TreeController from "../controller/TreeController";
import type TreeShape from "../controller/TreeShape";
import type DataNode from "./DataNode";

/**
 * Provides logic for calculating a tree's arrows, shape, and layers
 */
export default abstract class TreeModel {
  public controller: TreeController;
  public arrowDirection: ArrowDirection = ArrowDirection.PARENT_TO_CHILD;
  protected root: DataNode | null = null;

  public abstract insert(value: number): any;
  public abstract delete(value: number): any;
  public abstract find(value: number): any;

  public constructor(controller: TreeController) {
    this.controller = controller;
  }

  /**
   * @returns An array of pairs of nodes to draw arrows between
   */
  public getArrows(): Set<[DataNode, DataNode]> {
    if (this.root == null) {
      return new Set();
    }

    const arrows = new Set<[DataNode, DataNode]>();
    // Draw arrows first
    if (this.arrowDirection === ArrowDirection.PARENT_TO_CHILD) {
      const arbitraryTraversal = this.root.getTraversal(ArrowDirection.INORDER);
      arbitraryTraversal.forEach((node) => {
        if (node.left != null) {
          arrows.add([node, node.left]);
        }
        if (node.right != null) {
          arrows.add([node, node.right]);
        }
      });
    } else {
      const traversal = this.root.getTraversal(this.arrowDirection);
      for (let i = 0; i < traversal.length - 1; i++) {
        const node = traversal[i];
        const nextNode = traversal[i + 1];
        arrows.add([node, nextNode]);
      }
    }
    return arrows;
  }

  public getPropertiesOfNode(node: DataNode): {
    height: number;
    balance: number;
    leftHeight: number;
    rightHeight: number;
  } {
    return {
      height: node.getCalculatedHeight(),
      balance: node.getCalculatedBalance(),
      leftHeight: node.left != null ? node.left.getCalculatedHeight() : 0,
      rightHeight: node.right != null ? node.right.getCalculatedHeight() : 0,
    };
  }

  /**
   * @returns An object containing the inorder traversal, layers, and arrows of the tree
   */
  protected getShape(): TreeShape<DataNode> {
    if (this.root == null) {
      return { inorderTraversal: [], layers: [], arrows: new Set() };
    }

    const inorderTraversal = this.root.getTraversal(ArrowDirection.INORDER);
    const layers = this.getLayers();
    const arrows = this.getArrows();
    return { inorderTraversal, layers, arrows };
  }

  /**
   * @returns An array of arrays of nodes, where each array is a layer of the tree
   */
  protected getLayers(): DataNode[][] {
    if (this.root == null) {
      return [];
    }

    const layers: DataNode[][] = [];
    const queue = [this.root];
    while (queue.length > 0) {
      const numNodesInLayer = queue.length;
      const layer: DataNode[] = [];
      for (let _ = 0; _ < numNodesInLayer; _++) {
        const node = queue.shift();
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
  }
}
