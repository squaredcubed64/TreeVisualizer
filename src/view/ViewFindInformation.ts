import type DisplayNode from './DisplayNode'

export default interface ViewFindInformation {
  path: DisplayNode[]
  nodeFound: DisplayNode | null
}
