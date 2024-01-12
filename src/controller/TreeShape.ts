// All the information needed to draw the tree
export default interface TreeShape<T> {
  inorderTraversal: T[];
  layers: T[][];
  arrows: Set<[T, T]>;
}
