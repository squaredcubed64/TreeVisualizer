import type FindSecondaryDescription from '../secondaryDescription/FindSecondaryDescription'
import type OperationInformation from './OperationInformation'
import type PathInstruction from '../PathInstruction'

export default interface FindInformation<T> extends OperationInformation<T> {
  path: Array<PathInstruction<T, FindSecondaryDescription>>
  nodeFound: T | null
}
