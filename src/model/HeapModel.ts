import type TreeShape from "../controller/TreeShape";
import type HeapInsertionInformation from "../controller/operationInformation/HeapInsertionInformation";
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
    const shapeAfterInitialInsertion = this.getShape();
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
          result: didSwap ? "swap" : "heap property satisfied",
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
      console.log("right");
      directionFromParentToNode = "right";
    }

    return {
      shapeAfterInitialInsertion,
      swapPath,
      insertedNode,
      insertedNodesParent: this.getParent(insertedNode),
      insertedValue: value,
      directionFromParentToNode,
      didSwapToRoot: currIndex === 0,
    };
  }

  public delete(value: number): null {
    throw new Error("Method not implemented.");
  }

  public find(value: number): null {
    throw new Error("Method not implemented.");
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
      const rightChildIndex = 2 * i + 2;
      if (leftChildIndex < this.nodes.length) {
        node.left = this.nodes[leftChildIndex];
      }
      if (rightChildIndex < this.nodes.length) {
        node.right = this.nodes[rightChildIndex];
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
}
