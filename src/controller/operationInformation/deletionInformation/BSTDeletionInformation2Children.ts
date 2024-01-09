import type BSTDeletionInformationBase from './BSTDeletionInformationBase'
import type PathInstruction from '../../PathInstruction'
import type BSTSuccessorSecondaryDescription from '../../secondaryDescription/BSTSuccessorSecondaryDescription'
import type TreeShape from '../../TreeShape'
import type DataNode from '../../../model/DataNode'
import type DisplayNode from '../../../view/DisplayNode'

// The info the model sends to the controller when a node with 2 children is deleted
export default interface BSTDeletionInformation2Children<T extends DataNode | DisplayNode> extends BSTDeletionInformationBase<T> {
  type: '2Children'
  shape: TreeShape<T>
  victimNode: T
  pathToSuccessor: Array<PathInstruction<T, BSTSuccessorSecondaryDescription>>
  successorNode: T
}
