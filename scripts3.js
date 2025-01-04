var space = document.getElementById("space");
var arrowAngle = Math.PI/6;
var arrowHeadLength = 6;

function f1(x, y, t) {
var a = 3;
var k = 5;
    var i = k*(x-a*Math.cos(t/2))/Math.pow((Math.pow(x-a*Math.cos(t/2), 2) + Math.pow(y-a*Math.sin(t/2), 2)), 3/2) - k*(x+a/2)/Math.pow((Math.pow(x+a/2, 2) + Math.pow(y, 2)), 3/2);
    var j = k*(y-a*Math.sin(t/2))/Math.pow((Math.pow(x-a*Math.cos(t/2), 2) + Math.pow(y-a*Math.sin(t/2), 2)), 3/2) - k*(y)/Math.pow((Math.pow(x+a/2, 2) + Math.pow(y, 2)), 3/2);
    return {
        i: i,
        j: j,
        slope: j/i,
        magnitude: Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2)),
    };
}

function f2(x, y, t) {
    // var i = 1 - ((Math.pow(x, 2) - Math.pow(y, 2))/Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 2));
    // var j = (-2*x*y)/Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 2);
    var i = Math.sin(2*t)*10 - x*Math.cos(t/2);
    var j = Math.sin(1.5*t)*10 - y*Math.cos(t/2);
    return {
        i: i,
        j: j,
        slope: j/i,
        magnitude: Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2)),
    };
}

function drawStraightLine(ctx, fromX, fromY, toX, toY) {
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
}

function drawArrowHead(ctx, beginX, beginY, arrowHeadLength, arrowAngle) {
    var initAngle = Math.atan(beginX/beginY);
    
    ctx.moveTo(beginX, beginY);
    
    if (beginY >= 0) {
        ctx.lineTo(beginX - arrowHeadLength * Math.sin(initAngle - arrowAngle), beginY - arrowHeadLength * Math.cos(initAngle - arrowAngle));
        ctx.lineTo(beginX - arrowHeadLength * Math.sin(initAngle + arrowAngle), beginY - arrowHeadLength * Math.cos(initAngle + arrowAngle));
    } else {
        ctx.lineTo(beginX + arrowHeadLength * Math.sin(initAngle - arrowAngle), beginY + arrowHeadLength * Math.cos(initAngle - arrowAngle));
        ctx.lineTo(beginX + arrowHeadLength * Math.sin(initAngle + arrowAngle), beginY + arrowHeadLength * Math.cos(initAngle + arrowAngle));
    }
    
    ctx.fill();
}

//############################################

// Frames = Images that will be displayed and erased at a fast rate, so that we see an animation
//
// Stage = A space where frames are displayed. It is possible to display several frames on a stage at a given instant.
//
// Cage = Square-shaped region on a frame, described by an ordered pair corresponding to a specific position on the frame

//############################################

function Frame(totalWidth, totalHeight) {
    var canvas = document.createElement("CANVAS");
    var ctx = canvas.getContext("2d");
    
    this.canvas = canvas;
    this.ctx = ctx;
}

Frame.prototype.draw = function(image) {
    
}

function Stage(parentElement) {
    this.parentElement = parentElement;
    this.totalHeight = parentElement.clientHeight;
    this.totalWidth = parentElement.clientWidth;
    
    var canvas = document.createElement("CANVAS");
    canvas.width = parentElement.clientWidth;
    canvas.height = parentElement.clientHeight;
    
    var ctx = canvas.getContext("2d");
    
    this.canvas = canvas;
    this.ctx = ctx;
    
    this.vectorFields = [];
    this.particles = [];
    
    this.animationID;
    
    parentElement.appendChild(canvas);
}

Stage.prototype.addVectorField = function(vectorField) {
    this.vectorFields.push(vectorField);
}

Stage.prototype.initiateAnimations = function () {
    for (var index = 0; index < this.vectorFields.length; index++) {
        var vectorField = this.vectorFields[index];
        vectorField.createCages();
        vectorField.startTiming();
        vectorField.animateCages();
    }
    
    for (var index = 0; index < this.particles.length; index++) {
        var particle = this.particles[index];
        particle.startDrawing();
    }
}

Stage.prototype.addParticle = function(particle) {
    this.particles.push(particle);
}

