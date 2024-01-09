import type DataNode from '../../../model/DataNode'
import type DisplayNode from '../../../view/DisplayNode'
import type DeletionInformationBase from './DeletionInformationBase'

// The info the model sends to the controller when the victim node is not found
export default interface DeletionInformationVictimNotFound<T extends DataNode | DisplayNode> extends DeletionInformationBase<T> {
  type: 'VictimNotFound'
  // The shape won't change, so it's not included
}
