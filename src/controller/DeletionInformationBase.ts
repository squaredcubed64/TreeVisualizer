import type FindSecondaryDescription from './FindSecondaryDescription'
import type OperationInformation from './OperationInformation'
import type PathInstruction from './PathInstruction'

export default interface DeletionInformationBase<T> extends OperationInformation<T> {
  type: string
  path: Array<PathInstruction<T, FindSecondaryDescription>>
}
