import type AVLModel from '../model/AVLModel'
import type DataNode from '../model/DataNode'
import type AVLView from '../view/AVLView'
import type DisplayNode from '../view/DisplayNode'
import TreeView from '../view/TreeView'
import BSTController from './BSTController'
import type TreeShape from './TreeShape'
import type AVLInsertionInformation from './operationInformation/AVLInsertionInformation'
import type RotationPathInstruction from './pathInstruction/RotationPathInstruction'

export default class AVLController extends BSTController {
  protected readonly model: AVLModel
  protected readonly view: AVLView

  public constructor (model: AVLModel, view: AVLView) {
    super(model, view)
  }

  public insert (value: number): void {
    const { insertionInformation: modelInsertionInformation, insertedNode: insertedDataNode } = this.model.insert(value)
    // A placeholder DisplayNode for the node that's being inserted. The view will update this upon insertion.
    const placeholderDisplayNode = TreeView.makePlaceholderNode()
    this.dataNodeToDisplayNode.set(insertedDataNode, placeholderDisplayNode)
    const viewInsertionInformation = this.translateInsertionInformation(modelInsertionInformation)
    this.view.insert(viewInsertionInformation)
  }

  protected translateInsertionInformation (modelInsertionInformation: AVLInsertionInformation<DataNode>): AVLInsertionInformation<DisplayNode> {
    const { shape, path, value, rotationPath } = modelInsertionInformation
    const { shape: translatedShape, path: translatedPath } = super.translateInsertionInformation({ shape, path, value })
    const translatedRotationPath = this.translateRotationPath(rotationPath)
    return { shape: translatedShape, path: translatedPath, value, rotationPath: translatedRotationPath }
  }

  private translateRotationPath (rotationPath: Array<RotationPathInstruction<DataNode>>): Array<RotationPathInstruction<DisplayNode>> {
    return rotationPath.map((rotationPathInstruction) => this.translateRotationPathInstruction(rotationPathInstruction))
  }

  private translateRotationPathInstruction (rotationPathInstruction: RotationPathInstruction<DataNode>): RotationPathInstruction<DisplayNode> {
    const { node, shapesAfterRotation, secondaryDescription } = rotationPathInstruction
    return { node: this.translateNode(node), shapesAfterRotation: this.translateShapesAfterRotation(shapesAfterRotation), secondaryDescription }
  }

  private translateShapesAfterRotation (shapesAfterRotation: [] | [TreeShape<DataNode>] | [TreeShape<DataNode>, TreeShape<DataNode>]): [] | [TreeShape<DisplayNode>] | [TreeShape<DisplayNode>, TreeShape<DisplayNode>] {
    return shapesAfterRotation.map((shape: TreeShape<DataNode>) => this.translateShape(shape)) as [] | [TreeShape<DisplayNode>] | [TreeShape<DisplayNode>, TreeShape<DisplayNode>]
  }
}