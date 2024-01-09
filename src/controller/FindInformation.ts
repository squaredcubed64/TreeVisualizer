import type OperationInformation from './OperationInformation'

export default interface FindInformation<T> extends OperationInformation<T> {
  nodeFound: T | null
}
