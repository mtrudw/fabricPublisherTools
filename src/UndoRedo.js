import { fabric } from 'fabric';
import {fabricAddObjectIDs} from './ObjectIds.js'

const propertiesToWatch = ['stroke','fill'];
const eventsToWatch =   ['object:modified', 'object:moved', 'object:rotated','object:skewed', 'object:added']
function fabricAddUndoRedo() {
    if (0 !== fabric.Canvas.prototype.id) {
	fabricAddObjectIDs();
    }
    fabric.Canvas.prototype.historyStack = [];
    fabric.Canvas.prototype.redoStack = [];
    fabric.Canvas.prototype.recordHistory = true;
    fabric.Canvas.prototype.redoing = false;

    fabric.Canvas.prototype._pushToHistory = function(event) {
	if (this.recordHistory) {
	    this.historyStack.push(event);
	    if (!this.redoing) {
		this.redoStack.length = 0;
	    }
	}
    }
    
}


export {fabricAddUndoRedo}
