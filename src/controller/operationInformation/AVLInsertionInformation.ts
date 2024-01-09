import type BSTOperationInformation from './BSTOperationInformation'
import type PathInstruction from '../PathInstruction'
import type DisplayNode from '../../view/DisplayNode'
import type DataNode from '../../model/DataNode'

// The info the model sends to the controller when a node is inserted
export default interface AVLInsertionInformation<T extends DataNode | DisplayNode> {
  bstOperationInformation: BSTOperationInformation<T>
  // TODO check if this jsdoc is accurate
  /**
   * The path along which the AVL tree updates heights and rotates. It starts where the node is inserted and ends at the root.
   */
  rotationPath: Array<PathInstruction<T, AVLSecondaryDescription>>
}
