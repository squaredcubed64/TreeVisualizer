import type DataNode from '../../model/DataNode'
import type DisplayNode from '../../view/DisplayNode'
import type PathInstruction from '../PathInstruction'
import type FindSecondaryDescription from '../secondaryDescription/FindSecondaryDescription'
import type InsertionSecondaryDescription from '../secondaryDescription/InsertionSecondaryDescription'

export default interface OperationInformation<T extends DataNode | DisplayNode> {
  path: Array<PathInstruction<T, InsertionSecondaryDescription | FindSecondaryDescription>>
}
