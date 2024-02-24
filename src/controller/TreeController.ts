import assert from "../../Assert";
import type DataNode from "../model/DataNode";
import type TreeModel from "../model/TreeModel";
import type DisplayNode from "../view/DisplayNode";
import TreeView from "../view/TreeView";
import type TreeShape from "./TreeShape";
import type TreeInsertionInformation from "./operationInformation/TreeInsertionInformation";

export default abstract class TreeController {
  protected readonly dataNodeToDisplayNode = new Map<DataNode, DisplayNode>();
  protected readonly model: TreeModel;
  protected readonly view: TreeView;

  public static centerTree(canvasWidth: number): void {
    TreeView.centerTree(canvasWidth);
  }

  /**
   * Inserts a value into the model and updates the view accordingly.
   * @param value The value to insert
   */
  public insert(value: number): void {
    const insertionInformation = this.model.insert(value);

    // A placeholder for the node that's being inserted. The view will update this upon insertion.
    const placeholderNode = TreeView.makePlaceholderNode();
    this.dataNodeToDisplayNode.set(
      insertionInformation.insertedNode,
      placeholderNode,
    );

    this.view.insert(this.translateInsertionInformation(insertionInformation));
  }

  /**
   * Deletes a value from the model and updates the view accordingly.
   * @param value The value to delete
   */
  public delete(value: number): void {
    const deletionInformation = this.model.delete(value);
    this.view.delete(this.translateDeletionInformation(deletionInformation));
  }

  /**
   * Finds a value in the model and updates the view accordingly.
   * @param value The value to find
   */
  public find(value: number): void {
    const findInformation = this.model.find(value);
    this.view.find(this.translateFindInformation(findInformation));
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

  public handleHover(x: number, y: number): void {
    this.view.handleHover(x, y);
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

  protected translateNodeOrNull(dataNode: DataNode | null): DisplayNode | null {
    if (dataNode === null) {
      return null;
    }
    return this.translateNode(dataNode);
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

  protected abstract translateInsertionInformation(
    insertionInformation: TreeInsertionInformation<DataNode>,
  ): TreeInsertionInformation<DisplayNode>;

  protected abstract translateDeletionInformation(
    deletionInformation: any,
  ): any;

  protected abstract translateFindInformation(findInformation: any): any;
}
