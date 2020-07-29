import {fabric} from 'fabric';
import {fabricAddSnapper} from './Snapper.js';

function fabricAddSmartDistance() {
    if (fabric.Canvas.prototype._smartDistanceAttached) {
        return;
    }
    if (!fabric.Canvas.prototype._snapperAttached) {
        fabricAddSnapper()
    }

    var margin = 30,
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
                left: obj1Bounds.right + 2,
                top: Math.max(obj1Bounds.top, obj2Bounds.top) + 2,
                width: obj2Bounds.left - obj1Bounds.right - 4,
                height: Math.min(obj1Bounds.bottom, obj2Bounds.bottom) - Math.max(obj1Bounds.top, obj2Bounds.top) - 4 
            });
        } else {
            intersectRect = new fabric.Rect({
                left: Math.max(obj1Bounds.left,obj1Bounds.left) + 2,
                top: obj1Bounds.bottom + 2,
                width: Math.min(obj1Bounds.right,obj2Bounds.right) - Math.min(obj1Bounds.left,obj2Bounds.left) -4,
                height: obj2Bounds.top - obj1Bounds.bottom -4
            })
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
            intersectRect = new fabric.Rect({
                left : obj1.left,
                top : -50,
                width : obj1.width,
                height : canvas.height+100
            })
        }
        return intersectRect.intersectsWithObject(obj2);
    }

    /**
     * 
     */
    function valid(obj1,obj2,obj) {
        return (o) => {
            var valid = o.id !== obj.id && o.id !== obj1.id && o.id !== obj2.id;
            return  valid;
        }
    }
    /**
     * Canvas Bounds Ids: left = -4, top= -3 right = -2, bottom = -1
     * 
     */
    function checkCondition(obj1,obj2,target,key,canvas) {
        return (o) => {
            var matchKey,
                matchDist,
                targetBounds = target.getBoundingCoords(),
                obj1Bounds = obj1.getBoundingCoords(),
                obj2Bounds = obj2.getBoundingCoords(),
                objectBounds = o.getBoundingCoords();
            
            // match horizontal
            if ('left' == key || 'right' == key) {
                matchKey = 'left' == key ? 'right' : 'left';

                //get Distance
                matchDist = obj2Bounds.left - obj1Bounds.right;

                //check if correct edge is matched
                if (Math.abs(Math.abs(targetBounds[matchKey] - objectBounds[key])-matchDist) > margin) {
                    return false;
                }

                if (requireIntersect) {
                    if ('left' == key && (!inLine(target,o,true,canvas) || !noObstruction(target,o,true,canvas))) {
                        return false;
                    }
                    if ('right' == key && (!inLine(o,target,true,canvas) || !noObstruction(o,target,true,canvas))) {
                        return false;
                    }
                }
                return true;
            } else {
                matchKey = 'top' == key ? 'bottom' : 'top';
                if (Math.abs(Math.abs(targetBounds[matchKey] - objectBounds[key])-matchDist) > margin) {
                    return false;
                }
                if (requireIntersect) {
                    if ('top' == key && (!inLine(target,o,false,canvas) || !noObstruction(target,o,false,canvas))) {
                        return false;
                    }
                    if ('bottom' == key && (!inLine(o,target,false,canvas) || !noObstruction(o,target,false,canvas))) {
                        return false;
                    }
                }
                return true;
            }
        }
    }

    function renderDistance(obj1,obj2,target,key) {
        return (o,ctx) => {
            var x1, x2, y1, y2;
            // base line
            if ('left'== key || 'right' == key) {
                x1 = obj1.getBoundingCoords().right;
                y1 = obj1.getBoundingCoords().bottom - 20;

                x2 = obj2.getBoundingCoords().left;
                y2 = obj2.getBoundingCoords().bottom - 20;
                y1 =  Math.min(y1,y2);
                y2 = y1;
            } else {
                x1 = obj1.getBoundingCoords().left + 20;
                y1 = obj1.getBoundingCoords().bottom;

                x2 = obj2.getBoundingCoords().left +20;
                y2 = obj2.getBoundingCoords().top;
                x1 = Math.max(x1,x2);
                x2 = x1;

            }


            ctx.lineWidth = 1;
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            if ('left' == key) {
                x2 = o.getBoundingCoords().left;
                y2 = o.getBoundingCoords().bottom - 20;
                x1 = target.getBoundingCoords().right;
                y1 = target.getBoundingCoords().bottom - 20;
                y1 = Math.min(y1,y2);
                y2 = y1;
            } else if ('right' == key) {
                x1 = o.getBoundingCoords().right;
                y1 = o.getBoundingCoords().bottom - 20;
                
                x2 = target.getBoundingCoords().left;
                y2 = target.getBoundingCoords().bottom - 20;
                y1 = Math.min(y1,y2);
                y2 = y1;
            } else if ('top' == key) {
                x2 = o.getBoundingCoords().left+20;
                y2 = o.getBoundingCoords().top;

                x1 = target.getBoundingCoords().left+20;
                y1 = target.getBoundingCoords().bottom;
                x1 = Math.max(x1,x2);
                x2 = x1;
            } else if ('bottom' == key) {
                x1 = o.getBoundingCoords().left+20;
                y1 = o.getBoundingCoords().bottom;

                x2 = target.getBoundingCoords().left+20;
                y2 = target.getBoundingCoords().top;
                x1 = Math.max(x1,x2);
                x2 = x1;
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    /**
     * Expect obj1 < obj2
     */
    function createSnappers(target,obj1,obj2,canvas,keys) {
        var targetBounds = target.getBoundingCoords(),
            obj1Bounds = obj1.getBoundingCoords(),
            obj2Bounds = obj2.getBoundingCoords(),
            dist,
            snappers = [];
        if (keys.includes('left')) {
            dist = obj2Bounds.left - obj1Bounds.right;
            snappers.push({x: targetBounds.right + dist,
                           validTarget: valid(obj1,obj2,target),
                           condition: checkCondition(obj1,obj2,target,'left',canvas),
                           margin: margin,
                           renderActive: renderDistance(obj1,obj2,target,'left')});
        }
        if (keys.includes('right')) {
            dist = obj2Bounds.left - obj1Bounds.right;
            snappers.push({x: targetBounds.left - dist,
                           validTarget: valid(obj1,obj2,target),
                           condition: checkCondition(obj1,obj2,target,'right',canvas),
                           margin: margin,
                           renderActive: renderDistance(obj1,obj2,target,'right')});
        }
        if (keys.includes('top')) {
            dist = obj2Bounds.top - obj1Bounds.bottom;
            snappers.push({y: targetBounds.bottom + dist,
                           validTarget: valid(obj1,obj2,target),
                           condition: checkCondition(obj1,obj2,target,'top',canvas),
                           margin: margin,
                           renderActive: renderDistance(obj1,obj2,target,'top')});
        }
        if (keys.includes('bottom')) {
            dist = obj2Bounds.top - obj1Bounds.bottom;
            snappers.push({y: targetBounds.top - dist,
                           validTarget: valid(obj1,obj2,target),
                           condition: checkCondition(obj1,obj2,target,'bottom',canvas),
                           margin: margin,
                           renderActive: renderDistance(obj1,obj2,target,'bottom')});

        }

        return snappers;
        
    }

    fabric.Canvas.prototype._getSmartDistanceGuides = function() {
        var objects = this.getObjects(),
            snappers = [],
            canvasLeft = false, canvasRight = false,canvasTop= false, canvasBottom = false,
            borderRectLeft = new fabric.Rect({ left: -2, top: 0, width: 2, height: this.height }),
            borderRectRight = new fabric.Rect({left: this.width, top: 0, width: 2, height: this.height }),
            borderRectTop = new fabric.Rect({ left: 0, top: -2, width: this.width, height: 2}),
            borderRectBottom = new fabric.Rect({left: 0, top: this.height, width: this.width, height:2});

        borderRectLeft.id = -4;
        borderRectRight.id = -2;
        
        for (var i = 0; i < objects.length; i++)  {
            canvasLeft = false;
            canvasRight = false;
            canvasTop= false;
            canvasBottom = false;
            
            if (noObstruction(borderRectLeft,objects[i],true,this)) {
                snappers.push(...createSnappers(borderRectRight,borderRectLeft,objects[i],this,['right']));
                snappers.push(...createSnappers(objects[i],borderRectLeft,objects[i],this,['left']));

                canvasLeft = true;
            }
            
            if (noObstruction(objects[i],borderRectRight,true,this)) {
                snappers.push(...createSnappers(borderRectLeft,objects[i],borderRectRight,this,['left']));
                snappers.push(...createSnappers(objects[i],objects[i],borderRectRight,this,['right']));
                canvasRight = true;
            }
            
            if (noObstruction(borderRectTop,objects[i],false,this)) {
                snappers.push(...createSnappers(borderRectBottom,borderRectTop,objects[i],this,['bottom']));
                snappers.push(...createSnappers(objects[i],borderRectTop,objects[i],this,['top']));
                canvasTop =true;
            }

            if (noObstruction(objects[i],borderRectBottom,false,this)) {
                snappers.push(...createSnappers(borderRectTop,objects[i],borderRectBottom,this,['top']));
                snappers.push(...createSnappers(objects[i],objects[i],borderRectBottom,this,['bottom']));
                canvasBottom = true;
            }
                
            for (var j = 0; j < objects.length; j++) {
                if (i == j) {continue;}
                if (canvasLeft) {
                    snappers.push(...createSnappers(objects[j],borderRectLeft,objects[i],this,['left','right']));
                }
                if (canvasRight) {
                    snappers.push(...createSnappers(objects[j],objects[i],borderRectRight,this,['left','right']));
                }
                if (canvasTop) {
                    snappers.push(...createSnappers(objects[j],borderRectTop,objects[i],this,['top','bottom']));
                }
                if (canvasBottom) {
                    snappers.push(...createSnappers(objects[j],objects[i],borderRectBottom,this,['top','bottom']));
                }

                
                if (inLine(objects[i],objects[j],true,this) && noObstruction(objects[i],objects[j],true,this)) {
                    snappers.push(...createSnappers(borderRectLeft,objects[i],objects[j],this,['left']));
                    snappers.push(...createSnappers(borderRectRight,objects[i],objects[j],this,['right']));
                    for (var k = 0; k<objects.length; k++) {
                        snappers.push(...createSnappers(objects[k],objects[i],objects[j],this,['left','right']));
                    }
                }
                if (inLine(objects[i],objects[j],false,this) && noObstruction(objects[i],objects[j],false,this)) {
                    snappers.push(...createSnappers(borderRectTop,objects[i],objects[j],this,['top']));
                    snappers.push(...createSnappers(borderRectBottom,objects[i],objects[j],this,['bottom']));
                    for (var k = 0; k<objects.length; k++) {
                        snappers.push(...createSnappers(objects[k],objects[i],objects[j],this,['top','bottom']));
                    }
                }

            }
        }
        return snappers;
        
    }
    fabric.Canvas._smartDistanceAttached = true;
}

export {fabricAddSmartDistance};
