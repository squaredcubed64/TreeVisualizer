import type PathInstruction from './PathInstruction'
import type FindSecondaryDescription from './FindSecondaryDescription'
import type InsertionSecondaryDescription from './InsertionSecondaryDescription'

export default interface OperationInformation<T> {
  path: Array<PathInstruction<T, InsertionSecondaryDescription | FindSecondaryDescription>>
}
