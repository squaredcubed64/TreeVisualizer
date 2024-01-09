import type DataNode from '../model/DataNode'
import type DisplayNode from '../view/DisplayNode'
import type BSTModel from '../model/BSTModel'
import type BSTView from '../view/BSTView'
import { assert } from '../Utils'
import type ArrowDirection from './ArrowDirection'
import type InsertionInformation from './InsertionInformation'
import type PathInstruction from './PathInstruction'
import type DeletionInformationLEQ1Child from './DeletionInformationLEQ1Child'
import type DeletionInformation2Children from './DeletionInformation2Children'
import type FindInformation from './FindInformation'
import type TreeShape from './TreeShape'
import type DeletionInformation from './DeletionInformation'
import type SecondaryDescription from './SecondaryDescription'

export default class BSTController {
  private readonly dataNodeToDisplayNode = new Map<DataNode, DisplayNode>()

  constructor (private readonly model: BSTModel, private readonly view: BSTView) {
    this.dataNodeToDisplayNode = new Map<DataNode, DisplayNode>()
  }

  public insert (value: number): void {
    const [modelInsertionInformation, insertedDataNode] = this.model.insert(value)
    // A placeholder DisplayNode for the node that's being inserted. The view will update this upon insertion.
    const placeholderDisplayNode = this.view.makePlaceholderNode()
    this.dataNodeToDisplayNode.set(insertedDataNode, placeholderDisplayNode)
    const viewInsertionInformation = this.translateInsertionInformation(modelInsertionInformation)
    this.view.insert(viewInsertionInformation)
  }

  private translateInsertionInformation (modelInsertionInformation: InsertionInformation<DataNode>): InsertionInformation<DisplayNode> {
    const { shape, path, value } = modelInsertionInformation
    const translatedShape = this.translateShape(shape)
    const translatedPath = this.translatePath(path)
    return { shape: translatedShape, path: translatedPath, value }
  }

  public delete (value: number): void {
    const modelDeletionInformation = this.model.delete(value)
    const viewDeletionInformation = this.translateDeletionInformation(modelDeletionInformation)
    this.view.delete(viewDeletionInformation)
  }

  private translateDeletionInformation (modelDeletionInformation: DeletionInformation<DataNode>): DeletionInformation<DisplayNode> {
    switch (modelDeletionInformation.type) {
      case 'LEQ1Child': {
        const { shape, path, victimNode } = modelDeletionInformation
        const viewDeletionInformation: DeletionInformationLEQ1Child<DisplayNode> = { type: 'LEQ1Child', shape: this.translateShape(shape), path: this.translatePath(path), victimNode: this.translateNode(victimNode) }
        return viewDeletionInformation
      }
      case '2Children': {
        const { shape, path, victimNode, pathToSuccessor, successorNode } = modelDeletionInformation
        const viewDeletionInformation: DeletionInformation2Children<DisplayNode> = { type: '2Children', shape: this.translateShape(shape), path: this.translatePath(path), victimNode: this.translateNode(victimNode), pathToSuccessor: this.translatePath(pathToSuccessor), successorNode: this.translateNode(successorNode) }
        return viewDeletionInformation
      }
      case 'VictimNotFound': {
        const path = modelDeletionInformation.path
        return { type: 'VictimNotFound', path: this.translatePath(path) }
      }
    }
  }

  public find (value: number): void {
    const modelFindInformation = this.model.find(value)
    const viewFindInformation = this.translateFindInformation(modelFindInformation)
    this.view.find(viewFindInformation)
  }

  private translateFindInformation (modelFindInformation: FindInformation<DataNode>): FindInformation<DisplayNode> {
    const { path, nodeFound } = modelFindInformation
    return { path: this.translatePath(path), nodeFound: nodeFound !== null ? this.translateNode(nodeFound) : null }
  }

  private translateNode (dataNode: DataNode): DisplayNode {
    const displayNode = this.dataNodeToDisplayNode.get(dataNode)
    assert(displayNode !== undefined, 'dataNode not found in map')
    return displayNode
  }

  private translateArray (dataNodeArray: DataNode[]): DisplayNode[] {
    return dataNodeArray.map((dataNode: DataNode) => this.translateNode(dataNode))
  }

  private translateLayers (layers: DataNode[][]): DisplayNode[][] {
    return layers.map((layer: DataNode[]) => this.translateArray(layer))
  }

  private translateArrows (arrows: Set<[DataNode, DataNode]>): Set<[DisplayNode, DisplayNode]> {
    return new Set(Array.from(arrows).map((arrow) => this.translateArray(arrow) as [DisplayNode, DisplayNode]))
  }

  private translatePath<S extends SecondaryDescription> (path: Array<PathInstruction<DataNode, S>>): Array<PathInstruction<DisplayNode, S>> {
    return path.map((pathInstruction) => {
      const { node, secondaryDescription } = pathInstruction
      return { node: this.translateNode(node), secondaryDescription }
    })
  }

  private translateShape (shape: TreeShape<DataNode>): TreeShape<DisplayNode> {
    const { inorderTraversal, layers, arrows } = shape
    return { inorderTraversal: this.translateArray(inorderTraversal), layers: this.translateLayers(layers), arrows: this.translateArrows(arrows) }
  }

  /**
   * Call BSTView.animate(), a recursive function that uses requestAnimationFrame()
   */
  public animate (): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const context = canvas.getContext('2d')
    assert(context !== null, 'context is null')
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
    this.view.setArrows(this.translateArrows(this.model.calculateArrows()))
  }

  public getArrowDirection (): ArrowDirection {
    return this.model.arrowDirection
  }
}
