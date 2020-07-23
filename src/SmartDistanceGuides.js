import {fabric} from 'fabric';
import {fabricAddSnapper} from './Snapper.js';

function fabricAddSmartDistance() {
    if (fabric.Canvas.prototype._smartDistanceAttached) {
        return;
    }
    if (!fabric.Canvas.prototype._snapperAttached) {
        fabricAddSnapper()
    }

    var margin = 10,
        requireIntersect = true;
    
    /**
     * Check for Obstructions while enforcing, that obj1 is left or top of obj2
     */
    function noObstruction(obj1, obj2, horizontal, canvas) {
        var intersectRect,
            obj1Bounds = obj1.getBoundingCoords(),
            obj2Bounds = obj2.getBoundingCoords();
        if (horizontal) {
            intersectRect = new fabric.Rect({
                left: obj1Bounds.right + margin + 1,
                // leave some breathing space at top and bottom
                top: Math.max(obj1Bounds.top, obj2Bounds.top) + margin,
                width: obj2Bounds.left - obj1Bounds.right - 2 * margin - 2,
                height: Math.min(obj1Bounds.bottom, obj2Bounds.bottom) - Math.max(obj1Bounds.top, obj2Bounds.top) - 2 * margin - 2
            });
        } else {
            //TODO implement vertical
            return false;
        }

        var objects = canvas.getObjects();
        for (var i = 0; i < objects.length; i++) {
            if (intersectRect.intersectsWithObject(objects[i])) {
                return false;
            }
        }
        return true;

    }
    function inLine(obj1, obj2, horizontal, canvas) {
        var intersectRect;
        if (horizontal) {
            intersectRect = new fabric.Rect({
                left: -50,
                top: obj1.top,
                width: canvas.width + 100,
                height: obj1.height
            });
        } else {
            // TODO implement vertical
            return false;
        }
        return intersectRect.intersectsWithObject(obj2);
    }

    /**
     * 
     */
    function valid(obj1,obj2,obj) {
        return (o) => {
            return o.id !== obj.id && o.id !== obj1.id && o.id !== obj2.id;
        }
    }

    function createSnapper(target,dist,horizontal,obj1,obj2) {
	if (horizontal) {

	} else {
	    //TODO
	    return null;
	}
	
    }
    
    fabric.Canvas._smartDistanceAttached = true;
}

export {fabricAddSmartDistance};
