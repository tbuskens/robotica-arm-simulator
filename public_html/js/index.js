var canvas = document.getElementById("canvasSim");
console.log(canvas);
var ctx = canvas.getContext("2d");

var baseMidPointX = 250;
var baseMidPointY = 600;


var arm1xO = 0; // Base
var arm1yO = 0; // Base

var arm2xO = 0; // End Arm 1
var arm2yO = 50; // End Arm 1

var arm3xO = 0; // End Arm 2
var arm3yO = 100; // End Arm 2

var arm4xO = 0; // End Arm 3
var arm4yO = 150; // End Arm 3

redrawArms();

function redrawArms(){
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,500,500);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(200,450,100,50);
    ctx.fillStyle = "#000000";

    startArm1X = baseMidPointX + arm1xO;
    startArm1Y = baseMidPointY - (150 + arm1yO);
    startArm2X = baseMidPointX + arm2xO;
    startArm2Y = baseMidPointY - (150 + arm2yO);
    startArm3X = baseMidPointX + arm3xO;
    startArm3Y = baseMidPointY - (150 + arm3yO);
    endArm3X = baseMidPointX + arm4xO;
    endArm3Y = baseMidPointY - (150 + arm4yO);

    // console.log("Base start: " + startArm1X + ", " + startArm1Y);
    // console.log("Arm 2 start: " + startArm2X + ", " + startArm2Y);
    // console.log("Arm 3 start: " + startArm3X + ", " + startArm3Y);
    // console.log("Arm 4 start: " + endArm3X + ", " + endArm3Y);

    ctx.beginPath();
    ctx.moveTo(startArm1X, startArm1Y);
    ctx.lineTo(startArm2X, startArm2Y);
    ctx.lineTo(startArm3X, startArm3Y);
    ctx.lineTo(endArm3X, endArm3Y);
    ctx.stroke();
}

function rotateArm1(degrees){
    oldArm2xO = arm2xO;
    oldArm2yO = arm2yO;
    data = rotate(degrees, arm2xO, arm2yO, arm1xO, arm1yO);
    arm2xO = data.x;
    arm2yO = data.y;
    arm3xO = arm3xO + (arm2xO - oldArm2xO);
    arm3yO = arm3yO + (arm2yO - oldArm2yO);
    arm4xO = arm4xO + (arm2xO - oldArm2xO);
    arm4yO = arm4yO + (arm2yO - oldArm2yO);
    rotateArm2(degrees, false);
}

function rotateArm2(degrees){
    oldArm3xO = arm3xO;
    oldArm3yO = arm3yO;
    data = rotate(degrees, arm3xO, arm3yO, arm2xO, arm2yO);
    arm3xO = data.x;
    arm3yO = data.y;
    arm4xO = arm4xO + (arm3xO - oldArm3xO);
    arm4yO = arm4yO + (arm3yO - oldArm3yO);
    rotateArm3(degrees, false);
}

function rotateArm3(degrees){
    data = rotate(degrees, arm4xO, arm4yO, arm3xO, arm3yO);
    arm4xO = data.x;
    arm4yO = data.y;
    redrawArms();
}

function rotate(degrees, x, y, xO = 0, yO = 0, bDegrees = true) {
    // console.log(degrees);
    if(bDegrees) {
        degrees = degrees * Math.PI / 180 * -1;
    }

    // console.log(xO);
    // console.log(yO);
    xEnd = (x - xO) * Math.cos(degrees) - (y - yO) * Math.sin(degrees) + xO;
    yEnd = (x - xO) * Math.sin(degrees) + (y - yO) * Math.cos(degrees) + yO;

    // console.log("X: " + xEnd);
    // console.log("Y: " + yEnd);
    // console.log("\n\n");

    return {x: xEnd, y: yEnd};
}
