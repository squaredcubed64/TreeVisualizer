// Get the canvas element
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
// Draw a circle
ctx.beginPath();
ctx.arc(50, 50, 30, 0, 2 * Math.PI);
ctx.fillStyle = "red";
ctx.fill();
ctx.closePath();
