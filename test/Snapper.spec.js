import {fabric} from 'fabric';
import {fabricAddSnapper} from '../src/index.js';

var canvas;

beforeAll(() => {
    fabricAddSnapper()
    document.body.innerHTML =
	'<canvas id="c"></canvas>'

});

beforeEach(() => {
    canvas = new fabric.Canvas('c');
});

test('inits', () => {
    expect(canvas._snapperAttached).toBeTruthy();
});

test('bounding Coords return correct Size', () => {
    var rect = new fabric.Rect({
	left : 0,
	top: 0,
	width: 100,
	height: 100,
    });
    canvas.add(rect);
    var bounds = rect.getBoundingCoords(true);
    expect(bounds.top).toEqual(0);
    expect(bounds.left).toEqual(0);
    expect(bounds.right).toEqual(100);
    expect(bounds.bottom).toEqual(100);
    expect(bounds.centerX).toEqual(50);
    expect(bounds.centerY).toEqual(50);
});

test('move to bounds vertically', () => {
    var rect = new fabric.Rect({
	left : 0,
	top: 0,
	width: 100,
	height: 100,
    });
    canvas.add(rect);
    var bounds = rect.getBoundingCoords(true);
    bounds.top = bounds.top+50;
    bounds.centerY = bounds.centerY+50;
    bounds.bottom = bounds.bottom+50;
    rect.setByBoundingCoords(bounds);
    rect.setCoords();
    expect(rect.top).toEqual(50);
    expect(rect.scaleY).toEqual(1);
    expect(rect.height).toEqual(100);
});

test('move to bounds horizontaly', () => {
    var rect = new fabric.Rect({
	left : 0,
	top: 0,
	width: 100,
	height: 100,
    });
    canvas.add(rect);
    var bounds = rect.getBoundingCoords(true);
    bounds.left = bounds.left+50;
    bounds.centerX = bounds.centerX+50;
    bounds.right = bounds.right+50;
    rect.setByBoundingCoords(bounds);
    rect.setCoords();
    expect(rect.left).toEqual(50);
    expect(rect.scaleX).toEqual(1);
    expect(rect.width).toEqual(100);
});


test('scale to bounds vertically', () => {
    var rect = new fabric.Rect({
	left : 0,
	top: 0,
	width: 100,
	height: 100,
    });
    canvas.add(rect);
    var bounds = rect.getBoundingCoords(true);
    bounds.centerY = bounds.centerY+50;
    bounds.bottom = bounds.bottom+100;
    rect.setByBoundingCoords(bounds);
    rect.setCoords();
    expect(rect.top).toEqual(0);
    expect(rect.scaleY).toEqual(2);
    expect(rect.height).toEqual(100);
});

test('scale to bounds horizontaly', () => {
    var rect = new fabric.Rect({
	left : 0,
	top: 0,
	width: 100,
	height: 100,
    });
    canvas.add(rect);
    var bounds = rect.getBoundingCoords(true);
    bounds.centerX = bounds.centerX+50;
    bounds.right = bounds.right+100;
    rect.setByBoundingCoords(bounds);
    rect.setCoords();
    expect(rect.left).toEqual(0);
    expect(rect.scaleX).toEqual(2);
    expect(rect.width).toEqual(100);
});
