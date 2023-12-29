import type DisplayNode from './DisplayNode'

export default interface Tree {
  insert: (value: number) => void
  delete: (value: number) => boolean
  find: (value: number) => DisplayNode | null
}
