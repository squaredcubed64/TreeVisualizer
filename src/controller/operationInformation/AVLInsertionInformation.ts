import type DisplayNode from '../../view/DisplayNode'
import type DataNode from '../../model/DataNode'
import type AVLPathInstruction from '../pathInstruction/AVLPathInstruction'
import type BSTInsertionInformation from './BSTInsertionInformation'

// The info the model sends to the controller when a node is inserted
export default interface AVLInsertionInformation<T extends DataNode | DisplayNode> {
  bstInsertionInformation: BSTInsertionInformation<T>
  // TODO check if this jsdoc is accurate
  /**
   * The path along which the AVL tree updates heights and rotates. It starts where the node is inserted and ends at the root.
   */
  rotationPath: Array<AVLPathInstruction<T>>
}
