import type InsertionSecondaryDescription from '../secondaryDescription/InsertionSecondaryDescription'
import type OperationInformation from './OperationInformation'
import type PathInstruction from '../PathInstruction'
import type TreeShape from '../TreeShape'

// The info the model sends to the controller when a node is inserted
export default interface InsertionInformation<T> extends OperationInformation<T> {
  path: Array<PathInstruction<T, InsertionSecondaryDescription>>
  shape: TreeShape<T>
  value: number
}
