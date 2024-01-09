import type DataNode from '../../model/DataNode'
import type DisplayNode from '../../view/DisplayNode'
import type PathInstruction from '../PathInstruction'
import type BSTFindSecondaryDescription from '../secondaryDescription/BSTFindSecondaryDescription'
import type BSTInsertionSecondaryDescription from '../secondaryDescription/BSTInsertionSecondaryDescription'

export default interface BSTOperationInformation<T extends DataNode | DisplayNode> {
  path: Array<PathInstruction<T, BSTInsertionSecondaryDescription | BSTFindSecondaryDescription>>
}
