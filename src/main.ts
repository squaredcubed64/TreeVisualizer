import ArrowDirection from "./controller/ArrowDirection";
import BSTController from "./controller/BSTController";
import { assert } from "./Utils";
import AVLController from "./controller/AVLController";

// Make canvas fill the screen
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
window.addEventListener("resize", () => {
  resizeCanvas(canvas);
  BSTController.centerTree(canvas.width);
});
resizeCanvas(canvas);
BSTController.centerTree(canvas.width);

// Helpers
function resizeCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Initialize controller
let controller: BSTController = new BSTController();
let treeType = BSTController;
function setControllerToNew<T extends BSTController>(
  ControllerType: new (...args: any[]) => T,
): void {
  controller = new ControllerType();
}
setControllerToNew(treeType);
controller.animate();

// Attach controller's insert() to insertButton
const insertButton = document.getElementById(
  "insertButton",
) as HTMLButtonElement;
const insertInput = document.getElementById("insertInput") as HTMLInputElement;
assert(insertButton !== null, "insertButton not found");
insertButton.addEventListener("click", () => {
  const value = parseInt(insertInput.value);
  assert(!isNaN(value), "value must be a number");
  controller.insert(value);
});

// Attach controller's delete() to deleteButton
const deleteButton = document.getElementById(
  "deleteButton",
) as HTMLButtonElement;
const deleteInput = document.getElementById("deleteInput") as HTMLInputElement;
assert(deleteButton !== null, "deleteButton not found");
deleteButton.addEventListener("click", () => {
  const value = parseInt(deleteInput.value);
  assert(!isNaN(value), "value must be a number");
  controller.delete(value);
});

// Attach controller's find() to findButton
const findButton = document.getElementById("findButton") as HTMLButtonElement;
const findInput = document.getElementById("findInput") as HTMLInputElement;
assert(findButton !== null, "findButton not found");
findButton.addEventListener("click", () => {
  const value = parseInt(findInput.value);
  assert(!isNaN(value), "value must be a number");
  controller.find(value);
});

// Reset the controller upon clicking clearButton
const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
assert(clearButton !== null, "clearButton not found");
clearButton.addEventListener("click", () => {
  resetController(treeType);
});
/**
 * Delete the current controller, clear the canvas, and create a new controller of type newControllerType with the same animation speed setting and arrow direction
 * @param newControllerType The type of controller to use after clearing
 */
function resetController<T extends BSTController>(
  newControllerType: new () => T,
): void {
  const animationSpeedSetting = controller.getAnimationSpeedSetting();
  const arrowDirection = controller.getArrowDirection();
  controller.stopAnimation();

  // Clear canvas
  const context = canvas.getContext("2d");
  assert(context !== null, "context is null");
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Reset controller but keep old animation speed setting and arrow direction
  setControllerToNew(newControllerType);
  controller.setAnimationSpeedSetting(animationSpeedSetting);
  controller.setArrowDirection(arrowDirection);
  controller.animate();
}

// Change the arrows being drawn upon clicking arrowButton
const arrowButton = document.getElementById("arrowButton") as HTMLButtonElement;
const arrowDirections: ArrowDirection[] = [
  ArrowDirection.PARENT_TO_CHILD,
  ArrowDirection.PREORDER,
  ArrowDirection.INORDER,
  ArrowDirection.POSTORDER,
];
const arrowTexts = ["Parent to Child", "Preorder", "Inorder", "Postorder"];
let currentDirectionIndex = 0;
assert(arrowButton !== null, "arrowButton not found");
arrowButton.addEventListener("click", () => {
  currentDirectionIndex = (currentDirectionIndex + 1) % arrowDirections.length;
  const currentDirection = arrowDirections[currentDirectionIndex];
  const currentText = "Arrows: " + arrowTexts[currentDirectionIndex];
  arrowButton.textContent = currentText;
  controller.setArrowDirection(currentDirection);
});

// Change the animation speed upon changing animationSpeedBar
const animationSpeedBar = document.getElementById(
  "animationSpeedBar",
) as HTMLInputElement;
assert(animationSpeedBar !== null, "animationSpeedBar not found");
animationSpeedBar.addEventListener("input", () => {
  const animationSpeedSetting = parseInt(animationSpeedBar.value);
  assert(!isNaN(animationSpeedSetting), "speed must be a number");
  controller.setAnimationSpeedSetting(animationSpeedSetting);
});

// Pause the animation upon clicking pauseButton
const pauseButton = document.getElementById("pauseButton") as HTMLButtonElement;
let paused = false;
assert(pauseButton !== null, "pauseButton not found");
pauseButton.addEventListener("click", () => {
  paused = !paused;
  if (paused) {
    controller.stopAnimation();
    pauseButton.textContent = "Play";
  } else {
    controller.animate();
    pauseButton.textContent = "Pause";
  }
});

// Change the tree type upon changing treeTypeDropdown
const treeTypeDropdown = document.getElementById(
  "treeTypeDropdown",
) as HTMLSelectElement;
assert(treeTypeDropdown !== null, "treeTypeDropdown not found");
treeTypeDropdown.addEventListener("change", () => {
  const selectedTreeType = treeTypeDropdown.value;
  if (selectedTreeType === "bst") {
    treeType = BSTController;
  } else if (selectedTreeType === "avl") {
    treeType = AVLController;
  }
  resetController(treeType);
});
