import BinarySearchTree, { ArrowDirection } from './BinarySearchTree'

const tree = new BinarySearchTree()

const insertButton = document.getElementById('insertButton')
if (insertButton == null) {
  throw new Error('insertButton not found')
}
insertButton.addEventListener('click', () => {
  const insertInput = document.getElementById('insertInput')
  if (!(insertInput instanceof HTMLInputElement)) {
    throw new Error('insertInput must be an HTMLInputElement')
  }
  const value = parseInt(insertInput.value)
  if (isNaN(value)) {
    throw new Error('value must be a number')
  }
  tree.insert(value)
})

const deleteButton = document.getElementById('deleteButton')
if (deleteButton == null) {
  throw new Error('deleteButton not found')
}
deleteButton.addEventListener('click', () => {
  const deleteInput = document.getElementById('deleteInput')
  if (!(deleteInput instanceof HTMLInputElement)) {
    throw new Error('deleteInput must be an HTMLInputElement')
  }
  const value = parseInt(deleteInput.value)
  if (isNaN(value)) {
    throw new Error('value must be a number')
  }
  tree.delete(value)
})

const findButton = document.getElementById('findButton')
if (findButton == null) {
  throw new Error('findButton not found')
}
findButton.addEventListener('click', () => {
  const findInput = document.getElementById('findInput')
  if (!(findInput instanceof HTMLInputElement)) {
    throw new Error('findInput must be an HTMLInputElement')
  }
  const value = parseInt(findInput.value)
  if (isNaN(value)) {
    throw new Error('value must be a number')
  }
  tree.find(value)
})

const clearButton = document.getElementById('clearButton')
if (clearButton == null) {
  throw new Error('clearButton not found')
}
clearButton.addEventListener('click', () => {
  tree.clear()
})

const arrowDirections = [ArrowDirection.PARENT_TO_CHILD, ArrowDirection.PREORDER, ArrowDirection.INORDER, ArrowDirection.POSTORDER]
const arrowTexts = ['Parent to Child', 'Preorder', 'Inorder', 'Postorder']
let currentDirectionIndex = 0
const arrowButton = document.getElementById('arrowButton')
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
