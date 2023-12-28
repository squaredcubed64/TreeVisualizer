import BinarySearchTree from './BinarySearchTree'

const tree = new BinarySearchTree()

const insertButton = document.getElementById('insertButton')
if (insertButton == null) {
  throw new Error('insertButton not found')
}
insertButton.addEventListener('click', () => {
  const insertInput = document.getElementById('insertInput') as HTMLInputElement
  const value = parseInt(insertInput.value)
  tree.insert(value)
})

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')
if (context == null) {
  throw new Error('context is null')
}
tree.animate(canvas, context)
