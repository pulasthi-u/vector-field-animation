var space = document.getElementById("space");

function f(x, y, t) {
    
    var i = Math.sin(t);
    var j = x;
    return {
        i: i,
        j: j,
        magnitude: Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2)),
        slope: j/i,
    };
}

function CoordinatePlane(parentElement, cols, rows, callback) {
    
    var mainCanvas = document.createElement("CANVAS");
    
    this.cols = cols;
    this.rows = rows;
    
    this.totalHeight = parentElement.clientHeight;
    this.totalWidth = parentElement.clientWidth;
    
    mainCanvas.height = this.totalHeight;
    mainCanvas.width = this.totalWidth;
    
    this.mainCanvas = mainCanvas;
    this.mainCtx = mainCanvas.getContext("2d");
    
    parentElement.appendChild(mainCanvas);
    
    this.cageLength = this.totalWidth / cols;
    
    //parentElement.style.display = "grid";
    //parentElement.style.gridTemplateColumns = "repeat(" + cols + ", " + this.cageLength + "px)";
    //parentElement.style.gridTemplateRows = "repeat(" + rows + ", " + this.cageLength + "px)";
    
    this.parentElement = parentElement;
    
    this.cages = [];
    
    this.callback = callback;
    
    this.timeKeeper = new Date();
    this.startTime = -1;
}

CoordinatePlane.prototype.createCages = function(bottomLeftX, bottomLeftY, xIncrement, yIncrement) {
    var rowsInit = bottomLeftY + ((this.rows - 1)*yIncrement), rowsEnd = bottomLeftY, colsInit = bottomLeftX, colsEnd = bottomLeftX + ((this.cols - 1)*xIncrement);
    
    for (var y = rowsInit; y >= rowsEnd; y -= yIncrement) {
        for (var x = colsInit; x <= colsEnd; x += xIncrement) {
            var cage = new Cage(this, x, y);
            this.cages.push(cage);
        }
    }
}

CoordinatePlane.prototype.drawVectorField = function() {
    
    if (this.startTime == -1) {
        this.startTime = this.timeKeeper.getTime()/1000;
    }
    
    for (var i = 0; i < this.cages.length; i++) {
        this.cages[i].drawVector();
    }
}

CoordinatePlane.prototype.showVectorField = function() {
    var image = this.getPicture();
    this.mainCtx.clearRect(0, 0, this.totalWidth, this.totalHeight);
    this.mainCtx.drawImage(image, 0, 0, this.totalWidth, this.totalHeight);
    window.requestAnimationFrame(this.showVectorField.bind(this));
}

CoordinatePlane.prototype.eraseVectorField = function() {
    this.startTime = -1;
    
    for (var i = 0; i < this.cages.length; i++) {
        this.cages[i].eraseVector();
    }
}

CoordinatePlane.prototype.getPicture = function() {
    var canvas = document.createElement("CANVAS");
    
    canvas.height = this.totalHeight;
    canvas.width = this.totalWidth;
    
    var ctx = canvas.getContext("2d");
    
    var y = -1;
    
    for (var i = 0; i < this.cages.length; i++) {
        var currentCage = this.cages[i];
        var x = i % this.rows;
        if (x == 0) {
            y++;
        }
        var topLeftCornerX = this.cageLength * x;
        var topLeftCornerY = this.cageLength * y;
        ctx.drawImage(currentCage.canvas, topLeftCornerX, topLeftCornerY);
    }
    
    return canvas;
}

function Cage(coordinatePlane, x, y) {
    
    this.coordinatePlane = coordinatePlane;
    
    this.x = x;
    this.y = y;
    
    this.sideLength = coordinatePlane.cageLength;
    
    var canvas = document.createElement("CANVAS");
    canvas.height = this.sideLength;
    canvas.width = this.sideLength;
    canvas.id = "C/" + x + "/" + y;
    //this.coordinatePlane.parentElement.appendChild(canvas);
    
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    
    this.ctx.translate(this.sideLength/2, this.sideLength/2);
    this.ctx.transform(1, 0, 0, -1, 0, 0);
    
    this.arrowHeadLength = 6;
    this.arrowAngle = Math.PI/6;
    
    this.animationID;
    
}

Cage.prototype.drawVector = function() {
    
    var currentTime = new Date().getTime()/1000;
    var t = currentTime - this.coordinatePlane.startTime;
    
    var output = this.coordinatePlane.callback(this.x, this.y, t);
    
    var slope = output.slope;
    var vectorI = output.i;
    
    var xOffset = (this.sideLength)/(2*Math.sqrt(Math.pow(slope, 2) + 1));
    var yOffset;
    if (slope == Infinity) {
        yOffset = this.sideLength/2;
    } else if (slope == -Infinity) {
        yOffset = -this.sideLength/2;
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
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
    
    var initAngle = Math.atan(toX/toY);
    
    this.ctx.moveTo(toX, toY);
    
    if (toY >= 0) {
        this.ctx.lineTo(toX - this.arrowHeadLength * Math.sin(initAngle - this.arrowAngle), toY - this.arrowHeadLength * Math.cos(initAngle - this.arrowAngle));
        this.ctx.lineTo(toX - this.arrowHeadLength * Math.sin(initAngle + this.arrowAngle), toY - this.arrowHeadLength * Math.cos(initAngle + this.arrowAngle));
    } else {
        this.ctx.lineTo(toX + this.arrowHeadLength * Math.sin(initAngle - this.arrowAngle), toY + this.arrowHeadLength * Math.cos(initAngle - this.arrowAngle));
        this.ctx.lineTo(toX + this.arrowHeadLength * Math.sin(initAngle + this.arrowAngle), toY + this.arrowHeadLength * Math.cos(initAngle + this.arrowAngle));
    }
    
    this.ctx.fill();
    
    this.animationID = window.requestAnimationFrame(this.drawVector.bind(this));
    
}

Cage.prototype.eraseVector = function() {
    window.cancelAnimationFrame(this.animationID);
    
}

function Particle(coordinatePlane, initX, initY, time, trace) {
    this.vectorField = coordinatePlane;
    this.initX = initX;
    this.initY = initY;
    this.trace = trace;
    this.prevX = initX;
    this.prevY = initY;
    this.animateTime = time;
    
}

Particle.prototype.animate = function() {
    var t = new Date().getTime/1000 - this.vectorField.startTime;
    var newPositionOutput = this.vectorField.callback(this.prevX, this.prevY, t);
    var xOffset = newPositionOutput.i * this.animateTime;
    var yOffset = newPositionOutput.j * this.animateTime;
    var newX = this.prevX + xOffset;
    var newY = this.prevY + yOffset;
    
    
    
    this.prevX = newX;
    this.prevY = newY;
 }

var coord = new CoordinatePlane(space, 21, 21, f);
coord.createCages(-2, -2, 0.2, 0.2);
coord.drawVectorField();
coord.showVectorField();



