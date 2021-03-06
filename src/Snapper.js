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
    fabric.Canvas.prototype._registeredSnappers = [];
    fabric.Object.prototype.snapMargin =4;
    fabric.Object.prototype._snapX = [];
    fabric.Object.prototype._snapY = [];
    fabric.Canvas.prototype._snappedLines = [];
    
    fabric.Object.prototype.getBoundingCoords = function() {
        var tempStroke = this.strokeWidth;
        this.strokeWidth = 0;
        this.setCoords();
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

    /**
     * @function object.setByBoundingCoords
     * Sets object position and scale to fit inside the given bounding box. Does override the given center
     *
     */

    fabric.Object.prototype.setByBoundingCoords = function(coords) {
        var angle = this.angle > 180 ? 360-this.angle : this.angle;
        angle = angle > 90 ? 180 - angle : angle;
        
        var theta = fabric.util.degreesToRadians(angle),
            cos = fabric.util.cos(theta),
            sin = fabric.util.sin(theta),
            cos2t = fabric.util.cos(2*theta),
            boundHeight = coords.bottom-coords.top,
            boundWidth = coords.right-coords.left;
        var tempStroke = this.strokeWidth;
        this.strokeWidth = 0;
        coords.centerY = coords.top + (coords.bottom-coords.top)/2;
        coords.centerX = coords.left + (coords.right-coords.left)/2;
        if (0 !== cos2t) {
            this.scaleY = (boundHeight*cos-boundWidth*sin)/cos2t / this.height;
            this.scaleX = (boundWidth*cos-boundHeight*sin)/cos2t / this.width;
        } else {
            var aspect = (this.width*this.scaleX)/(this.height*this.scaleY),
                calcHeight = boundHeight/((aspect + 1)*cos);
            this.scaleY = calcHeight / this.height;
            this.scaleX = aspect *calcHeight / this.width;
        }



        this.setCoords();
        this.setPositionByOrigin(new fabric.Point(coords.centerX, coords.centerY),'center','center');

        this.strokeWidth = tempStroke;
        return coords;
    }
    
    fabric.Canvas.prototype._registerSnaps = function(provider) {
        if (provider && {}.toString.call(provider) === '[object Function]') {
            this._registeredSnappers.push(provider);
            return true;
        } else {
            return false;
        }
    }
    
    fabric.Object.prototype._prepareSnaps =  function() {
        var snaps= null,
            snap = null;
        var snapObj = null;
        this._snapX.length = Math.ceil(this.canvas.width);
        this._snapY.length = Math.ceil(this.canvas.height);
        this._snapX = this._snapX.fill(false,0,Math.ceil(this.canvas.width));
        this._snapY = this._snapY.fill(false,0,Math.ceil(this.canvas.height));
        for (var i =0;i< this.canvas._registeredSnappers.length; i++) {
            snaps = this.canvas._registeredSnappers[i]();
            for (var j = 0; j<snaps.length;j++) {
                snap = snaps[j];
                if (snap.validTarget && ! snap.validTarget(this)) {
                    continue;
                }
                
                if (snap.x || snap.y) {
                    snapObj = {pos:  snap.x ? snap.x : snap.y,
                               condition: snap.condition,
                               renderActive: snap.renderActive}
                } else {
                    continue;
                }
                var k;
                if (snap.x) {
                    if (0 > snap.x || this.canvas.width < snap.x) {
                        continue;

                    }
                    for (k = Math.floor(snap.x - snap.margin/2); k<Math.ceil(snap.x + snap.margin/2); k++) {
                        if (!this._snapX[k]) {
                            this._snapX[k] = [snapObj];
                        } else {
                            this._snapX[k].push(snapObj);
                        }
                    }
                } else {
                    if (0 > snap.y || this.canvas.height < snap.y) {
                        continue;
                    }
                    for (k = Math.floor(snap.y - snap.margin/2); k<Math.ceil(snap.y + snap.margin/2); k++) {
                        if (!this._snapY[k]) {
                            this._snapY[k] = [snapObj];
                        } else {
                            this._snapY[k].push(snapObj);
                        }
                    }
                    
                }
            }
        }
    }

    fabric.Object.prototype._updateSnappedLines= function(coords) {
        this.canvas._snappedLines.length = 0;
        ['top', 'centerY', 'bottom'].forEach((key) => {
            if (this._snapY[Math.round(coords[key])]) {
                this._snapY[Math.round(coords[key])].forEach((obj) =>{
                    if (Math.abs(obj.pos - coords[key])<0.1 && obj.condition(this)) {
                        this.canvas._snappedLines.push(obj);
                    }               
                });
            }
        });
        
        ['left', 'centerX', 'right'].forEach((key) => {
            if (this._snapX[Math.round(coords[key])]) {
                this._snapX[Math.round(coords[key])].forEach((obj) =>{
                    if (Math.abs(obj.pos - coords[key])<0.1 && obj.condition(this)) {
                        this.canvas._snappedLines.push(obj);
                    }
                });
            }
        });
    }

    
    fabric.Object.prototype._snapMove = function() {
        var coords = this.getBoundingCoords(),
            height = coords.bottom - coords.top,
            width = coords.right-coords.left,
            setCoords = coords,
            snap;

        //snap Y

        var snapped = false,i;
        if (this._snapY[Math.round(coords.top)]) {
            i = 0;
            snap = this._snapY[Math.round(coords.top)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.top = snap[i].pos;
                    setCoords.bottom = snap[i].pos +height;
                    snapped =true;
                }
                i++;
            }
        }
        if (!snapped && this._snapY[Math.round(coords.centerY)]) {
            i = 0;
            snap = this._snapY[Math.round(coords.centerY)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.top = snap[i].pos - height/2;
                    setCoords.bottom = snap[i].pos +height/2;
                    snapped =true;
                }
                i++;
            }
        }
        if (this._snapY[Math.round(coords.bottom)]) {
            i = 0;
            snap = this._snapY[Math.round(coords.bottom)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.top = snap[i].pos - height;
                    setCoords.bottom = snap[i].pos;
                    snapped =true;
                }
                i++;
            }   
        }

        //snap X
        snapped =false;
        if (this._snapX[Math.round(coords.left)]) {
            i = 0;
            snap = this._snapX[Math.round(coords.left)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.left = snap[i].pos;
                    setCoords.right = snap[i].pos +width;
                    snapped =true;
                }
                i++;
            }
        }
        if (!snapped && this._snapX[Math.round(coords.centerX)]) {
            i = 0;
            snap = this._snapX[Math.round(coords.centerX)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.left = snap[i].pos - width/2;
                    setCoords.right = snap[i].pos +width/2;
                    snapped =true;
                }
                i++;
            }
        }
        if (this._snapX[Math.round(coords.right)]) {
            i = 0;
            snap = this._snapX[Math.round(coords.right)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.left = snap[i].pos - width;
                    setCoords.right = snap[i].pos;
                    snapped =true;
                }
                i++;
            }   
        }

        this.setByBoundingCoords(setCoords);
        this._updateSnappedLines(setCoords);
    }

    fabric.Canvas.prototype._beforeSnapTranform = function(e) {
        if (e.target) {
            var object  =this.getObjectById(e.target.id)
            object._prepareSnaps();
            object.tempStroke =  object.strokeWidth;
            object.strokeWidth = 0;

            this._snappedLines.length=0;
        }
    }

    fabric.Object.prototype._afterScale = function() {
        this.strokeWidth = this.tempStroke;
    }
    
    fabric.Object.prototype._snapScale = function(e) {
        var coords = this.getBoundingCoords(),
            setCoords = coords,
            snap,
            snapped = false,
            i;
        // Snap Y
        if (this._snapY[Math.round(coords.top)]) {
            i = 0;
            snap = this._snapY[Math.round(coords.top)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.top = snap[i].pos;
                    snapped = true;
                }
                i++
            }
        }
        if (!snapped && this._snapY[Math.round(coords.centerY)]) {
            i = 0;
            snap = this._snapY[Math.round(coords.centerY)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    if (['tl','mt','tr'].includes(e.transform.corner)) {
                        // transforming from top
                        setCoords.top = snap[i].pos - (setCoords.bottom - snap[i].pos);
                    } else {
                        //transforming from bottom
                        setCoords.bottom = snap[i].pos + (snap[i].pos-setCoords.top);
                    }
                    snapped = true;
                }
                i++
            }
        }
        if (this._snapY[Math.round(coords.bottom)]) {
            i = 0;
            snapped = false;
            snap = this._snapY[Math.round(coords.bottom)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.bottom = snap[i].pos;
                    snapped = true;
                }
                i++
            }
        }       

        // Snap X
        snapped = false;
        if (this._snapY[Math.round(coords.left)]) {
            i = 0;
            snap = this._snapY[Math.round(coords.left)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.left = snap[i].pos;
                    snapped = true;
                }
                i++
            }
        }
        if (!snapped && this._snapY[Math.round(coords.centerX)]) {
            i = 0;
            snap = this._snapY[Math.round(coords.centerX)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    if (['tl','ml','bl'].includes(e.transform.corner)) {
                        // transforming from left
                        setCoords.left = snap[i].pos - (setCoords.right - snap[i].pos);
                    } else {
                        //transforming from right
                        setCoords.right = snap[i].pos + (snap[i].pos-setCoords.left);
                    }
                    snapped = true;
                }
                i++
            }
        }
        if (this._snapY[Math.round(coords.right)]) {
            i = 0;
            snapped = false;
            snap = this._snapY[Math.round(coords.right)];
            while (!snapped && i<snap.length) {
                if (snap[i].condition(this)) {
                    setCoords.right = snap[i].pos;
                    snapped = true;
                }
                i++
            }
        }       


        setCoords = this.setByBoundingCoords(setCoords);
        this._updateSnappedLines(setCoords);
    }

    /**
     * Render active guides
     */
    fabric.Canvas.prototype._renderActiveGuides = function() {
        var ctx = this.getSelectionContext();

        if (!this.getActiveObject()){
            return;
        }

        for (var i = 0 ; i< this._snappedLines.length; i++){
            var render = this._snappedLines[i].renderActive;
            if (render) {
                ctx.save();
                render(this.getActiveObject(),ctx)
                ctx.restore();
            }
        }
        
    }
    /**
     * Override the initialize function to add events
     */
    fabric.Canvas.prototype.initialize = (function(originalFn) {
        return function(...args) {
            originalFn.call(this, ...args);
            this.on({
                'mouse:down': this._beforeSnapTranform,
                'before:render': function() {
                    this.clearContext(this.contextTop);
                }.bind(this),
                'after:render':this._renderActiveGuides,
                
            });
            return this;
        };
    })(fabric.Canvas.prototype.initialize);
    
    /**
     * Add Object snapping listeners
     */
    fabric.Object.prototype.doesSnap = function() {
        this.on({'moving':this._snapMove,
                 'scaling': this._snapScale,
                 'scaled':this._afterScale});
    }

}

export {fabricAddSnapper};

