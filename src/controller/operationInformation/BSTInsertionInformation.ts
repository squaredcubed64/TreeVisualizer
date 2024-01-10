import type BSTInsertionSecondaryDescription from '../secondaryDescription/BSTInsertionSecondaryDescription'
import type BSTOperationInformation from './BSTOperationInformation'
import type BSTPathInstruction from '../pathInstruction/BSTPathInstruction'
import type TreeShape from '../TreeShape'
import type DisplayNode from '../../view/DisplayNode'
import type DataNode from '../../model/DataNode'

// The info the model sends to the controller when a node is inserted
export default interface BSTInsertionInformation<T extends DataNode | DisplayNode> extends BSTOperationInformation<T> {
  path: Array<BSTPathInstruction<T, BSTInsertionSecondaryDescription>>
  shape: TreeShape<T>
  value: number
}
