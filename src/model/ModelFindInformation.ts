import type DataNode from './DataNode'

export default interface ModelFindInformation {
  path: DataNode[]
  nodeFound: DataNode | null
}
