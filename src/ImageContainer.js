import { fabric } from 'fabric';

const ImageContainer = fabric.util.createClass(fabric.Rect, {
    type: 'ImageContainer',
    img: null,
    origTop: 0,
    origLeft: 0,
    imgOrigTop: 0,
    imgOrigLeft: 0,
    fillcontainer: false,
    initialize(options) {
	options.absolutePositioned = true;
	options.fill = '#666666';
	options.opacity = 1;
	this.callSuper('initialize', options);
	Object.assign(this, options);
    },
    loadImage(src, options) {
	fabric.Image.fromURL(src, function(img) {
	    this.img = img;
	    if (this.fillcontainer) {
		var widthscale = this.width / this.img.width;
		var heightscale = this.height / this.img.height;
		this.img.scale(Math.max(widthscale, heightscale));
	    }
	    this.img.left = this.left;
	    this.img.top = this.top;
	    this.img.clipPath = this;
	    this.canvas.add(this.img);
	    this.img.setCoords();
	    this.img.selectable = false;
	    this.img.excludeFromExport = true;
	    if (options) {
		Object.assign(this.img,options);
	    }
	    this.canvas.bringToFront(this);
	    // bug in Fabric?
	    this.opacity = 0.00001;

	    // set event listeners
	    this.on({
		'mousedblclick': this._dblClickListener(this),
		'mousedown': this._mouseDownListener(this),
		'moving': this._movingListener(this),
	    });
	    this.img.on({
		'selected': this._imgSelectedListener(this),
		'deselected': this._imgDeselectedListener(this)
	    });

	}.bind(this));
    },
    _dblClickListener(container) {
	return function(e) {
	    container.img.selectable = true;
	    container.img.setCoords();
	    container.canvas.setActiveObject(container.img);
	    container.canvas.requestRenderAll();
	}
    },
    _mouseDownListener(container) {
	return function(e) {
	    container.origTop = container.top;
	    container.origLeft = container.left;
	    container.imgOrigTop = container.img.top;
	    container.imgOrigLeft = container.img.left;
	}
    },
    _movingListener(container) {
	return function(e) {
	    container.img.top = container.imgOrigTop + (container.top - container.origTop);
	    container.img.left = container.imgOrigLeft + (container.left - container.origLeft);
	    container.img.setCoords();
	}
    },
    _imgSelectedListener(container) {
	return function(e) {
	    container.selectable = false;
	    container.setCoords();
	    container.opacity = 1;
	    container.img.clipPath = null;
	    container.img.opacity = 0.7;
	}
    },
    _imgDeselectedListener(container) {
	return function(e) {
	    container.img.clipPath = container;
	    container.opacity = 0;
	    container.selectable = true;
	    container.img.selectable = false;
	    container.img.opacity = 1;
	}
    },
    toObject() {
	this.img.clipPath = null;
	var imgObj;
	if (this.img.toObject) {
      	    imgObj = this.img.toObject();
        } else {
            imgObj = this.img
        }
	var object = fabric.util.object.extend(this.callSuper('toObject'), { fillContainer: this.fillContainer, img: imgObj });
	this.img.clipPath = this;
	return object;
	
    },
    _render(ctx) {
	this.callSuper('_render', ctx);

    }
});

ImageContainer.fromObject = function(obj, callback){
  fabric.Object._fromObject('ImageContainer',obj,function(container){
      callback(container);
      if (obj.img) {
	  container.loadImage(obj.img.src,obj.img);
      }
   })
};

fabric.ImageContainer = ImageContainer;

export {ImageContainer};
