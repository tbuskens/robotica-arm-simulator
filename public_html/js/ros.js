angleArm1 = 0;
angleArm2 = 0;
angleArm3 = 0;
angleArm1Old = 0;
angleArm2Old = 0;
angleArm3Old = 0;

function convertROStoSimulator(joint1, joint2, joint3) {
    angleArm1Old = angleArm1;
    angleArm2Old = angleArm2;
    angleArm3Old = angleArm3;

    angleArm1 = -1 * convertRadialToDegrees(joint1);
    angleArm2 = -1 * convertRadialToDegrees(joint2) + 90;
    angleArm3 = -1 * convertRadialToDegrees(joint3);
    rotateArm1(angleArm1-angleArm1Old);
    rotateArm2(angleArm2-angleArm2Old);
    rotateArm3(angleArm3-angleArm3Old);
}

animation = [];
nAnimationNow = 0;

animationLock = false;

function runAnimation() {
    animationLock = true;
    if(animation[nAnimationNow] != null) {
        convertROStoSimulator(animation[nAnimationNow][0].angle, animation[nAnimationNow][1].angle, animation[nAnimationNow][2].angle);
        nAnimationNow++;
        setTimeout(runAnimation, 200);
    } else {
        nAnimationNow = 0;
        animationLock = false;
    }
}

function simplifyAngle(angle)
{
    angle = angle % (2.0 * Math.PI);
    if( angle < -Math.PI )
        angle += (2.0 * Math.PI);
    else if( angle > Math.PI )
        angle -= (2.0 * Math.PI);
    return angle;
}

function doCCD(bones, nBones, targetX, targetY, maxDistance) {
    // if(targetX < 0) {
    //     targetX = 0;
    // }
    //
    // if(targetY < -10) {
    //     targetY = -10;
    // }

    animation = [];
    for(nIteration = 0; nIteration < 2; nIteration++) {
        console.log(robotBones[0].angle);
        console.log(robotBones[1].angle);
        console.log(robotBones[2].angle);

        console.log('Iteration: ' + (nIteration+1));
        returnVal = doCCDIteration(robotBones, nBones, targetX, targetY, maxDistance);
        console.log(returnVal);
        if(returnVal !== 1) {
            break;
        }
    }
    console.log(robotBones);
    return nIteration;
}

// Set an epsilon value to prevent division by small numbers.
epsilon = 0.0001;

// Set max arc length a bone can move the end effector an be considered no motion
// so that we can detect a failure state.
trivialArcLength = 0.00001;

radialMaxTurn = 1.8;

