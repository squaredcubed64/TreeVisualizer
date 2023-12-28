import TreeNode from "./TreeNode.js";

const TEST_TREE_NODES = [
  new TreeNode(50, 100, 10, "red", "black"),
  new TreeNode(100, 100, 10, "red", "black"),
  new TreeNode(150, 100, 10, "red", "black"),
  new TreeNode(200, 100, 10, "red", "black"),
  new TreeNode(250, 100, 10, "red", "black"),
];

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

TEST_TREE_NODES.forEach((node) => node.moveTo(300, 300));

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  TEST_TREE_NODES.forEach((node) => node.drawAndUpdate(ctx));
  requestAnimationFrame(animate);
}

animate();