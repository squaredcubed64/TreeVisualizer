import type DisplayNode from './DisplayNode'

export default interface Tree {
  insert: (value: number) => void
  remove: (value: number) => void
  find: (value: number) => DisplayNode | null
}
