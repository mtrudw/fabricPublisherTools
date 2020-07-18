import { fabric } from 'fabric';

/**
* Adds a unique id to every object added to a canvas and 
* provides a function to retrieve an object by its id.
* Ids are exported to JSON and stay consistent during load.
*
**/
function fabricAddObjectIDs() {
    fabric.Canvas.prototype.id = 0;


    fabric.Canvas.prototype.add = (function(originalFn) {
	return function(...args) {
	    args.forEach(obj => {
		if (null == obj.id) {
		    obj.id = this.id++;
		}
	    });
	    originalFn.call(this, ...args)
	    
	    return this
	};
    })(fabric.Canvas.prototype.add);

    
    fabric.Object.prototype.toObject = (function(originalFn) {
	return function(properties) {
	    return fabric.util.object.extend(originalFn.call(this, properties), {
		id: this.id
	    });
	};
    })(fabric.Object.prototype.toObject);


    /** 
     * Function of every new fabric.Canvas. 
     * Returns the fabric object with a given id, return null if no object matching the id is found
     *
     * @function getObjectById
     * @param {int} id 
     * id to look for
     */
    fabric.Canvas.prototype.getObjectById = function(id) {
	var object = null,
	    objects = this.getObjects();
	for (var i = 0, len = this.size(); i < len; i++) {
	    if (id === objects[i].id) {
		object = objects[i];
		break;
	    }
	}

	return object;
    };

    fabric.Canvas.prototype.toJSON = (function(toJSON) {
	return function(propertiesToInclude) {
	    return fabric.util.object.extend(toJSON.call(this, propertiesToInclude), {
		id: this.id,
	    });
	}
    })(fabric.Canvas.prototype.toJSON);
}

export {fabricAddObjectIDs};
