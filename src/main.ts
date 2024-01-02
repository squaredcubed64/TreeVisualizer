import BinarySearchTree from './BinarySearchTree'
import { ArrowDirection } from './constants'
import type Tree from './Tree'

// Make canvas fill the screen
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')
export function resizeCanvas (canvas: HTMLCanvasElement): void {
  const parent = canvas.parentElement
  if (parent == null) {
    throw new Error('canvas parent element not found')
  }
  const { width, height } = parent.getBoundingClientRect()
  canvas.width = width
  canvas.height = height
}
window.addEventListener('resize', () => {
  resizeCanvas(canvas)
})
resizeCanvas(canvas)

let tree: Tree = new BinarySearchTree()

// Attach tree operations to HTML elements insertButton, deleteButton, findButton, clearButton, arrowButton, and animationSpeedBar
const insertButton = document.getElementById('insertButton') as HTMLButtonElement
const insertInput = document.getElementById('insertInput') as HTMLInputElement
if (insertButton == null) {
  throw new Error('insertButton not found')
}
insertButton.addEventListener('click', () => {
  const value = parseInt(insertInput.value)
  if (isNaN(value)) {
    throw new Error('value must be a number')
  }
  tree.insert(value)
})

const deleteButton = document.getElementById('deleteButton') as HTMLButtonElement
const deleteInput = document.getElementById('deleteInput') as HTMLInputElement
if (deleteButton == null) {
  throw new Error('deleteButton not found')
}
deleteButton.addEventListener('click', () => {
  const value = parseInt(deleteInput.value)
  if (isNaN(value)) {
    throw new Error('value must be a number')
  }
  tree.delete(value)
})

const findButton = document.getElementById('findButton') as HTMLButtonElement
const findInput = document.getElementById('findInput') as HTMLInputElement
if (findButton == null) {
  throw new Error('findButton not found')
}
findButton.addEventListener('click', () => {
  const value = parseInt(findInput.value)
  if (isNaN(value)) {
    throw new Error('value must be a number')
  }
  tree.find(value)
})

const clearButton = document.getElementById('clearButton') as HTMLButtonElement
if (clearButton == null) {
  throw new Error('clearButton not found')
}
clearButton.addEventListener('click', () => {
  tree.stopAnimationPermanently()
  tree = new BinarySearchTree()
  animateTree(tree)
})

const arrowButton = document.getElementById('arrowButton') as HTMLButtonElement
const arrowDirections: ArrowDirection[] = [ArrowDirection.PARENT_TO_CHILD, ArrowDirection.PREORDER, ArrowDirection.INORDER, ArrowDirection.POSTORDER]
const arrowTexts = ['Parent to Child', 'Preorder', 'Inorder', 'Postorder']
let currentDirectionIndex = 0
if (arrowButton == null) {
  throw new Error('arrowButton not found')
}
arrowButton.addEventListener('click', () => {
  currentDirectionIndex = (currentDirectionIndex + 1) % arrowDirections.length
  const currentDirection = arrowDirections[currentDirectionIndex]
  const currentText = 'Arrows: ' + arrowTexts[currentDirectionIndex]
  arrowButton.textContent = currentText
  tree.setArrowDirection(currentDirection)
})

const animationSpeedBar = document.getElementById('animationSpeedBar') as HTMLInputElement
if (animationSpeedBar == null) {
  throw new Error('speedBar not found')
}
animationSpeedBar.addEventListener('input', () => {
  const animationSpeedSetting = parseInt(animationSpeedBar.value)
  if (isNaN(animationSpeedSetting)) {
    throw new Error('speed must be a number')
  }
  tree.setAnimationSpeed(animationSpeedSetting)
})

function animateTree (tree: Tree): void {
  if (context == null) {
    throw new Error('context is null')
  }
  tree.animate(canvas, context)
}
animateTree(tree)
