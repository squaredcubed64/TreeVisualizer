import type OperationInformation from './OperationInformation'
import type TreeShape from './TreeShape'

// The info the model sends to the controller when a node is inserted
export default interface InsertionInformation<T> extends OperationInformation<T> {
  shape: TreeShape<T>
  value: number
}
