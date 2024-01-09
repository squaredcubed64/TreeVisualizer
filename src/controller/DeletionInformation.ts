import type OperationInformation from './OperationInformation'

export default interface DeletionInformation<T> extends OperationInformation<T> {
  type: 'LEQ1Child' | '2Children' | 'VictimNotFound'
}
