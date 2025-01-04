var space = document.getElementById("space");

function f(x, y, t) {
    
    var i = x;
    var j = y;
    return {
        i: i,
        j: j,
        magnitude: Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2)),
        slope: j/i,
    };
}

function CoordinatePlane(parentElement, cols, rows, callback) {
    
    this.cols = cols;
    this.rows = rows;
    
    this.totalHeight = parentElement.clientHeight;
    this.totalWidth = parentElement.clientWidth;
    
    this.cageLength = this.totalWidth / cols;
    
    parentElement.style.display = "grid";
    parentElement.style.gridTemplateColumns = "repeat(" + cols + ", " + this.cageLength + "px)";
    parentElement.style.gridTemplateRows = "repeat(" + rows + ", " + this.cageLength + "px)";
    
    this.parentElement = parentElement;
    
    this.cages = [];
    
    this.callback = callback;
    
    this.timeKeeper = new Date();
    this.startTime = -1;
}

CoordinatePlane.prototype.createCages = function(bottomLeftX, bottomLeftY, xIncrement, yIncrement) {
    var rowsInit = bottomLeftY + ((this.rows - 1)*yIncrement), rowsEnd = bottomLeftY, colsInit = bottomLeftX, colsEnd = bottomLeftX + ((this.cols - 1)*xIncrement);
    
    console.log(rowsInit + " to " + rowsEnd);
    console.log(colsInit + " to " + colsEnd);
    
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
    
    for (var i = 0; i < this.cages.length; i++) {
        var currentCage = this.cages[i];
        var topLeftCornerX = ((currentCage.x * this.cageLength) - this.cageLength) + this.totalWidth/2;
        var topLeftCornerY = this.totalHeight/2 - ((currentCage.y * this.cageLength) + this.cageLength);
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
    this.coordinatePlane.parentElement.appendChild(canvas);
    
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
        toY = -yOffset;
    } else {
        toX = -xOffset;
        toY = yOffset;
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

var coord = new CoordinatePlane(space, 21, 21, f);
coord.createCages(-2, -2, 0.2, 0.2);
coord.drawVectorField();



