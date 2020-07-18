import {fabric} from 'fabric';
import {fabricAddUndoRedo} from '../src/index.js';

var canvas;

beforeAll(() => {
    fabricAddUndoRedo();
    document.body.innerHTML =
	'<canvas id="c"></canvas>'

});

beforeEach(() => {
    canvas = new fabric.Canvas('c');
});

test('inits History', () => {
    expect(canvas.id).toBeDefined();
    expect(canvas.historyStack).toBeDefined();
    expect(canvas.redoStack).toBeDefined();
    expect(canvas.recordHistory).toBeTruthy();
    expect(canvas.redoing).toBeFalsy();
    
});

test('pushes to History Stack', () => {
    var event ='test';
    canvas.recordHistory = true;
    canvas._pushToHistory(event);
    expect(canvas.historyStack).toContain('test');

    canvas.recordHistory = false;
    event = 'test2';
    canvas._pushToHistory(event);
    expect(canvas.historyStack).toContain('test');
    expect(canvas.historyStack).not.toContain('test2');
});

test('test add event undo and redo',() => {
    canvas.historyStack=[];
    canvas.redoStack=[];
    var rect = new fabric.Rect()

    canvas.add(rect);
    var jsonInit = canvas.toJSON();
    expect(jsonInit).toMatchSnapshot();
    
    canvas.undo();
    var jsonUndo = canvas.toJSON();
    expect(jsonUndo).toMatchSnapshot();

    canvas.redo();
    var jsonRedo = canvas.toJSON();
    expect(jsonRedo).toEqual(jsonInit);
    
});

test('test remove event undo and redo',() => {
    canvas.historyStack=[];
    canvas.redoStack=[];
    var rect = new fabric.Rect()

    canvas.add(rect);
    canvas.remove(rect);
    var jsonInit = canvas.toJSON();
    expect(jsonInit).toMatchSnapshot();
    
    canvas.undo();
    var jsonUndo = canvas.toJSON();
    expect(jsonUndo).toMatchSnapshot();

    canvas.redo();
    var jsonRedo = canvas.toJSON();
    expect(jsonRedo).toEqual(jsonInit);
    
});

test('test object modified undo and redo', () => {
    var rect = new fabric.Rect({width: 10,height: 10,left:  0,	top: 0, });
    var event ={"e":{"isTrusted":true},"target":{"type":"rect","version":"3.6.3","originX":"left","originY":"top","left":205.33,"top":22.67,"width":10,"height":10,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0,"id":0},"transform":{"target":{"type":"rect","version":"3.6.3","originX":"left","originY":"top","left":205.33,"top":22.67,"width":10,"height":10,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0,"id":0},"action":"drag","corner":"bl","scaleX":1,"scaleY":1,"skewX":0,"skewY":0,"offsetX":2.4166695351646537,"offsetY":7.933341082011751,"originX":"right","originY":"top","ex":2.4166695351646537,"ey":7.933341082011751,"lastX":2.4166695351646537,"lastY":7.933341082011751,"theta":0,"width":10,"mouseXSign":1,"mouseYSign":1,"shiftKey":false,"altKey":false,"original":{"scaleX":1,"scaleY":1,"skewX":0,"skewY":0,"angle":0,"left":0,"flipX":false,"flipY":false,"top":0,"originX":"right","originY":"top"},"reset":false,"actionPerformed":true}}

    canvas.historyStack=[];
    canvas.redoStack=[];

    canvas.add(rect);
    var jsonInit = canvas.toJSON();
    expect(jsonInit).toMatchSnapshot();
    
    canvas.trigger('object:modified',event);
    var jsonEvent = canvas.toJSON();
    expect(jsonEvent).toMatchSnapshot();

    canvas.undo();
    var jsonUndo = canvas.toJSON();
    expect(jsonUndo).toMatchSnapshot();

    canvas.redo();
    var jsonRedo = canvas.toJSON();
    expect(jsonRedo).toMatchSnapshot();

});


test('test object set method', () => {
    canvas.historyStack=[];
    canvas.redoStack=[];
    var rect = new fabric.Rect()

    canvas.add(rect);
    var jsonInit = canvas.toJSON();
    expect(jsonInit).toMatchSnapshot();

    rect.set('top',100);
    var jsonUnchanged = canvas.toJSON();
    expect(jsonUnchanged.historyStack).toEqual(jsonInit.historyStack);

    rect.set('fill','#FFF');
    var jsonChangeFill = canvas.toJSON();
    expect(jsonChangeFill).toMatchSnapshot;
})
