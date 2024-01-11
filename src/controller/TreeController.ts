import { assert } from '../Utils'
import type DataNode from '../model/DataNode'
import type TreeModel from '../model/TreeModel'
import type DisplayNode from '../view/DisplayNode'
import TreeView from '../view/TreeView'

export default abstract class TreeController {
  protected readonly dataNodeToDisplayNode = new Map<DataNode, DisplayNode>()
  protected readonly model: TreeModel
  protected readonly view: TreeView

  public constructor (model: TreeModel, view: TreeView) {
    this.model = model
    this.view = view
  }

  public static centerTree (canvasWidth: number): void {
    TreeView.centerTree(canvasWidth)
  }

  public setAnimationSpeedSetting (animationSpeedSetting: number): void {
    this.view.setAnimationSpeedSetting(animationSpeedSetting)
  }

  public getAnimationSpeedSetting (): number {
    return this.view.getAnimationSpeedSetting()
  }

  /**
   * Call TreeView.animate(), a recursive function that uses requestAnimationFrame()
   */
  public animate (): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const context = canvas.getContext('2d')
    assert(context !== null, 'context is null')
    this.view.animate(canvas, context)
  }

  public stopAnimation (): void {
    this.view.stopAnimation()
  }
}
