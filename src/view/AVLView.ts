import type TreeShape from '../controller/TreeShape'
import type AVLInsertionInformation from '../controller/operationInformation/AVLInsertionInformation'
import type RotationPathInstruction from '../controller/pathInstruction/RotationPathInstruction'
import type RotationSecondaryDescription from '../controller/secondaryDescription/RotationSecondaryDescription'
import BSTView from './BSTView'
import { FRAMES_AFTER_ROTATION, FRAMES_BETWEEN_HIGHLIGHTS, MOVE_DURATION_FRAMES, ROTATION_PATH_DESCRIPTION, ROTATION_PATH_HIGHLIGHT_COLOR } from './Constants'
import type DisplayNode from './DisplayNode'

export default class AVLView extends BSTView {
  public insert (viewInsertionInformation: AVLInsertionInformation<DisplayNode>): void {
    const { path, shape, value, rotationPath } = viewInsertionInformation
    super.insert({ path, shape, value })
    this.pushRotationPathOntoFunctionQueue(rotationPath)
  }

  private pushRotationPathOntoFunctionQueue (rotationPath: Array<RotationPathInstruction<DisplayNode>>): void {
    // Helper
    const pushRotationOntoFunctionQueue = (shapeAfterRotation: TreeShape<DisplayNode>, secondaryDescription: string): void => {
      this.functionQueue.push({
        framesToWait: 0,
        function: () => {
          this.animateShapeChange(shapeAfterRotation)
          return { framesAfterCall: MOVE_DURATION_FRAMES + FRAMES_AFTER_ROTATION, description: ROTATION_PATH_DESCRIPTION, secondaryDescription }
        }
      })
    }
    for (const rotationPathInstruction of rotationPath) {
      const { node, shapesAfterRotation, secondaryDescription } = rotationPathInstruction

      // Highlight the node and explain if a rotation must be performed and why
      this.functionQueue.push({
        framesToWait: FRAMES_BETWEEN_HIGHLIGHTS,
        function: () => {
          node.highlight(ROTATION_PATH_HIGHLIGHT_COLOR, Infinity)
          return { framesAfterCall: 0, description: ROTATION_PATH_DESCRIPTION, secondaryDescription: this.convertRotationSecondaryDescriptionToString(secondaryDescription) }
        }
      })

      // Animate the rotation(s)
      if (shapesAfterRotation.length !== 0) {
        pushRotationOntoFunctionQueue(shapesAfterRotation[0], 'First rotation')
      }
      if (shapesAfterRotation.length === 2) {
        pushRotationOntoFunctionQueue(shapesAfterRotation[1], 'Second rotation')
      }
    }
  }

  private convertRotationSecondaryDescriptionToString (secondaryDescription: RotationSecondaryDescription): string {
    const { leftHeight, rightHeight, newHeight, newBalanceFactor } = secondaryDescription
    let out = ''
    out += `The node's height is Max(${leftHeight}, ${rightHeight}) + 1 = ${newHeight}. The node's balance factor is ${leftHeight} - ${rightHeight} = ${newBalanceFactor}. `
    if (newBalanceFactor < -1) {
      out += 'Rotate because balance factor < -1'
    } else if (newBalanceFactor > 1) {
      out += 'Rotate because balance factor > 1'
    } else {
      out += 'Do not rotate because balance factor is between -1 and 1'
    }
    return out
  }
}
