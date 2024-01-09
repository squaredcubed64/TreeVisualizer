import type DeletionInformation from './DeletionInformation'
import type PathInstruction from './PathInstruction'
import type TreeShape from './TreeShape'

// The info the model sends to the controller when a node with 2 children is deleted
export default interface DeletionInformation2Children<T> extends DeletionInformation<T> {
  type: '2Children'
  shape: TreeShape<T>
  victimNode: T
  pathToSuccessor: Array<PathInstruction<T>>
  successorNode: T
}
