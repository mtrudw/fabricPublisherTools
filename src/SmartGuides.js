import {fabric} from 'fabric';
import {fabricAddSnapper} from './Snapper.js';

function fabricAddSmartGuides() {
    if (fabric.Canvas.prototype._smartGuidesAttached) {
        return;
    }

    if (!fabric.Canvas.prototype._snapperAttached) {
        fabricAddSnapper();
    }

    function renderHorizontal(bounds,key) {
        return (target,ctx) => {
            var left=0,right=0,color='red',
                targetBounds = target.getBoundingCoords(),
                compare = bounds[key];
            if (0.1 >= Math.abs(compare - targetBounds.centerY)) {
                left = Math.min(targetBounds.centerX,bounds.centerX);
                right = Math.max(targetBounds.centerX,bounds.centerX);
                color = 'blue';
            } else {
                left = Math.min(targetBounds.left,bounds.left);
                right = Math.max(targetBounds.right,bounds.right);
            }

            ctx.lineWidth = 1;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(left,bounds[key]);
            ctx.lineTo(right,bounds[key]);
            ctx.stroke();
        }
    }

    function renderVertical(bounds,key) {
        return (target,ctx) => {
            var top= 0,bottom=0,color='red',
                targetBounds = target.getBoundingCoords(),
                compare = bounds[key]
            if (0.1> Math.abs(compare -targetBounds.centerX)) {
                top = Math.min(targetBounds.centerY,bounds.centerY);
                bottom = Math.max(targetBounds.centerY,bounds.centerY);
                color = 'blue';
            } else {
                top = Math.min(targetBounds.top,bounds.top);
                bottom = Math.max(targetBounds.bottom,bounds.bottom);
            }

            ctx.lineWidth = 1;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(bounds[key],top);
            ctx.lineTo(bounds[key],bottom);
            ctx.stroke();
        }
    }

    function renderCanvasLine(direction,canvas) {
        return (target,ctx) => {
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'green';
            ctx.beginPath();
            if ('x' == direction) {
                ctx.moveTo(canvas.width/2,0)
                ctx.lineTo(canvas.width/2,canvas.height)
            } else if ('y' == direction) {
                ctx.moveTo(0,canvas.height/2)
                ctx.lineTo(canvas.width,canvas.height/2)
            }
            ctx.stroke();
        }
    }
    
    function valid(obj) {
        return (o) =>{return o.id !== obj.id}
    }

    fabric.Canvas.prototype._getSmartGuides = function() {
        var canvasObjects = this.getObjects(),
            bounds,
            snapper,
            snappers = [];

        // Objects
        for (var i = canvasObjects.length; i--;) {
            var obj = canvasObjects[i];
            bounds = obj.getBoundingCoords();
    
            ['top', 'centerY', 'bottom'].forEach((key) => {
                snapper = { 'y': bounds[key],
                            'validTarget': valid(obj),
                            'condition': () => {return true},
                            'margin': 10,
                            'renderActive': renderHorizontal(bounds, key),
                          };
                snappers.push(snapper);
            });
            ['left', 'centerX', 'right'].forEach((key) => {
                snapper = { 'x': bounds[key],
                            'validTarget': valid(obj),
                            'condition': () => {return true},
                            'margin': 10,
                            'renderActive': renderVertical(bounds, key),
                          };
                snappers.push(snapper);
            });

        }
        // Canvas

        snappers.push({
            'x': this.width/2,
            'validTarget': () => {return true},
            'condition' : () => {return true},
            'margin' : 10,
            'renderActive' : renderCanvasLine('x',this)
        });
        snappers.push({
            'y': this.height/2,
            'validTarget': () => {return true},
            'condition' : () => {return true},
            'margin' : 10,
            'renderActive' : renderCanvasLine('y',this)
        });
        
        return snappers;

    }

    


    fabric.Canvas.prototype._smartGuidesAttached = true;

}

export {fabricAddSmartGuides}
