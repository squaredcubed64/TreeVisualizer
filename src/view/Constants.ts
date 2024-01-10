// Node constants
export const MOVE_DURATION_FRAMES = 150
export const DEFAULT_HIGHLIGHT_DURATION_FRAMES = 60
export const DEFAULT_HIGHLIGHT_COLOR = 'blue'
export const BORDER_WIDTH = 1
export const HIGHLIGHT_WIDTH = 5
export const GROW_DURATION_FRAMES = 30
export const TEXT_COLOR = 'red'
export const TEXT_FONT = '16px Arial'
export const TEXT_Y_OFFSET = 2
export const SHRINK_DURATION_FRAMES = 60
export const MIN_RADIUS_TO_DRAW_TEXT = 10

// Tree constants
// const canvas = document.getElementById('canvas') as HTMLCanvasElement
// TODO: have this change when the canvas is resized (so it shouldn't be a const)
export const ROOT_TARGET_X = 300 // canvas.width / 2
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
export const FRAMES_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN = 60
export const FRAMES_BEFORE_REPLACE_WITH_SUCCESSOR = 60
export const FRAMES_BEFORE_UNHIGHLIGHT_VICTIM = 60
export const FIND_SUCCESSOR_HIGHLIGHT_COLOR = 'green'
export const FRAMES_AFTER_UNSUCCESSFUL_DELETE = 60

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
  DELETE_SUCCESSOR = 'Delete the successor node.',
  DID_NOT_FIND_NODE = 'Did not find the node.'
}
export enum FIND_DESCRIPTIONS {
  FIND_NODE = 'Find the node.',
  FOUND_NODE = 'Found the node.',
  DID_NOT_FIND_NODE = 'Did not find the node.'
}
export const ROTATION_PATH_DESCRIPTION = 'Go back up the tree, rotating nodes as necessary to maintain the AVL property.'

export const ROTATION_PATH_HIGHLIGHT_COLOR = 'red'
export const FRAMES_AFTER_ROTATION = 60
