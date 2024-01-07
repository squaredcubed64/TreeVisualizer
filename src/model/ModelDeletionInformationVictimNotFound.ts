import type DataNode from './DataNode'

// The info the model sends to the controller when the victim node is not found
export default interface ModelDeletionInformationVictimNotFound {
  type: 'VictimNotFound'
  // The shape won't change, so it's not included
  path: DataNode[]
}
