# Collection of Extensions for [fabric.js](https://github.com/fabricjs/fabric.js)

A set of modular extensions to give [fabric.js](https://github.com/fabricjs/fabric.js) some additional DTP like capabilities.

## Demo
https://mtrudw.github.io/fabricPublisherTools/.

## Undo and Redo
Implements and action based undo and redo with a small footprint. Can be used for to create a detailed action log. Undo and redo data is serialized and deserialized 
with the canvas.

## Snapping 
Create guides to snap to on both move and scale. Snaps to bounding box when rotated. Rotated objects don't snap reliably on scale yet.

### Smart aligning Guides
Snap into alignment with other objects and the canvas center on move and scale. Shows guides aligned edges.
![](https://mtrudw.github.io/fabricPublisherTools/smartguides.gif)

Problems:
- Only moving works nicely with rotated objects
- Keeps stroke width constant on scaling (I consider it a bonus, might be a problem in certain cases though)

## Image Container
Image container that allows independent scaling of container and image. Keeps image clipped to container

## TODO
Still very early stages. So lots. Some features to do, lots of cleanup and documentation. Of course more testing and better test coverage. Also: add a todo-list.
