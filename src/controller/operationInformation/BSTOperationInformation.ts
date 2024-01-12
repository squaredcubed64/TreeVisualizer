import type DataNode from '../../model/DataNode'
import type DisplayNode from '../../view/DisplayNode'
import type BSTPathInstruction from '../pathInstruction/BSTPathInstruction'
import type BSTFindSecondaryDescription from '../secondaryDescription/BSTFindSecondaryDescription'
import type BSTInsertionSecondaryDescription from '../secondaryDescription/BSTInsertionSecondaryDescription'

export default interface BSTOperationInformation<T extends DataNode | DisplayNode> {
  // TODO have insert() include the node that was inserted
  /**
   * The nodes that were visited during the operation. Starts with the root node and ends with the target node.
   */
  pathFromRootToTarget: Array<BSTPathInstruction<T, BSTInsertionSecondaryDescription | BSTFindSecondaryDescription>>
}