function doCCDIteration(bones, nBones, targetX, targetY, maxDistance) {

    arrivalDistSqr = maxDistance*maxDistance;

    worldBones = [];

    rootWorldBone = {
        x: bones[0].x,
        y: bones[0].y,
        angle: bones[0].angle,
        cosAngle: Math.cos(bones[0].angle),
        sinAngle: Math.sin(bones[0].angle),
    };

    worldBones.push(rootWorldBone);


    // Convert child bones to world space.
    for(boneIdx = 1; boneIdx < nBones; boneIdx++) {
        prevWorldBone = worldBones[boneIdx-1];
        curLocalBone  = bones[boneIdx];

        newWorldBone = {
            x: prevWorldBone.x + prevWorldBone.cosAngle*curLocalBone.x - prevWorldBone.sinAngle*curLocalBone.y,
            y: prevWorldBone.y + prevWorldBone.sinAngle*curLocalBone.x + prevWorldBone.cosAngle*curLocalBone.y,
            angle: prevWorldBone.angle + curLocalBone.angle,
            cosAngle: 0,
            sinAngle: 0,
        };
        newWorldBone.cosAngle = Math.cos(newWorldBone.angle);
        newWorldBone.sinAngle = Math.sin(newWorldBone.angle);
        worldBones.push(newWorldBone);
    }


    //===
    // Track the end effector position (the final bone)
    endX = worldBones[nBones-1].x;
    endY = worldBones[nBones-1].y;

    console.log("endX -> " + endX);
    console.log("endY -> " + endY);

    //===
    // Perform CCD on the bones by optimizing each bone in a loop
    // from the final bone to the root bone
    modifiedBones = false;
    for(boneIdx = nBones-2; boneIdx >= 0; boneIdx--)
    {
        // Get the vector from the current bone to the end effector position.
        curToEndX = endX - worldBones[boneIdx].x;
        curToEndY = endY - worldBones[boneIdx].y;
        curToEndMag = Math.sqrt( curToEndX*curToEndX + curToEndY*curToEndY );

        // Get the vector from the current bone to the target position.
        curToTargetX = targetX - worldBones[boneIdx].x;
        curToTargetY = targetY - worldBones[boneIdx].y;
        curToTargetMag = Math.sqrt(   curToTargetX*curToTargetX + curToTargetY*curToTargetY );

        // Get rotation to place the end effector on the line from the current
        // joint position to the target postion.
        endTargetMag = (curToEndMag*curToTargetMag);
        if( endTargetMag <= epsilon )
        {
            cosRotAng = 1;
            sinRotAng = 0;
        }
        else
        {
            cosRotAng = (curToEndX*curToTargetX + curToEndY*curToTargetY) / endTargetMag;
            sinRotAng = (curToEndX*curToTargetY - curToEndY*curToTargetX) / endTargetMag;
        }

        // Clamp the cosine into range when computing the angle (might be out of range
        // due to floating point error).
        rotAng = Math.acos(cosRotAng);
        if(sinRotAng < 0.0) {
            rotAng = -rotAng;
        }

        // Rotate the current bone in local space (this value is output to the user)
        newAngle = simplifyAngle(bones[boneIdx].angle + rotAng);
        switch(true) {
            case newAngle < bones[boneIdx].minAngle:
                newAngle = bones[boneIdx].minAngle;
                break;
            case newAngle > bones[boneIdx].maxAngle:
                newAngle = bones[boneIdx].maxAngle;
        }
        bones[boneIdx].angle = newAngle;

        // Rotate the end effector position.
        endX = worldBones[boneIdx].x + cosRotAng*curToEndX - sinRotAng*curToEndY;
        endY = worldBones[boneIdx].y + sinRotAng*curToEndX + cosRotAng*curToEndY;

        // Check for termination
        endToTargetX = (targetX-endX);
        endToTargetY = (targetY-endY);


        // Animate to canvas
        animation.push(JSON.parse(JSON.stringify(robotBones)));

        // robotBones = JSON.parse(JSON.stringify(bones));
        if( endToTargetX*endToTargetX + endToTargetY*endToTargetY <= arrivalDistSqr )
        {
            // We found a valid solution.
            return 0;
        }

        // Track if the arc length that we moved the end effector was
        // a nontrivial distance.
        if( !modifiedBones && Math.abs(rotAng)*curToEndMag > trivialArcLength )
        {
            // Rotate the current bone in local space (this value is output to the user)
            // bones[boneIdx].angle =  simplifyAngle(bones[boneIdx].angle + rotAng);
            modifiedBones = true;
        }
    }

    // We failed to find a valid solution during this iteration.
    if(modifiedBones) {
        return 1;
    }
    else {
        return 2;
    }
}


robotBones = {
    0: {
        x: 0,
        y: 0,
        angle: 0,
        minAngle: -1.5,
        maxAngle: 1.5,
    },
    1: {
        x: 0,
        y: 10,
        angle: 0,
        minAngle: -1.2,
        maxAngle: 1.2,
    },
    2: {
        x: 10,
        y: 0,
        angle: 0,
        minAngle: -1.2,
        maxAngle: 1.2,
    },
    3: {
        x: 10,
        y: 0,
        angle: 0,
        minAngle: 0,
        maxAngle: 0,
    }
};


function main(){
    console.log('run!');

    nIterations = doCCD(robotBones, 4, 20, 0, 1);
    runAnimation();
    setTimeout(run2, 500+(nIterations*200*3));
}


function run2() {
    nIterations = doCCD(robotBones, 4, 10, 20, 1);
    runAnimation();
    setTimeout(run3, 500+(nIterations*200*3));
}

function run3() {
    nIterations = doCCD(robotBones, 4, 0, 30, 1);
    runAnimation();
}



convertROStoSimulator(robotBones[0].angle, robotBones[1].angle, robotBones[2].angle); // startPosition
setTimeout(main, 2000);
// main(); // Program starts here!