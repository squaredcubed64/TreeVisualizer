import assert from "../../Assert";
import type DataNode from "../model/DataNode";
import type TreeModel from "../model/TreeModel";
import type DisplayNode from "../view/DisplayNode";
import TreeView from "../view/TreeView";
import type TreeShape from "./TreeShape";

export default abstract class TreeController {
  protected readonly dataNodeToDisplayNode = new Map<DataNode, DisplayNode>();
  protected readonly model: TreeModel;
  protected readonly view: TreeView;

  public static centerTree(canvasWidth: number): void {
    TreeView.centerTree(canvasWidth);
  }

  public setAnimationSpeedSetting(animationSpeedSetting: number): void {
    this.view.setAnimationSpeedSetting(animationSpeedSetting);
  }

  public getAnimationSpeedSetting(): number {
    return this.view.getAnimationSpeedSetting();
  }

  public animate(): void {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    assert(context !== null, "context is null");
    this.view.animate(canvas, context);
  }

  public stopAnimation(): void {
    this.view.stopAnimation();
  }

  public handleClick(x: number, y: number): void {
    this.view.handleClick(x, y);
  }

  public getPropertiesOfNode(node: DisplayNode): {
    height: number;
    balance: number;
    leftHeight: number;
    rightHeight: number;
  } {
    return this.model.getPropertiesOfNode(this.reverseTranslateNode(node));
  }

  protected translateNode(dataNode: DataNode): DisplayNode {
    const displayNode = this.dataNodeToDisplayNode.get(dataNode);
    assert(displayNode !== undefined, "dataNode not found in map");
    return displayNode;
  }

  protected reverseTranslateNode(displayNode: DisplayNode): DataNode {
    let result: DataNode | undefined;

    this.dataNodeToDisplayNode.forEach((mapDisplayNode, dataNode) => {
      if (mapDisplayNode === displayNode) {
        result = dataNode;
      }
    });

    if (result === undefined) {
      throw new Error("displayNode not found in map");
    }

    return result;
  }

  protected translateShape(shape: TreeShape<DataNode>): TreeShape<DisplayNode> {
    const { inorderTraversal, layers, arrows } = shape;
    return {
      inorderTraversal: this.translateArray(inorderTraversal),
      layers: this.translateLayers(layers),
      arrows: this.translateArrows(arrows),
    };
  }

  protected translateArray(dataNodeArray: DataNode[]): DisplayNode[] {
    return dataNodeArray.map((dataNode: DataNode) =>
      this.translateNode(dataNode),
    );
  }

  protected translateLayers(layers: DataNode[][]): DisplayNode[][] {
    return layers.map((layer: DataNode[]) => this.translateArray(layer));
  }

  protected translateArrows(
    arrows: Set<[DataNode, DataNode]>,
  ): Set<[DisplayNode, DisplayNode]> {
    return new Set(
      Array.from(arrows).map(
        (arrow) => this.translateArray(arrow) as [DisplayNode, DisplayNode],
      ),
    );
  }
}
