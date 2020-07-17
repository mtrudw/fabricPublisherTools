import {fabric} from 'fabric';
import {fabricAddObjectIDs} from '../src/ObjectIds.js';

var canvas;

beforeAll(() => {
    fabricAddObjectIDs();
    document.body.innerHTML =
	'<canvas id="c"></canvas>'

});

beforeEach(() => {
    canvas = new fabric.Canvas('c');
});
test('has Ids',()=>     {
    expect(canvas.id).toBeDefined();
    
});

test('gives Id', () => {
    var rect1= new fabric.Rect();
    canvas.add(rect1);
    expect(rect1.id).toBeDefined();
});

test('gives different Ids', () => {
    var rect1= new fabric.Rect();
    var rect2= new fabric.Rect();

    canvas.add(rect1,rect2);
    expect(rect1.id).not.toEqual(rect2.id);
});

test('find Object by Id', () => {
    var rect1= new fabric.Rect();
    var rect2= new fabric.Rect();

    canvas.add(rect1,rect2);

    expect(canvas.getObjectById(rect1.id)).toBe(rect1);
    expect(canvas.getObjectById(rect2.id)).toBe(rect2);
});

test('export Ids',() => {
    var rect1= new fabric.Rect();
    var rect2= new fabric.Rect();

    canvas.add(rect1,rect2);

    var json = canvas.toJSON();
    expect(json.id).toEqual(2);
    expect(json.objects).toEqual(       
	expect.arrayContaining([      
	    expect.objectContaining({ 
		id: 0               
	    }),
	    expect.objectContaining({ 
		id: 1               
	    })

	])
    )
});
