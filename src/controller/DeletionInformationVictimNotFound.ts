import type OperationInformation from './OperationInformation'

// The info the model sends to the controller when the victim node is not found
export default interface DeletionInformationVictimNotFound<T> extends OperationInformation<T> {
  type: 'VictimNotFound'
  // The shape won't change, so it's not included
}
