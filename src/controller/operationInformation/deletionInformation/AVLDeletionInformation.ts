import type DataNode from '../../../model/DataNode'
import type DisplayNode from '../../../view/DisplayNode'
import type RotationPathInstruction from '../../pathInstruction/RotationPathInstruction'
import type BSTDeletionInformation from './BSTDeletionInformation'

type AVLDeletionInformation<T extends DataNode | DisplayNode> = BSTDeletionInformation<T> & {
  rotationPath: Array<RotationPathInstruction<T>>
}

export default AVLDeletionInformation
