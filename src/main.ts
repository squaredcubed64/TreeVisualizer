import BinarySearchTree, { ArrowDirection } from './BinarySearchTree'

const tree = new BinarySearchTree()

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
  tree.clear()
})

const arrowButton = document.getElementById('arrowButton') as HTMLButtonElement
const arrowDirections = [ArrowDirection.PARENT_TO_CHILD, ArrowDirection.PREORDER, ArrowDirection.INORDER, ArrowDirection.POSTORDER]
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

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')
if (context == null) {
  throw new Error('context is null')
}
tree.animate(canvas, context)