Stage.prototype.beginAnimation = function() {
    this.ctx.clearRect(0, 0, this.totalWidth, this.totalHeight);
    
    for (var index = 0; index < this.vectorFields.length; index++) {
        var snapshot = this.vectorFields[index].snapshotOfCages();
        this.ctx.drawImage(snapshot, 0, 0);
    }
    
    for (var index = 0; index < this.particles.length; index++) {
        var particleSnapshot = this.particles[index].canvas;
        this.ctx.drawImage(particleSnapshot, 0, 0);
    }
    
    this.animationID = window.requestAnimationFrame(this.beginAnimation.bind(this));
}

function VectorField(f, rows, cols, totalWidth, totalHeight) {
    this.f = f;
    
    this.rows = rows;
    this.cols = cols;
    
    this.cages = [];
    
    this.totalHeight = totalHeight;
    this.totalWidth = totalWidth;
    
    this.cageSideLength = totalHeight / rows;
    
    this.startTime = -1;
}

VectorField.prototype.defineAxes = function(leftmostX, xIncrement, bottommostY, yIncrement) {
    this.xInit = leftmostX;
    this.xIncrement = xIncrement;
    this.xEnd = leftmostX + ((this.cols - 1) * xIncrement);
    
    this.yInit = bottommostY + ((this.rows - 1) * yIncrement);
    this.yIncrement = yIncrement;
    this.yEnd = bottommostY;
}

VectorField.prototype.createCages = function() {
    for (var y = this.yInit; y >= this.yEnd; y -= this.yIncrement) {
        for (var x = this.xInit; x <= this.xEnd; x += this.xIncrement) {
            var cage = new Cage(this, x, y, this.cageSideLength);
            cage.defineArrow(arrowHeadLength, arrowAngle);
            this.cages.push(cage);
        }
    }
}

VectorField.prototype.startTiming = function() {
    this.startTime = new Date().getTime()/1000;
}

VectorField.prototype.animateCages = function() {
    this.startTiming();
    for (var index = 0; index < this.cages.length; index++) {
        this.cages[index].animate();
    }
}

VectorField.prototype.snapshotOfCages = function() {
    var canvas = document.createElement("CANVAS");
    canvas.width = this.totalWidth;
    canvas.height = this.totalHeight;
    
    var ctx = canvas.getContext("2d");
    
    for (var index = 0; index < this.cages.length; index++) {
        var cageCanvas = this.cages[index].canvas;
        
        var beginX = (index % this.rows) * this.cageSideLength;
        var beginY = ((index - (index % this.rows))/this.rows) * this.cageSideLength;
        
        ctx.drawImage(cageCanvas, beginX, beginY);
    }
    
    return canvas;
}


function Cage(parentVectorField, x, y, sideLength) {
    this.parentVectorField = parentVectorField;
    this.x = x;
    this.y = y;
    this.sideLength = sideLength;
    
    var canvas = document.createElement("CANVAS");
    canvas.width = sideLength;
    canvas.height = sideLength;
    
    this.canvas = canvas;
    
    var ctx = canvas.getContext("2d");
    ctx.translate(sideLength/2, sideLength/2);
    ctx.transform(1, 0, 0, -1, 0, 0);
    
    this.ctx = ctx;
    
    this.animationID;
}

Cage.prototype.defineArrow = function(arrowHeadLength, arrowAngle) {
    this.arrowHeadLength = arrowHeadLength;
    this.arrowAngle = arrowAngle;
}

Cage.prototype.drawVector = function() {
    var t = new Date().getTime()/1000 - this.parentVectorField.startTime;
    
    var output = this.parentVectorField.f(this.x, this.y, t);    
    
    var slope = output.slope;
    var vectorI = output.i;
    
    var scaleFactor = 1;//output.magnitude/10;
    
    var xOffset = (this.sideLength * scaleFactor)/(2 * Math.sqrt(Math.pow(slope, 2) + 1));
    
    var yOffset;
    
    if (slope == Infinity) {
        yOffset = scaleFactor * this.sideLength/2;
    } else if (slope == -Infinity) {
        yOffset = -scaleFactor * this.sideLength/2;
    } else {
        yOffset = slope * xOffset;
    }
    
    var toX, toY;
    
    if (vectorI >= 0) {
        toX = xOffset;
        toY = yOffset;
    } else {
        toX = -xOffset;
        toY = -yOffset;
    }
    
    this.ctx.clearRect(-this.sideLength/2, -this.sideLength/2, this.sideLength, this.sideLength);
    
    this.ctx.beginPath();
    
    drawStraightLine(this.ctx, 0, 0, toX, toY);
    drawArrowHead(this.ctx, toX, toY, this.arrowHeadLength, this.arrowAngle);
}

