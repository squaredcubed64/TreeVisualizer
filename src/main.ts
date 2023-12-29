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

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')
if (context == null) {
  throw new Error('context is null')
}
tree.animate(canvas, context)
