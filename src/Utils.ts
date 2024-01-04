// Curves that start at 0, 0 and go to 1, 1
export const motionCurve = (progress: number): number => {
  if (progress < 0 || progress > 1) {
    throw new Error('progress must be between 0 and 1')
  }
  return progress * progress * (3 - 2 * progress)
}
export const radiusGrowthCurve = (progress: number): number => {
  if (progress < 0 || progress > 1) {
    throw new Error('progress must be between 0 and 1')
  }
  return progress * progress * (3 - 2 * progress)
}
// Curve that starts at 1, 1 and goes to 0, 0
export const radiusShrinkingCurve = (progress: number): number => {
  if (progress < 0 || progress > 1) {
    throw new Error('progress must be between 0 and 1')
  }
  return 1 - progress * progress * (3 - 2 * progress)
}

export const resizeCanvas = (canvas: HTMLCanvasElement): void => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
