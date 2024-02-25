import assert from "../../Assert";
import type TreeShape from "../controller/TreeShape";
import type HeapInsertionInformation from "../controller/operationInformation/HeapInsertionInformation";
import type HeapDeletionInformation from "../controller/operationInformation/deletionInformation/HeapDeletionInformation";
import type SwapPathInstruction from "../controller/pathInstruction/SwapPathInstruction";
import DataNode from "./DataNode";
import TreeModel from "./TreeModel";

export default class HeapModel extends TreeModel {
  private readonly nodes: DataNode[] = [];

  private static getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  public insert(value: number): HeapInsertionInformation<DataNode> {
    this.nodes.push(new DataNode(value));
    const shapeAfterInsertion = this.getShape();
    const insertedNode = this.nodes[this.nodes.length - 1];

    // at each step, we need node, parent, nodeValue, parentValue, and the resultant shape
    const swapPath: Array<SwapPathInstruction<DataNode>> = [];
    let currIndex = this.nodes.length - 1;

    while (currIndex > 0) {
      const parentIndex = HeapModel.getParentIndex(currIndex);
      const node = this.nodes[currIndex];
      const parent = this.nodes[parentIndex];
      const initialNodeValue = node.value;
      const initialParentValue = parent.value;

      const didSwap = node.value < parent.value;
      if (didSwap) {
        this.swapValues(currIndex, parentIndex);
      }

      swapPath.push({
        node,
        parent,
        secondaryDescription: {
          type: "insert",
          result: didSwap ? "swap" : "none",
          initialNodeValue,
          initialParentValue,
        },
      });

      if (didSwap) {
        currIndex = parentIndex;
      } else {
        break;
      }
    }

    let directionFromParentToNode: "root" | "left" | "right" = "left";
    if (this.nodes.length === 1) {
      directionFromParentToNode = "root";
    } else if (this.nodes.length % 2 === 1) {
      directionFromParentToNode = "right";
    }

    return {
      shapeAfterInsertion,
      swapPath,
      insertedNode,
      insertedNodesParent: this.getParent(insertedNode),
      insertedValue: value,
      directionFromParentToNode,
      didSwapToRoot: currIndex === 0,
    };
  }

  public delete(value: number): HeapDeletionInformation<DataNode> {
    // delete from empty tree
    if (this.nodes.length === 0) {
      return {
        deletedNode: null,
        rootAfterDeletion: null,
        shapeAfterDeletion: this.getShape(),
        swapPath: [],
        didSwapToLeaf: false,
      };
    }

    const last = this.nodes.pop();
    assert(last !== undefined, "last is undefined");

    // delete from tree with only one node
    if (this.nodes.length === 0) {
      return {
        deletedNode: last,
        rootAfterDeletion: null,
        shapeAfterDeletion: this.getShape(),
        swapPath: [],
        didSwapToLeaf: false,
      };
    }

    this.nodes[0].value = last.value;
    let currIndex = 0;
    const swapPath: Array<SwapPathInstruction<DataNode>> = [];
    let didSwapToLeaf = false;

    // heapify
    while (true) {
      const leftIndex = 2 * currIndex + 1;
      const rightIndex = 2 * currIndex + 2;
      let smallestChildIndex: number | null = null;

      if (leftIndex < this.nodes.length) {
        smallestChildIndex = leftIndex;
      }

      if (
        rightIndex < this.nodes.length &&
        this.nodes[rightIndex].value < this.nodes[leftIndex].value
      ) {
        smallestChildIndex = rightIndex;
      }

      if (smallestChildIndex == null) {
        didSwapToLeaf = true;
        break;
      }

      const didSwap =
        this.nodes[smallestChildIndex].value < this.nodes[currIndex].value;

      swapPath.push({
        node: this.nodes[smallestChildIndex],
        parent: this.nodes[currIndex],
        secondaryDescription: {
          type: "delete",
          result: didSwap ? "swap" : "none",
          initialNodeValue: this.nodes[smallestChildIndex].value,
          initialParentValue: this.nodes[currIndex].value,
        },
      });

      if (didSwap) {
        this.swapValues(currIndex, smallestChildIndex);
        currIndex = smallestChildIndex;
      } else {
        break;
      }
    }

    return {
      deletedNode: last,
      rootAfterDeletion: this.nodes[0],
      shapeAfterDeletion: this.getShape(),
      swapPath,
      didSwapToLeaf,
    };
  }

  /**
   * Note: Heap's find() (aka peek()) is trivial enough that the model need not provide any information.
   */
  public find(value: number): Record<string, unknown> {
    return {};
  }

  protected getShape(): TreeShape<DataNode> {
    this.root = this.nodes[0];
    this.updateLinksFromParentsToChildren();
    return super.getShape();
  }

  private swapValues(index1: number, index2: number): void {
    const temp = this.nodes[index1].value;
    this.nodes[index1].value = this.nodes[index2].value;
    this.nodes[index2].value = temp;
  }

  private updateLinksFromParentsToChildren(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      const leftChildIndex = 2 * i + 1;
      if (leftChildIndex < this.nodes.length) {
        node.left = this.nodes[leftChildIndex];
      } else {
        node.left = null;
      }

      const rightChildIndex = 2 * i + 2;
      if (rightChildIndex < this.nodes.length) {
        node.right = this.nodes[rightChildIndex];
      } else {
        node.right = null;
      }
    }
  }

  private getParent(node: DataNode): DataNode | null {
    const index = this.nodes.indexOf(node);
    if (index === 0) {
      return null;
    }
    return this.nodes[HeapModel.getParentIndex(index)];
  }

  private isLeaf(index: number): boolean {
    return 2 * index + 1 >= this.nodes.length;
  }
}
