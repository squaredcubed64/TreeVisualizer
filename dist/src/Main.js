import ArrowDirection from "./controller/ArrowDirection";
import BSTController from "./controller/BSTController";
import assert from "../Assert";
import AVLController from "./controller/AVLController";
import TreeView from "./view/TreeView";
// Make canvas fill the screen
var canvas = document.getElementById("canvas");
window.addEventListener("resize", function () {
    resizeCanvas(canvas);
    BSTController.centerTree(canvas.width);
});
resizeCanvas(canvas);
BSTController.centerTree(canvas.width);
// Helpers
function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
// Initialize controller
var controller = new BSTController();
var treeType = BSTController;
function setControllerToNew(ControllerType) {
    controller = new ControllerType();
}
setControllerToNew(treeType);
controller.animate();
// Attach controller's insert() to insertButton
var insertButton = document.getElementById("insertButton");
var insertInput = document.getElementById("insertInput");
assert(insertButton !== null, "insertButton not found");
insertButton.addEventListener("click", function () {
    validateAndExecuteOperation(insertInput, function (value) {
        controller.insert(value);
    });
});
/**
 * Validate the input, executing the operation if the input is valid and displaying a popup otherwise
 * @param operationInput The input element containing the value to operate on
 * @param operation The operation to execute if the input is valid
 */
function validateAndExecuteOperation(operationInput, operation) {
    var value = parseFloat(operationInput.value);
    var popup = document.getElementById("popup");
    if (isNaN(value)) {
        popup.style.display = "flex";
    }
    else {
        popup.style.display = "none";
        operation(value);
    }
}
// Hide the popup upon clicking anywhere except the popup or any button
document.addEventListener("click", function (event) {
    var popup = document.getElementById("popup");
    if (event.target !== popup &&
        event.target !== insertButton &&
        event.target !== deleteButton &&
        event.target !== findButton) {
        popup.style.display = "none";
    }
});
// Attach controller's delete() to deleteButton
var deleteButton = document.getElementById("deleteButton");
var deleteInput = document.getElementById("deleteInput");
assert(deleteButton !== null, "deleteButton not found");
deleteButton.addEventListener("click", function () {
    validateAndExecuteOperation(deleteInput, function (value) {
        controller.delete(value);
    });
});
// Attach controller's find() to findButton
var findButton = document.getElementById("findButton");
var findInput = document.getElementById("findInput");
assert(findButton !== null, "findButton not found");
findButton.addEventListener("click", function () {
    validateAndExecuteOperation(findInput, function (value) {
        controller.find(value);
    });
});
// Reset the controller upon clicking clearButton
var clearButton = document.getElementById("clearButton");
assert(clearButton !== null, "clearButton not found");
clearButton.addEventListener("click", function () {
    resetController(treeType);
});
/**
 * Delete the current controller, clear the canvas, and create a new controller of type newControllerType with the same animation speed setting and arrow direction
 * @param newControllerType The type of controller to use after clearing
 */
function resetController(newControllerType) {
    var animationSpeedSetting = controller.getAnimationSpeedSetting();
    var arrowDirection = controller.getArrowDirection();
    controller.stopAnimation();
    // Clear canvas
    var context = canvas.getContext("2d");
    assert(context !== null, "context is null");
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Reset controller but keep old animation speed setting and arrow direction
    setControllerToNew(newControllerType);
    controller.setAnimationSpeedSetting(animationSpeedSetting);
    controller.setArrowDirection(arrowDirection);
    controller.animate();
}
// Change the arrows being drawn upon clicking arrowButton
var arrowButton = document.getElementById("arrowButton");
var arrowDirections = [
    ArrowDirection.PARENT_TO_CHILD,
    ArrowDirection.PREORDER,
    ArrowDirection.INORDER,
    ArrowDirection.POSTORDER,
];
var arrowTexts = ["Parent to Child", "Preorder", "Inorder", "Postorder"];
var currentDirectionIndex = 0;
assert(arrowButton !== null, "arrowButton not found");
arrowButton.addEventListener("click", function () {
    currentDirectionIndex = (currentDirectionIndex + 1) % arrowDirections.length;
    var currentDirection = arrowDirections[currentDirectionIndex];
    var currentText = "Arrows: " + arrowTexts[currentDirectionIndex];
    arrowButton.textContent = currentText;
    controller.setArrowDirection(currentDirection);
});
// Change the animation speed upon changing animationSpeedBar
var animationSpeedBar = document.getElementById("animationSpeedBar");
assert(animationSpeedBar !== null, "animationSpeedBar not found");
animationSpeedBar.addEventListener("input", function () {
    var animationSpeedSetting = parseInt(animationSpeedBar.value);
    assert(!isNaN(animationSpeedSetting), "speed must be a number");
    controller.setAnimationSpeedSetting(animationSpeedSetting);
});
// Pause the animation upon clicking pauseButton
var pauseButton = document.getElementById("pauseButton");
var paused = false;
assert(pauseButton !== null, "pauseButton not found");
pauseButton.addEventListener("click", function () {
    paused = !paused;
    if (paused) {
        controller.stopAnimation();
        TreeView.disableElements(TreeView.getDisableableElements());
        pauseButton.textContent = "Play";
    }
    else {
        controller.animate();
        TreeView.enableElements(TreeView.getDisableableElements());
        pauseButton.textContent = "Pause";
    }
});
// Change the tree type upon changing treeTypeDropdown
var treeTypeDropdown = document.getElementById("treeTypeDropdown");
assert(treeTypeDropdown !== null, "treeTypeDropdown not found");
treeTypeDropdown.addEventListener("change", function () {
    var selectedTreeType = treeTypeDropdown.value;
    if (selectedTreeType === "bst") {
        treeType = BSTController;
    }
    else if (selectedTreeType === "avl") {
        treeType = AVLController;
    }
    resetController(treeType);
});
// Show a node's properties upon hovering over it
canvas.addEventListener("mousemove", function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    controller.handleHover(x, y);
});
//# sourceMappingURL=Main.js.map