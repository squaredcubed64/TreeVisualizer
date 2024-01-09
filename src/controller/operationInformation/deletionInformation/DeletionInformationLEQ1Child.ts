import type DeletionInformationBase from './DeletionInformationBase'
import type TreeShape from '../../TreeShape'
import type DataNode from '../../../model/DataNode'
import type DisplayNode from '../../../view/DisplayNode'

// The info the view gets from the controller when a node with 1 child or less is deleted
export default interface DeletionInformationLEQ1Child<T extends DataNode | DisplayNode> extends DeletionInformationBase<T> {
  type: 'LEQ1Child'
  shape: TreeShape<T>
  victimNode: T
}
