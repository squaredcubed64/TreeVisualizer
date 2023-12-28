import BinarySearchTree from "./BinarySearchTree";

const tree = new BinarySearchTree();

const insertButton = document.getElementById("insertButton");
insertButton.addEventListener("click", () => {
  const insertInput = document.getElementById("insertInput") as HTMLInputElement;
  const value = parseInt(insertInput.value);
  tree.insert(value);
});

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d");
tree.animate(canvas, context);