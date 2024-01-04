// Node constants
export const MOVE_DURATION_FRAMES = 150
export const HIGHLIGHT_DURATION_FRAMES = 60
export const DEFAULT_HIGHLIGHT_COLOR = 'blue'
export const BORDER_WIDTH = 1
export const HIGHLIGHT_WIDTH = 5
export const GROW_DURATION_FRAMES = 30
export const TEXT_COLOR = 'red'
export const TEXT_FONT = '16px Arial'
export const TEXT_Y_OFFSET = 2
export const SHRINK_DURATION_FRAMES = 60
export const MIN_RADIUS_TO_DRAW_TEXT = 10
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

// Tree constants
export function resizeCanvas (canvas: HTMLCanvasElement): void {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
const canvas = document.getElementById('canvas') as HTMLCanvasElement
resizeCanvas(canvas)
export const ROOT_TARGET_X = canvas.width / 2
export const ROOT_TARGET_Y = 50
export const TARGET_X_GAP = 75
export const TARGET_Y_GAP = 75
export const MAX_RADIUS = 30
export const FILL_COLOR = 'pink'
export const STROKE_COLOR = 'red'
export const ARROW_HEAD_ANGLE = Math.PI / 6
export const ARROW_HEAD_LENGTH = 10
export const ARROW_LINE_WIDTH = 2
export const FRAMES_BETWEEN_HIGHLIGHTS = 60
export const FRAMES_BEFORE_FIRST_HIGHLIGHT = 60
export const FRAMES_AFTER_LAST_HIGHLIGHT = 60
export const FRAMES_AFTER_SHRINK = 60
export const FRAMES_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN = 60
export const FRAMES_BEFORE_HIGHLIGHT_SUCCESSOR = 60
export const FRAMES_BEFORE_REPLACE_WITH_SUCCESSOR = 60
export const FRAMES_BEFORE_UNHIGHLIGHT_VICTIM = 60
export const FIND_SUCCESSOR_HIGHLIGHT_COLOR = 'green'
export const HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND = 'green'
export const HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES = 60
export const FRAMES_AFTER_FIND = 0
export enum INSERTION_DESCRIPTIONS {
  FIND_WHERE_TO_INSERT = 'Find where to insert the new node.',
  INSERT_NEW_NODE = 'Insert the new node.'
}
export enum DELETION_DESCRIPTIONS {
  FIND_NODE_TO_DELETE = 'Find the node to delete.',
  DELETE_NODE = 'Delete the node.',
  // These are for the case where the victim node has two children.
  FIND_SUCCESSOR = 'Find the successor of the node to set the node\'s value to.',
  REPLACE_NODE_WITH_SUCCESSOR = 'Replace the node\'s value with its successor.',
  DELETE_SUCCESSOR = 'Delete the successor node.'
}
export enum FIND_DESCRIPTIONS {
  FIND_NODE = 'Find the node.',
  FOUND_NODE = 'Found the node.',
  DID_NOT_FIND_NODE = 'Did not find the node.'
}
// How arrows are rendered
export enum ArrowDirection {
  PARENT_TO_CHILD,
  PREORDER,
  INORDER,
  POSTORDER
}
