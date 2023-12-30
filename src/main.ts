import BinarySearchTree from './BinarySearchTree'

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

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')
if (context == null) {
  throw new Error('context is null')
}
tree.animate(canvas, context)
