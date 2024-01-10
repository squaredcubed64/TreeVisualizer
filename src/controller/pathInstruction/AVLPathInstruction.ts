import type DataNode from '../../model/DataNode'
import type DisplayNode from '../../view/DisplayNode'
import type TreeShape from '../TreeShape'
import type AVLSecondaryDescription from '../secondaryDescription/AVLSecondaryDescription'

export default interface AVLPathInstruction<T extends DataNode | DisplayNode> {
  node: T
  /**
   * An empty array means no rotation. A single element array means a single rotation. A two element array means a double rotation.
   */
  shapesAfterRotation: [] | [TreeShape<T>] | [TreeShape<T>, TreeShape<T>]
  secondaryDescription: AVLSecondaryDescription
}
