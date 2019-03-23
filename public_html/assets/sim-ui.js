class UI {

    constructor(canvasId = null) {

        if(canvasId != null) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext("2d");
            this.calconly = false;
        } else {
            this.calconly = true;
        }

        this.baseMidPointX = 250;
        this.baseMidPointY = 600;

        this.arm1xO = 0;
        this.arm1yO = 0;

        this.arm2xO = 0;
        this.arm2yO = 50;

        this.arm3xO = 0;
        this.arm3yO = 100;

        this.arm4xO = 0;
        this.arm4yO = 150;
        this.redrawArms();
    }

    rotateArm1(degrees) {
        let oldArm2xO = this.arm2xO;
        let oldArm2yO = this.arm2yO;
        let data = this.rotate(degrees, this.arm2xO, this.arm2yO, this.arm1xO, this.arm1yO);
        this.arm2xO = data.x;
        this.arm2yO = data.y;
        this.arm3xO = this.arm3xO + (this.arm2xO - oldArm2xO);
        this.arm3yO = this.arm3yO + (this.arm2yO - oldArm2yO);
        this.arm4xO = this.arm4xO + (this.arm2xO - oldArm2xO);
        this.arm4yO = this.arm4yO + (this.arm2yO - oldArm2yO);
        this.rotateArm2(degrees);
    }


    rotateArm2(degrees) {
        let oldArm3xO = this.arm3xO;
        let oldArm3yO = this.arm3yO;
        let data = this.rotate(degrees, this.arm3xO, this.arm3yO, this.arm2xO, this.arm2yO);
        this.arm3xO = data.x;
        this.arm3yO = data.y;
        this.arm4xO = this.arm4xO + (this.arm3xO - oldArm3xO);
        this.arm4yO = this.arm4yO + (this.arm3yO - oldArm3yO);
        this.rotateArm3(degrees);
    }

    rotateArm3(degrees) {
        let data = this.rotate(degrees, this.arm4xO, this.arm4yO, this.arm3xO, this.arm3yO);
        this.arm4xO = data.x;
        this.arm4yO = data.y;
        this.redrawArms();
    }

    convertRadialToDegrees(angle) {
        return angle * 180 / Math.PI;
    }

    convertDegreesToRadial(degrees) {
        return degrees * Math.PI / 180 * -1;
    }

    rotate(degrees, x, y, xO = 0, yO = 0, bDegrees = true) {
        // console.log(degrees);
        if (bDegrees) {
            degrees = this.convertDegreesToRadial(degrees);
        }

        // console.log(xO);
        // console.log(yO);
        let xEnd = (x - xO) * Math.cos(degrees) - (y - yO) * Math.sin(degrees) + xO;
        let yEnd = (x - xO) * Math.sin(degrees) + (y - yO) * Math.cos(degrees) + yO;

        // console.log("X: " + xEnd);
        // console.log("Y: " + yEnd);
        // console.log("\n\n");

        return {x: xEnd, y: yEnd};
    }






    redrawArms() {
        if(!this.calconly) {
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillRect(0, 0, 500, 500);
            this.ctx.fillStyle = "#FF0000";
            this.ctx.fillRect(200, 450, 100, 50);
            this.ctx.fillStyle = "#000000";
        }

        let startArm1X = this.baseMidPointX + this.arm1xO;
        let startArm1Y = this.baseMidPointY - (150 + this.arm1yO);
        let startArm2X = this.baseMidPointX + this.arm2xO;
        let startArm2Y = this.baseMidPointY - (150 + this.arm2yO);
        let startArm3X = this.baseMidPointX + this.arm3xO;
        let startArm3Y = this.baseMidPointY - (150 + this.arm3yO);
        let endArm3X = this.baseMidPointX + this.arm4xO;
        let endArm3Y = this.baseMidPointY - (150 + this.arm4yO);

        console.log("Base start: " + startArm1X + ", " + startArm1Y);
        console.log("Arm 2 start: " + startArm2X + ", " + startArm2Y);
        console.log("Arm 3 start: " + startArm3X + ", " + startArm3Y);
        console.log("Arm 4 start: " + endArm3X + ", " + endArm3Y);

        this.endArm1X = startArm2X;
        this.endArm1Y = startArm2Y;
        this.endArm2X = startArm3X;
        this.endArm2Y = startArm3Y;
        this.endArm3X = endArm3X;
        this.endArm3Y = endArm3Y;

        if(!this.calconly) {
            this.ctx.beginPath();
            this.ctx.moveTo(startArm1X, startArm1Y);
            this.ctx.lineTo(startArm2X, startArm2Y);
            this.ctx.lineTo(startArm3X, startArm3Y);
            this.ctx.lineTo(endArm3X, endArm3Y);
            this.ctx.stroke();
        } else {
            console.log(this.getPos());
        }
    }

    sendData(arm) {
        switch(arm) {
            case 1:
                this.move(1, document.getElementById('arm1').value);
                break;
            case 2:
                this.move(2, document.getElementById('arm2').value);
                break;
            case 3:
                this.move(3, document.getElementById('arm3').value);
                break;
        }
    }

    move(arm, degrees) {
        switch(arm) {
            case 1:
                this.rotateArm1(degrees);
                break;
            case 2:
                this.rotateArm2(degrees);
                break;
            case 3:
                this.rotateArm3(degrees);
                break;
        }
    }

    moveMulti(degrees1, degrees2, degrees3) {
        this.move(1, degrees1);
        this.move(2, degrees2);
        this.move(3, degrees3);
    }

    getPos() {
        return {1: {x: this.endArm1X, y: this.endArm1Y}, 2: {x: this.endArm2X, y: this.endArm2Y}, 3: {x: this.endArm3X, y: this.endArm3Y}};
    }




}
