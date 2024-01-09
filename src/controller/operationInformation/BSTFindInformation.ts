import type BSTFindSecondaryDescription from '../secondaryDescription/BSTFindSecondaryDescription'
import type BSTOperationInformation from './BSTOperationInformation'
import type PathInstruction from '../PathInstruction'
import type DataNode from '../../model/DataNode'
import type DisplayNode from '../../view/DisplayNode'

export default interface BSTFindInformation<T extends DataNode | DisplayNode> extends BSTOperationInformation<T> {
  path: Array<PathInstruction<T, BSTFindSecondaryDescription>>
  nodeFound: T | null
}
