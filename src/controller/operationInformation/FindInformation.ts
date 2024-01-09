import type FindSecondaryDescription from '../secondaryDescription/FindSecondaryDescription'
import type OperationInformation from './OperationInformation'
import type PathInstruction from '../PathInstruction'
import type DataNode from '../../model/DataNode'
import type DisplayNode from '../../view/DisplayNode'

export default interface FindInformation<T extends DataNode | DisplayNode> extends OperationInformation<T> {
  path: Array<PathInstruction<T, FindSecondaryDescription>>
  nodeFound: T | null
}
