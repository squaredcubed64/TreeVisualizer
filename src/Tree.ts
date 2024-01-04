import type { ArrowDirection } from './Constants'

export default interface Tree {
  insert: (value: number) => void
  delete: (value: number) => void
  find: (value: number) => void
  setArrowDirection: (arrowDirection: ArrowDirection) => void
  animate: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => void
  stopAnimationPermanently: () => void
  setAnimationSpeed: (speedSetting: number) => void
}