Cage.prototype.animate = function() {
    this.drawVector();
    this.animationID = window.requestAnimationFrame(this.animate.bind(this));
}

function Particle(initX, initY, radius, trace, vectorField, animateInterval) {
    var canvas = document.createElement("CANVAS");
    canvas.width = vectorField.totalWidth;
    canvas.height = vectorField.totalHeight;
    
    var ctx = canvas.getContext("2d");
    
    ctx.translate(vectorField.totalWidth/2, vectorField.totalHeight/2);
    ctx.transform(vectorField.cageSideLength, 0, 0, -vectorField.cageSideLength, 0, 0);
    
    this.canvas = canvas;
    this.ctx = ctx;
    
    this.initX = initX;
    this.initY = initY;
    
    this.prevX = initX;
    this.prevY = initY;
    this.pastPositions = [];
    
    this.currentX = initX;
    this.currentY = initY;
    
    this.vectorField = vectorField;
    
    this.animateInterval = animateInterval;
    
    this.radius = radius;
    
    this.trace = trace;
    
    this.animationID;
}

Particle.prototype.updatePosition = function() {
    var t = new Date().getTime()/1000 - this.vectorField.startTime;
    
    var output = this.vectorField.f(this.currentX, this.currentY, t);
    
    var xDisplacement = output.i * this.animateInterval;
    var yDisplacement = output.j * this.animateInterval;
    
    var newX = this.currentX + xDisplacement;
    var newY = this.currentY + yDisplacement;
    
    this.prevX = this.currentX;
    this.prevY = this.currentX;

    this.pastPositions.unshift({X: this.currentX, Y: this.currentY,});
    
    this.currentX = newX;
    this.currentY = newY;
    
    return {
        newX: newX,
        newY: newY,
    };
}

Particle.prototype.startDrawing = function() {
    this.updatePosition();
    
    if (this.trace == 0) { // erase each time.
        this.ctx.clearRect(-this.vectorField.totalWidth/2, -this.vectorField.totalHeight/2, this.vectorField.totalWidth, this.vectorField.totalHeight);
    } else if ((this.trace == 1) && (this.pastPositions.length >= 25)) { // draw a trail
        var oldLocation = this.pastPositions.pop();
        this.ctx.beginPath();
        this.ctx.arc(oldLocation.X, oldLocation.Y, this.radius + 0.02, 0, 2 * Math.PI);
        this.ctx.save();
        this.ctx.clip();
        this.ctx.clearRect(-this.vectorField.totalWidth/2, -this.vectorField.totalHeight/2, this.vectorField.totalWidth, this.vectorField.totalHeight);
        this.ctx.restore();
    } // else draw everything
    
    this.ctx.beginPath();
    this.ctx.arc(this.currentX, this.currentY, this.radius, 0, 2 * Math.PI);
    this.ctx.fill();
    
    this.animationID = window.requestAnimationFrame(this.startDrawing.bind(this));
}

var stage = new Stage(space);
var v1 = new VectorField(f2, 21, 21, space.clientWidth, space.clientHeight);

// var part = new Particle(1, 5, 0.05, true, v1, 0.01);
// var part2 = new Particle(2, 3, 0.05, true, v1, 0.01);
// var part3 = new Particle(0, 0, 0.05, true, v1, 0.01);

v1.defineAxes(-10, 1, -10, 1);

stage.addVectorField(v1);

for (var i = 0; i < 20; i++) {
    // var part = new Particle(-10 + 2*i, -10 + 2*i + 3, 0.05, true, v1, 0.01);
    // stage.addParticle(part);
    var X = -10 + i;
    var Y = Math.sqrt(100 - Math.pow(X, 2));
    var Y1 = Math.sqrt(81 - Math.pow(X, 2));
    var part = new Particle(X, Y, 0.04, 1, v1, 0.01);
    stage.addParticle(part);
    var part = new Particle(X, Y1, 0.04, 1, v1, 0.01);
    stage.addParticle(part);
    var part = new Particle(X, -Y, 0.04, 1, v1, 0.01);
    stage.addParticle(part);
}

// stage.addParticle(part);
// stage.addParticle(part2);
// stage.addParticle(part3);

stage.initiateAnimations();

stage.beginAnimation();