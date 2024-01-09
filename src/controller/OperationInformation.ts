import type PathInstruction from './PathInstruction'

export default interface OperationInformation<T> {
  path: Array<PathInstruction<T>>
}
