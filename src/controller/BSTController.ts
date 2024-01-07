import type DataNode from '../model/DataNode'
import DisplayNode from '../view/DisplayNode'
import type BSTModel from '../model/BSTModel'
import type BSTView from '../view/BSTView'
import type ModelInsertionInformation from '../model/ModelInsertionInformation'
import type ViewInsertionInformation from '../view/ViewInsertionInformation'
import { assert } from '../Utils'

export default class BSTController {
  private readonly dataNodeToDisplayNode = new Map<DataNode, DisplayNode>()

  constructor (private readonly model: BSTModel, private readonly view: BSTView) {
    this.dataNodeToDisplayNode = new Map<DataNode, DisplayNode>()
  }

  insert (value: number): void {
    const modelInsertionInformation = this.model.insert(value)
    const viewInsertionInformation = this.translateInsertionInformation(modelInsertionInformation)
    this.view.insert(viewInsertionInformation)
  }

  private translateInsertionInformation (modelInsertionInformation: ModelInsertionInformation): ViewInsertionInformation {
    const { shape, path, insertedNode } = modelInsertionInformation
    const { inorderTraversal, layers, arrows } = shape

    // Create a placeholder DisplayNode for the node that's being inserted
    const placeholderDisplayNode = new DisplayNode(NaN, NaN, 'placeholder', 'placeholder', NaN)
    this.dataNodeToDisplayNode.set(insertedNode, placeholderDisplayNode)

    const translatedInorderTraversal = this.translateDataNodeArrayToDisplayNodeArray(inorderTraversal, insertedNode, placeholderDisplayNode)
    const translatedLayers = this.translateDataNode2DArrayToDisplayNode2DArray(layers, insertedNode, placeholderDisplayNode)
    const translatedArrows = this.translateDataNode2DArrayToDisplayNode2DArray(arrows, insertedNode, placeholderDisplayNode) as Array<[DisplayNode, DisplayNode]>
    const translatedShape = { inorderTraversal: translatedInorderTraversal, layers: translatedLayers, arrows: translatedArrows }

    const translatedPath = this.translateDataNodeArrayToDisplayNodeArray(path, insertedNode, placeholderDisplayNode)
    return { shapeWithPlaceholder: translatedShape, path: translatedPath, valueToInsert: insertedNode.value, placeholderNode: placeholderDisplayNode }
  }

  private translateDataNodeToDisplayNode (dataNode: DataNode): DisplayNode {
    const displayNode = this.dataNodeToDisplayNode.get(dataNode)
    assert(displayNode !== undefined, 'dataNode not found in map')
    return displayNode
  }

  // Uses the map to translate from DataNode to DisplayNode unless the DataNode is the recently inserted node
  private translateDataNodeArrayToDisplayNodeArray (dataNodes: DataNode[], insertedDataNode: DataNode, placeholderDisplayNode: DisplayNode): DisplayNode[] {
    return dataNodes.map((dataNode) => dataNode === insertedDataNode ? placeholderDisplayNode : this.translateDataNodeToDisplayNode(dataNode))
  }

  private translateDataNode2DArrayToDisplayNode2DArray (dataNodes: DataNode[][], insertedDataNode: DataNode, placeholderDisplayNode: DisplayNode): DisplayNode[][] {
    return dataNodes.map((dataNodeArray) => this.translateDataNodeArrayToDisplayNodeArray(dataNodeArray, insertedDataNode, placeholderDisplayNode))
  }

  // Call BSTView.animate(), a recursive function that uses requestAnimationFrame
  public animate (): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const context = canvas.getContext('2d')
    if (context == null) {
      throw new Error('context is null')
    }
    this.view.animate(canvas, context)
  }

  public setAnimationSpeed (speedSetting: number): void {
    this.view.setAnimationSpeed(speedSetting)
  }
}
