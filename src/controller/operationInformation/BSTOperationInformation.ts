import type DataNode from '../../model/DataNode'
import type DisplayNode from '../../view/DisplayNode'
import type BSTPathInstruction from '../pathInstruction/BSTPathInstruction'
import type BSTFindSecondaryDescription from '../secondaryDescription/BSTFindSecondaryDescription'
import type BSTInsertionSecondaryDescription from '../secondaryDescription/BSTInsertionSecondaryDescription'

export default interface BSTOperationInformation<T extends DataNode | DisplayNode> {
  path: Array<BSTPathInstruction<T, BSTInsertionSecondaryDescription | BSTFindSecondaryDescription>>
}
