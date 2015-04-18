/**
 * PixelNode_Driver
 * 
 * Base class for led drivers
 * 
 * --------------------------------------------------------------------------------------------------------------------
 * 
 * @author Amely Kling <mail@dwi.sk>
 *
 */

/* Node Inclues
 * ==================================================================================================================== */

var _ = require('underscore');


/* Class Constructor
 * ==================================================================================================================== */

function PixelNode_Driver(options,pixelData) {	
	this.options = _.extend({},this.base_options, this.default_options, options);
	this.className = "PixelNode_Driver";
	this.pixelData = pixelData;
	this.init();
}

// module export
module.exports = PixelNode_Driver;


/* Variables
 * ==================================================================================================================== */

PixelNode_Driver.prototype.base_options = {
	offset: false,
	delay: 50,
	pixelCount: 512,
	pixelColorCorrection: false
}
PixelNode_Driver.prototype.default_options = {}
PixelNode_Driver.prototype.pixelData = {}
PixelNode_Driver.prototype.painter_interval = null;


/* Override Methods
 * ==================================================================================================================== */

// init driver – to be overridden
PixelNode_Driver.prototype.init = function() {
	// override
	console.log("Init PixelDriver:", this.options);
}

// set's a pixel – to be overridden
PixelNode_Driver.prototype.setPixel = function(id, r,g,b) {
	// override
}

// sends Pixels to destination – to be overridden
PixelNode_Driver.prototype.sendPixels = function() {
	// override
}


/* Methods
 * ==================================================================================================================== */

// reset pixels to black
PixelNode_Driver.prototype.resetPixels = function() {
	for (var pixel = 0; pixel < this.options.pixelCount; pixel++)
	{
	    this.setPixel(pixel, 0, 0, 0);
	}
}

// start painter interval
PixelNode_Driver.prototype.startPainter = function() {
	var self = this;	

	// initial reset pixels and call painter
	this.resetPixels();
	this.painter.call(self);

	// set interval for painter
	this.painter_interval = setInterval(function() {
	  self.painter.call(self);
	}, self.options.delay);  
}

// painter
PixelNode_Driver.prototype.painter = function() {
    var self = this;
    
    global.mapping.forEach(function(map) {
    	if (self.pixelData[map.name]) {
	    	var ringI = 0;
	    	map.rings.forEach(function(ring) {
	    		// offset ring
	    		if (self.options.offset && ring.offset) {
	    			var segment1 = ring.px.slice(ring.offset,12);
	    			var segment2 = ring.px.slice(0,ring.offset);
	    			pixels = segment1.concat(segment2);
	    		} else {
	    			pixels = ring.px;
	    		}

	    		// pixels
	    		var pixelI = 0;
		    	pixels.forEach(function(pixelConfig) {

		    		var red = self.pixelData[map.name].rings[ringI][pixelI][0];
		    		var green = self.pixelData[map.name].rings[ringI][pixelI][1];
		    		var blue = self.pixelData[map.name].rings[ringI][pixelI][2];

		    		if (!self.options.pixelColorCorrection || pixelConfig[2]) {
		    			self.setPixel(pixelConfig[1], red, green, blue);
		    		} else {
		    			self.setPixel(pixelConfig[1], green, red, blue);
		    		}
			    	pixelI++;
		    	});
		    	ringI++;
	    	});
    	}
    });

    this.sendPixels();
}