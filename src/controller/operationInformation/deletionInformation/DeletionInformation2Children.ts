import type DeletionInformationBase from './DeletionInformationBase'
import type PathInstruction from '../../PathInstruction'
import type SuccessorSecondaryDescription from '../../secondaryDescription/SuccessorSecondaryDescription'
import type TreeShape from '../../TreeShape'

// The info the model sends to the controller when a node with 2 children is deleted
export default interface DeletionInformation2Children<T> extends DeletionInformationBase<T> {
  type: '2Children'
  shape: TreeShape<T>
  victimNode: T
  pathToSuccessor: Array<PathInstruction<T, SuccessorSecondaryDescription>>
  successorNode: T
}
