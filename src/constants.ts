export const MOVE_DURATION_FRAMES = 150
export const HIGHLIGHT_DURATION_FRAMES = 60
export const HIGHLIGHT_COLOR = 'blue'
export const BORDER_WIDTH = 1
export const HIGHLIGHT_WIDTH = 5
export const GROW_DURATION_FRAMES = 30
export const TEXT_COLOR = 'black'
export const TEXT_FONT = '16px Arial'
export const TEXT_Y_OFFSET = 2
export const SHRINK_DURATION_FRAMES = 30

export const ROOT_TARGET_X = 400
export const ROOT_TARGET_Y = 50
export const TARGET_X_GAP = 100
export const TARGET_Y_GAP = 100
export const MAX_RADIUS = 10
export const FILL_COLOR = 'red'
export const STROKE_COLOR = 'black'
export const ARROW_HEAD_ANGLE = Math.PI / 6
export const ARROW_HEAD_LENGTH = 10
export const ARROW_LINE_WIDTH = 2
export const FRAMES_BETWEEN_HIGHLIGHTS = 60
export const FRAMES_BEFORE_FIRST_HIGHLIGHT = 60
export const FRAMES_AFTER_LAST_HIGHLIGHT = 60
export const FRAMES_AFTER_SHRINK = 0
export const TOTAL_HIGHLIGHT_DURATION_FRAMES = (numNodesToHighlight: number): number => FRAMES_BEFORE_FIRST_HIGHLIGHT + (numNodesToHighlight - 1) * FRAMES_BETWEEN_HIGHLIGHTS + (numNodesToHighlight) * HIGHLIGHT_DURATION_FRAMES + FRAMES_AFTER_LAST_HIGHLIGHT
