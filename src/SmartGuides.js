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
	    ['top', 'centerY', 'bottom'].forEach((key) => {
		snapper = { 'y': bounds[key],
			    'validTarget': valid(obj),
			    'condition': function(o) {return true},
			    'margin': 100
			  };
		snappers.push(snapper);
	    });
	    ['left', 'centerX', 'right'].forEach((key) => {
		snapper = { 'x': bounds[key],
			    'validTarget': valid(obj),
			    'condition': (o) => {return true},
			    'margin': 100
			  };
		snappers.push(snapper);
	    });

	}
	return snappers;

    }

						


    fabric.Canvas.prototype._smartGuidesAttached = true;

}

export {fabricAddSmartGuides}
