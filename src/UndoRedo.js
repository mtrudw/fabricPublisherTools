import { fabric } from 'fabric';
import {fabricAddObjectIDs} from './ObjectIds.js'


const propertiesToWatch = ['stroke','fill'];

/**
* Adds Undo and Redo capabilities to fabric.Canvas. Changes are logged as actions and will be 
* serialized and deserialized with the canvas.
* Calling canvas.undo() and canvas.redo() will undo or redo as long as there are actions on the respective stack.
* Performing an action will reset the redo history. 
*
* Needs ObjectIds. It will add ObjectIds if they are not present.
*
* @param {array} properties
* List of properties to be watched when object.set is called. Uses defaults if not passed
* Use {@link object.set} with forceHistory if unwatched property is set thorugh code
*/
function fabricAddUndoRedo(properties) {
    if (0 !== fabric.Canvas.prototype.id) {
	fabricAddObjectIDs();
    }

    if (fabric.Canvas.prototype._undoRedoAttached) {
	if  (properties) {
	    fabric.Object.prototype.historyWatch =properties;
	} else {
	    fabric.Object.prototype.historyWatch = propertiesToWatch;
	}
	return;
    }
    
    fabric.Canvas.prototype._undoRedoAttached = true;
    fabric.Canvas.prototype.historyStack = [];
    fabric.Canvas.prototype.redoStack = [];
    fabric.Canvas.prototype.recordHistory = true;
    fabric.Canvas.prototype.redoing = false;

    if  (properties) {
	fabric.Object.prototype.historyWatch =properties;
    } else {
	fabric.Object.prototype.historyWatch = propertiesToWatch;
    }

    /**
     * Adds and Event to the history stack. Clears the redo stack if needed
     *
     */
    fabric.Canvas.prototype._pushToHistory = function(event) {
	if (this.recordHistory) {
	    this.historyStack.push(event);
	    if (!this.redoing) {
		this.redoStack.length = 0;
	    }
	}
    };

    /**
     * Translated fabric event into a undo event. Saving changed values before and after the 
     * action is performed.
     * Events for add and remove need to be prepared beforehand
     */
   
    fabric.Canvas.prototype._buildHistoryEvent = function(event) {
	var id = event.target.id;

	var historyEvent = {};
	historyEvent.id = id;
	historyEvent.action = event.transform.action;
	historyEvent.before = [];
	historyEvent.after = [];

	if ('added' === historyEvent.action) {
	    historyEvent.after = event.target.toObject();
	    return historyEvent;
	}
	
	if ('removed' === historyEvent.action) {
	    historyEvent.before = event.target.toObject();
	    return historyEvent;
	}

	Object.keys(event.transform.original).forEach(function(key, index) {
	    if (event.transform.original[key] !== event.transform.target[key]) {
		if ('originX' !== key && 'originY' !== key) {
		    historyEvent.before.push({
			[key]: event.transform.original[key]
		    });
		    historyEvent.after.push({
			[key]: event.transform.target[key]
		    });
		}
	    }
	});
	return historyEvent;
    };

    /**
     * Undoes the last action on history stack if one is available
     * and pushes that action to redo stack
     */
    fabric.Canvas.prototype.undo = function() {
	var event = this.historyStack.pop();
	var obj = null;
	this.recordHistory = false;

	if (event) {
	    this.redoStack.push(event);
	    if ('added' == event.action) {
		obj = this.getObjectById(event.id);
		this.remove(obj);
		this.renderAll()
	    } else if ('removed' == event.action) {
		fabric.util.enlivenObjects([event.before], function(enlivenedObjects) {
		    enlivenedObjects.forEach(function(obj) {
			this.add(obj);
		    }.bind(this));
		    this.renderAll();
		}.bind(this));
	    } else {
		obj = this.getObjectById(event.id);
		Object.assign(obj, ...event.before);
		obj.set('dirty',true);
		obj.setCoords();
		this.renderAll();
	    }
	}
	this.recordHistory = true;
    };

    /**
     * Redoes an action if one is available on the redo stack and pushes it back to the undo history
     */
    fabric.Canvas.prototype.redo = function() {
	var event = this.redoStack.pop();
	var obj = null;
	this.redoing = true;
	
	if (event) {
	    this._pushToHistory(event);
	    this.recordHistory = false;
	    if ('added' == event.action) {
		fabric.util.enlivenObjects([event.after], function(enlivenedObjects) {
		    enlivenedObjects.forEach(function(obj) {
			this.add(obj);
		    }.bind(this));
		    this.renderAll();
		}.bind(this));
	    } else if ('removed' == event.action) {
		obj = this.getObjectById(event.id);
		this.remove(obj);
		this.renderAll()
	    } else {
		obj = this.getObjectById(event.id);
		Object.assign(obj, ...event.after);
		obj.set('dirty',true);
		obj.setCoords();
		this.renderAll();
	    }
	}
	this.redoing = false;
	this.recordHistory = true;
    };

    /**
     * Eventlistener to prepare object added event and push it to history
     */
    fabric.Canvas.prototype._undoRedoAddedListener = function(e) {
	e.transform = {
	    action: 'added'
	};
	this._pushToHistory(this._buildHistoryEvent(e));
    };

    /**
     * Eventlistener to prepare object removed event and push it to history
     */
    fabric.Canvas.prototype._undoRedoRemovedListener = function(e) {
	e.transform = {
	    action: 'removed'
	};
	this._pushToHistory(this._buildHistoryEvent(e));
    };

    /**
     * Eventlistener to push general modification event to history
     */
    fabric.Canvas.prototype._undoRedoModifiedListener = function(e) {
	this._pushToHistory(this._buildHistoryEvent(e));
    };


    /**
     * Override the initialize function to add events
     */
    fabric.Canvas.prototype.initialize = (function(originalFn) {
	return function(...args) {
	    originalFn.call(this, ...args);
	    this.on({
		'object:modified': this._undoRedoModifiedListener,
		'object:added': this._undoRedoAddedListener,
		'object:removed': this._undoRedoRemovedListener,
	    });

	    return this;
	};
    })(fabric.Canvas.prototype.initialize);


    
    fabric.Canvas.prototype.toJSON = (function(toJSON) {
	return function(propertiesToInclude) {
	    return fabric.util.object.extend(toJSON.call(this, propertiesToInclude), {
		historyStack: this.historyStack,
		redoStack: this.redoStack,
	    });
	}
    })(fabric.Canvas.prototype.toJSON);


    /**
     * Adds history logging to fabric.Object.set so all value changes can be logged
     *
     * @function object.set
     * @param {string} key (fabric) key to be set
     * @param {string} value (fabric) value to be set
     * @param {boolean} forceHistory push to history even if logging is off or key is not on watch list
     */
    fabric.Object.prototype._set = (function(originalFn) {
	return function(key, value, forceHistory) {
	    if (forceHistory || (this.historyWatch.includes(key) && this.canvas && this[key] !== value)) {
		this.canvas._pushToHistory({
		    'action':'set', 
		    'id': this.id,
		    'before':[
			{[key]: this[key]},
		    ],
		    'after':[
			{[key]: value},
		    ],
		});
		
	    }
	    originalFn.call(this, key, value);
	    return this;
	}
    })(fabric.Object.prototype._set);
}


export {fabricAddUndoRedo}
