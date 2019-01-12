function IK(x, y, joints) {

    this.location = new Vector(x, y);

    // 0: Not visible
    // 1: Just bones
    // 2: Angle indicators
    this.drawLevel = 2;

    this.joints = joints;

    this.target   = new Vector(150, 420);
    this.active   = this.joints.length - 1;
    this.run      = true;
    this.slow     = true;
    this.oneByOne = true;
    this.attempts = 0;
}

IK.prototype.resetActive = function() {

    this.active = this.joints.length - 1;
};

IK.prototype.getAngles = function() {

    var activeToTargetAngle = Math.atan2(
        this.target.y - (this.anchors[this.active].y + this.location.y),
        this.target.x - (this.anchors[this.active].x + this.location.x)
    ) * (180 / Math.PI);

    var endToActiveAngle = this.joints[this.active].angle  * (180 / Math.PI);

    if (this.active !== (this.anchors.length - 1)) {

        endToActiveAngle = Math.atan2(
            (this.location.y + this.anchors[this.anchors.length - 1].y) -
            (this.location.y + this.anchors[this.active].y),
            (this.location.x + this.anchors[this.anchors.length - 1].x) -
            (this.location.x + this.anchors[this.active].x)
        ) * (180 / Math.PI);
    }

    return {
        activeToTarget: activeToTargetAngle,
        endToActive: endToActiveAngle
    };
};

IK.prototype.makeAnchors = function() {

    this.anchors = [];
    this.anchors.push(new Vector(0, 0));
    this.anchors.push(new Vector(
        this.anchors[0].x + Math.cos(this.joints[0].angle) * this.joints[0].length,
        this.anchors[0].y + Math.sin(this.joints[0].angle) * this.joints[0].length
    ));
    this.anchors.push(new Vector(
        this.anchors[1].x + Math.cos(this.joints[1].angle) * this.joints[1].length,
        this.anchors[1].y + Math.sin(this.joints[1].angle) * this.joints[1].length
    ));
    this.anchors.push(new Vector(
        this.anchors[2].x + Math.cos(this.joints[2].angle) * this.joints[2].length,
        this.anchors[2].y + Math.sin(this.joints[2].angle) * this.joints[2].length
    ));
    this.anchors.push(new Vector(
        this.anchors[3].x + Math.cos(this.joints[3].angle) * this.joints[3].length,
        this.anchors[3].y + Math.sin(this.joints[3].angle) * this.joints[3].length
    ));
};

IK.prototype.onTarget = function() {

    var endAffector = new Vector(
        this.location.x + this.anchors[this.anchors.length -1].x,
        this.location.y + this.anchors[this.anchors.length -1].y
    );

    var targetDifference = this.target.distance(endAffector);

    if (targetDifference < 3) {

        //console.log('On target, stopping!');
        return true;
    }

    return false;
};

IK.prototype.notResolvable = function() {

    if (this.attempts > 5000) {
        console.log('Not resolvable, stopping!');
        return true;
    }

    return false;
};

IK.prototype.shift = function() {

    this.active -= 1;
    if (this.active < 0) {
        this.resetActive();
    }
};

IK.prototype.step = function() {

    this.makeAnchors();

    var angle = this.getAngles();

    // The angle is different, rotate!
    if (angle.endToActive != angle.activeToTarget) {

        for (var j = this.active; j < this.joints.length; j++) {

            if (angle.endToActive < angle.activeToTarget) {

                this.joints[j].angle += 0.01;
            } else {

                this.joints[j].angle -= 0.01;
            }
        }

        // Done rotating towards
        if (this.oneByOne) {

            if (Math.floor(angle.endToActive) == Math.floor(angle.activeToTarget)) {

                this.shift();
            }
        } else {

            this.shift();
        }
    }

    // Continue?
    if (this.onTarget() || this.notResolvable()) {

        this.run = false;
    }

    this.attempts += 1;
};

IK.prototype.direct = function() {

    while (this.run) {

        this.step();
    }
};

IK.prototype.update = function() {

    if (this.run) {
        if (this.slow) {
            this.step();
        } else {
            this.direct();
        }
    }

    if (this.drawLevel > 0) {
        this.draw();
    }
};

IK.prototype.draw = function() {

    this.drawStart();
    this.drawBones();
    this.drawConstraints();
    this.drawAngleLines();
};