import type PathInstruction from '../PathInstruction'
import type FindSecondaryDescription from '../secondaryDescription/FindSecondaryDescription'
import type InsertionSecondaryDescription from '../secondaryDescription/InsertionSecondaryDescription'

export default interface OperationInformation<T> {
  path: Array<PathInstruction<T, InsertionSecondaryDescription | FindSecondaryDescription>>
}
