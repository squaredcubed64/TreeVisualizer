import BSTModel from './model/BSTModel'
import { ArrowDirection } from './controller/ArrowDirection'
import { resizeCanvas } from './view/Utils'
import BSTView from './view/BSTView'
import BSTController from './controller/BSTController'
import { assert } from './Utils'

// Make canvas fill the screen
const canvas = document.getElementById('canvas') as HTMLCanvasElement
window.addEventListener('resize', () => {
  resizeCanvas(canvas)
})
resizeCanvas(canvas)

// Initialize controller
function makeBSTController (): BSTController {
  return new BSTController(new BSTModel(), new BSTView())
}
let controller = makeBSTController()

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
  controller.insert(value)
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
  controller.delete(value)
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
  controller.find(value)
})

const clearButton = document.getElementById('clearButton') as HTMLButtonElement
if (clearButton == null) {
  throw new Error('clearButton not found')
}
clearButton.addEventListener('click', () => {
  const animationSpeedSetting = controller.getAnimationSpeedSetting()
  const arrowDirection = controller.getArrowDirection()
  controller.stopAnimationPermanently()

  // Clear canvas
  const context = canvas.getContext('2d')
  assert(context !== null, 'context is null')
  context.clearRect(0, 0, canvas.width, canvas.height)

  // Reset controller but keep old animation speed setting and arrow direction
  controller = makeBSTController()
  controller.setAnimationSpeedSetting(animationSpeedSetting)
  controller.setArrowDirection(arrowDirection)
  controller.animate()
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
  controller.setArrowDirection(currentDirection)
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
  controller.setAnimationSpeedSetting(animationSpeedSetting)
})

controller.animate()
