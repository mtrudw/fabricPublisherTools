import { fabric } from 'fabric';

function fabricAddObjectIDs() {
    fabric.Canvas.prototype.id = 0;


    fabric.Canvas.prototype.add = (function(originalFn) {
	return function(...args) {
	    args.forEach(obj => {
		if (!obj.id) {
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
