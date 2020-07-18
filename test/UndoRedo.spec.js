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
