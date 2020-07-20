import {fabric} from 'fabric';
import {fabricAddSnapper} from './Snapper.js';

function fabricAddSmartGuides() {
    if (fabric.Canvas.prototype._smartGuidesAttached) {
	return;
    }

    if (!fabric.Canvas.prototype._snapperAttached) {
	fabricAddSnapper();
    }

        

    fabric.Canvas.prototype._getSmartGuides = function() {
	var canvasObjects = this.getObjects(),
	    bounds,
	    snapper,
	    snappers = [];
	
	
	for (var i = canvasObjects.length; i--;) {
	    var obj = canvasObjects[i];
	    bounds = obj.getBoundingCoords();
	    function valid(obj) {
		return (o) =>{return o.id !== obj.id}
	    }
	    
	    function renderHorizontal(bounds,center) {
		return (target) => {
		    var coords ={left:0,right:0,color:'red'}
		    var targetBounds = target.getBoundingCoords();

		    if (center) {
			coords.left = Math.min(targetBounds.centerX,bounds.centerX);
			coords.right = Math.max(targetBounds.centerX,bounds.centerX);
		    } else {
			coords.left = Math.min(targetBounds.left,bounds.left);
			coords.right = Math.max(targetBounds.right,bounds.right);
		    }
		    return coords;
		}
	    }

	    function renderVertical(bounds,center) {
		return (target) => {
		    var coords ={top:0,bottom:0,color:'red'}
		    var targetBounds = target.getBoundingCoords();

		    if (center) {
			coords.top = Math.min(targetBounds.centerY,bounds.centerY);
			coords.bottom = Math.max(targetBounds.centerY,bounds.centerY);
		    } else {
			coords.top = Math.min(targetBounds.top,bounds.top);
			coords.bottom = Math.max(targetBounds.bottom,bounds.bottom);
		    }
		    return coords;
		}
	    }

	    ['top', 'centerY', 'bottom'].forEach((key) => {
		snapper = { 'y': bounds[key],
			    'validTarget': valid(obj),
			    'condition': function(o) {return true},
			    'margin': 10,
			    'renderActive': renderHorizontal(bounds, 'centerY' == key),
			  };
		snappers.push(snapper);
	    });
	    ['left', 'centerX', 'right'].forEach((key) => {
		snapper = { 'x': bounds[key],
			    'validTarget': valid(obj),
			    'condition': (o) => {return true},
			    'margin': 10,
			    'renderActive': renderVertical(bounds, 'centerX' == key),
			  };
		snappers.push(snapper);
	    });

	}
	return snappers;

    }

						


    fabric.Canvas.prototype._smartGuidesAttached = true;

}

export {fabricAddSmartGuides}
