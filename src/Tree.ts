export default interface Tree {
  insert: (value: number) => void
  delete: (value: number) => void
  find: (value: number) => void
}
