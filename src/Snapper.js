import {fabric} from 'fabric';
import {fabricAddObjectIDs} from './ObjectIds.js'

function fabricAddSnapper() {
    
    if (fabric.Canvas.prototype._snapperAttached) {
	return;
    }
    if (0 !== fabric.Canvas.prototype.id) {
	fabricAddObjectIDs();
    }

    fabric.Canvas.prototype._snapperAttached = true;
    fabric.Canvas.prototype.snapPoints =[];
    fabric.Object.prototype.snapMargin =4;
    fabric.Object.prototype.lastValidBounds = null;

    fabric.Object.prototype.getBoundingCoords = function(calc) {
	var tempStroke = this.strokeWidth;
	this.strokeWidth = 0;
	if (calc) {
	    this.setCoords();
	}
	var center = this.getCenterPoint();

	var bounds = {'left': Math.min(this.aCoords.tl.x,this.aCoords.tr.x,this.aCoords.bl.x,this.aCoords.br.x),
		      'top': Math.min(this.aCoords.tl.y,this.aCoords.tr.y,this.aCoords.bl.y,this.aCoords.br.y),
		      'bottom': Math.max(this.aCoords.tl.y,this.aCoords.tr.y,this.aCoords.bl.y,this.aCoords.br.y),
		      'right':  Math.max(this.aCoords.tl.x,this.aCoords.tr.x,this.aCoords.bl.x,this.aCoords.br.x),
		      'centerX': center.x,
		      'centerY': center.y};
	this.strokeWidth = tempStroke;
	return bounds;
    }

    fabric.Object.prototype.setByBoundingCoords = function(coords) {
	var theta = fabric.util.degreesToRadians(this.angle),
            cos = fabric.util.cos(theta),
            sin = fabric.util.sin(theta),
	    cos2t = fabric.util.cos(2*theta),
	    boundHeight = coords.bottom-coords.top,
	    boundWidth = coords.right-coords.left;
	var tempStroke = this.strokeWidth;
	this.strokeWidth = 0;
	this.scaleY = (boundHeight*cos-boundWidth*sin)/cos2t / this.width;
	this.scaleX = (boundWidth*cos-boundHeight*sin)/cos2t / this.height;

	this.setCoords();
	this.setPositionByOrigin(new fabric.Point(coords.centerX, coords.centerY),'center','center');

	this.strokeWidth = tempStroke;
    }
    
    fabric.Object.prototype.getSnapPoints = function() {
	return {'h':[400,800] , 'v':[400,800]};
    }

    
    
    fabric.Object.prototype._snapMove = function() {
	var coords = this.getBoundingCoords(true),
	    snaps = this.getSnapPoints(),
	    height = coords.bottom - coords.top,
	    width = coords.right-coords.left;
	var setCoords = coords;

	function inRange (x1,x2,range) {
	    return Math.abs(x1 - x2) <= range;
	}


	//snap Y
	if (inRange(coords.top,snaps.v[0],this.snapMargin)) {
	    setCoords.top = snaps.v[0];
	    setCoords.bottom = snaps.v[0] +height;
	    setCoords.centerY = snaps.v[0] + height/2;
	}
	else if (inRange(coords.centerY,snaps.v[0],this.snapMargin)) {
	    setCoords.top = snaps.v[0] - height/2;
	    setCoords.bottom = snaps.v[0] + height/2;
	    setCoords.centerY = snaps.v[0];
	} else if (inRange(coords.bottom,snaps.v[0],this.snapMargin)) {
	    setCoords.top = snaps.v[0] - height;
	    setCoords.bottom = snaps.v[0];
	    setCoords.centerY = snaps.v[0]-height/2;
	}

	//snap X
	if (inRange(coords.left,snaps.h[0],this.snapMargin)) {
	    setCoords.left = snaps.h[0];
	    setCoords.right = snaps.h[0] +width;
	    setCoords.centerX = snaps.h[0] + width/2;
	}
	else if (inRange(coords.centerX,snaps.h[0],this.snapMargin)) {
	    setCoords.left = snaps.h[0] - width/2;
	    setCoords.right = snaps.h[0] + width/2;
	    setCoords.centerX = snaps.h[0];
	} else if (inRange(coords.right,snaps.h[0],this.snapMargin)) {
	    setCoords.left = snaps.h[0] - width;
	    setCoords.right = snaps.h[0];
	    setCoords.centerX = snaps.h[0]-width/2;
	}
	    
	this.setByBoundingCoords(setCoords);
    }

    fabric.Canvas.prototype._beforeSnapTranform = function(e) {
	var object  =this.getObjectById(e.target.id)
	object.lastValidBounds = object.getBoundingCoords(true);
	console.log(object.lastValidBounds);
    }
    
    fabric.Object.prototype._snapScale = function() {
	var coords = this.getBoundingCoords(true),
	    snaps = this.getSnapPoints(),
	    snapped = false,
	    setCoords = coords,
	    height = 0;
	

	function inRange (x1,x2,range) {
	    return Math.abs(x1 - x2) <= range;
	}

	if (inRange(coords.top,snaps.v[0],this.snapMargin)) {
	    setCoords.top = snaps.v[0];
	}	
	this.setByBoundingCoords(setCoords);

    }
}

export {fabricAddSnapper};
