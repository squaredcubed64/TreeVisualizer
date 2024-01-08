import type DataNode from '../model/DataNode'
import DisplayNode from '../view/DisplayNode'
import type BSTModel from '../model/BSTModel'
import type BSTView from '../view/BSTView'
import type ModelInsertionInformation from '../model/ModelInsertionInformation'
import type ViewInsertionInformation from '../view/ViewInsertionInformation'
import { assert } from '../Utils'
import type ModelDeletionInformationLEQ1Child from '../model/ModelDeletionInformationLEQ1Child'
import type ModelDeletionInformation2Children from '../model/ModelDeletionInformation2Children'
import type ModelDeletionInformationVictimNotFound from '../model/ModelDeletionInformationVictimNotFound'
import type ViewDeletionInformationLEQ1Child from '../view/ViewDeletionInformationLEQ1Child'
import type ViewDeletionInformation2Children from '../view/ViewDeletionInformation2Children'
import type ViewDeletionInformationVictimNotFound from '../view/ViewDeletionInformationVictimNotFound'
import type DataTreeShape from '../model/DataTreeShape'
import type DisplayTreeShape from '../view/DisplayTreeShape'
import type ModelFindInformation from '../model/ModelFindInformation'
import type ViewFindInformation from '../view/ViewFindInformation'
import type ArrowDirection from './ArrowDirection'

export default class BSTController {
  private readonly dataNodeToDisplayNode = new Map<DataNode, DisplayNode>()

  constructor (private readonly model: BSTModel, private readonly view: BSTView) {
    this.dataNodeToDisplayNode = new Map<DataNode, DisplayNode>()
  }

  public insert (value: number): void {
    const modelInsertionInformation = this.model.insert(value)
    const viewInsertionInformation = this.translateInsertionInformation(modelInsertionInformation)
    this.view.insert(viewInsertionInformation)
  }

  private translateInsertionInformation (modelInsertionInformation: ModelInsertionInformation): ViewInsertionInformation {
    // Helpers
    const translateNode = (dataNode: DataNode): DisplayNode => {
      const displayNode = this.dataNodeToDisplayNode.get(dataNode)
      assert(displayNode !== undefined, 'dataNode not found in map')
      return displayNode
    }
    // Uses the map to translate from DataNode to DisplayNode unless the DataNode is the recently inserted node
    const translateArray = (dataNodes: DataNode[], insertedDataNode: DataNode, placeholderDisplayNode: DisplayNode): DisplayNode[] => {
      return dataNodes.map((dataNode) => dataNode === insertedDataNode ? placeholderDisplayNode : translateNode(dataNode))
    }
    const translate2DArray = (dataNodes: DataNode[][], insertedDataNode: DataNode, placeholderDisplayNode: DisplayNode): DisplayNode[][] => {
      return dataNodes.map((dataNodeArray) => translateArray(dataNodeArray, insertedDataNode, placeholderDisplayNode))
    }

    // Main logic
    const { shape, path, insertedNode } = modelInsertionInformation
    const { inorderTraversal, layers, arrows } = shape

    // Create a placeholder DisplayNode for the node that's being inserted
    const placeholderDisplayNode = new DisplayNode(NaN, NaN, 'placeholder', 'placeholder', NaN)
    this.dataNodeToDisplayNode.set(insertedNode, placeholderDisplayNode)

    const translatedInorderTraversal = translateArray(inorderTraversal, insertedNode, placeholderDisplayNode)
    const translatedLayers = translate2DArray(layers, insertedNode, placeholderDisplayNode)
    const translatedArrows = translate2DArray(arrows, insertedNode, placeholderDisplayNode) as Array<[DisplayNode, DisplayNode]>
    const translatedShape = { inorderTraversal: translatedInorderTraversal, layers: translatedLayers, arrows: translatedArrows }

    const translatedPath = translateArray(path, insertedNode, placeholderDisplayNode)
    return { shapeWithPlaceholder: translatedShape, path: translatedPath, valueToInsert: insertedNode.value, placeholderNode: placeholderDisplayNode }
  }

  public delete (value: number): void {
    const modelDeletionInformation = this.model.delete(value)
    const viewDeletionInformation = this.translateDeletionInformation(modelDeletionInformation)
    this.view.delete(viewDeletionInformation)
  }

  private translateDeletionInformation (modelDeletionInformation: ModelDeletionInformationLEQ1Child | ModelDeletionInformation2Children | ModelDeletionInformationVictimNotFound): ViewDeletionInformationLEQ1Child | ViewDeletionInformation2Children | ViewDeletionInformationVictimNotFound {
    switch (modelDeletionInformation.type) {
      case 'LEQ1Child': {
        const { shape, path, victimNode } = modelDeletionInformation
        return { type: 'LEQ1Child', shape: this.translateShape(shape), path: this.translateArray(path), victimNode: this.translateNode(victimNode) }
      }
      case '2Children': {
        const { shape, path, victimNode, pathToSuccessor, successorNode } = modelDeletionInformation
        return { type: '2Children', shape: this.translateShape(shape), path: this.translateArray(path), victimNode: this.translateNode(victimNode), pathToSuccessor: this.translateArray(pathToSuccessor), successorNode: this.translateNode(successorNode) }
      }
      case 'VictimNotFound': {
        const path = modelDeletionInformation.path
        return { type: 'VictimNotFound', path: this.translateArray(path) }
      }
    }
  }

  public find (value: number): void {
    const modelFindInformation = this.model.find(value)
    const viewFindInformation = this.translateFindInformation(modelFindInformation)
    this.view.find(viewFindInformation)
  }

  private translateFindInformation (modelFindInformation: ModelFindInformation): ViewFindInformation {
    const { path, nodeFound } = modelFindInformation
    return { path: this.translateArray(path), nodeFound: nodeFound !== null ? this.translateNode(nodeFound) : null }
  }

  // Helpers for translateDeletionInformation and translateFindInformation
  // Note: these do not account for a placeholder, unlike the insertion helpers
  private translateNode (dataNode: DataNode): DisplayNode {
    const displayNode = this.dataNodeToDisplayNode.get(dataNode)
    assert(displayNode !== undefined, 'dataNode not found in map')
    return displayNode
  }

  private translateArray (dataNodeArray: DataNode[]): DisplayNode[] {
    return dataNodeArray.map((dataNode: DataNode) => this.translateNode(dataNode))
  }

  private translate2DArray (dataNode2DArray: DataNode[][]): DisplayNode[][] {
    return dataNode2DArray.map((dataNodeArray: DataNode[]) => this.translateArray(dataNodeArray))
  }

  private translateShape (shape: DataTreeShape): DisplayTreeShape {
    const { inorderTraversal, layers, arrows } = shape
    return { inorderTraversal: this.translateArray(inorderTraversal), layers: this.translate2DArray(layers), arrows: this.translate2DArray(arrows) as Array<[DisplayNode, DisplayNode]> }
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

  public setAnimationSpeedSetting (animationSpeedSetting: number): void {
    this.view.setAnimationSpeedSetting(animationSpeedSetting)
  }

  public getAnimationSpeedSetting (): number {
    return this.view.getAnimationSpeedSetting()
  }

  public stopAnimationPermanently (): void {
    this.view.stopAnimationPermanently()
  }

  public setArrowDirection (arrowDirection: ArrowDirection): void {
    this.model.arrowDirection = arrowDirection
    this.view.setArrows(this.translate2DArray(this.model.calculateArrows()) as Array<[DisplayNode, DisplayNode]>)
  }

  public getArrowDirection (): ArrowDirection {
    return this.model.arrowDirection
  }
}
