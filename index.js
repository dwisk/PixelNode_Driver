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
PixelNode_Driver.prototype.setPixel = function(strip, id, r,g,b) {
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
	    this.setPixel(0, pixel, 0, 0, 0);
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

    for (var i = 0; i < global.mapping.length;i++) {
    	map = global.mapping[i];
    	if (self.pixelData[map.name] && self.pixelData[map.name].mode !== "off") {
	    	var ringI = 0;

	    	for (var j = 0; j < map[self.pixelData[map.name].mode].length;j++) {
	    		ring = map[self.pixelData[map.name].mode][j];
	    		// offset ring
	    		if (self.options.offset && ring.offset) {
	    			var segment1 = ring.px.slice(ring.offset,12);
	    			var segment2 = ring.px.slice(0,ring.offset);
	    			pixels = segment1.concat(segment2);
	    		} else {
	    			pixels = ring.px;
	    		}

	    		// mirror

	    		if (ring.mirrow && !ring.px.mirrowed ) {
	    			tmppixels = _.clone(pixels);
	    			var j = 0;
	    			for (var i = tmppixels.length - 1; i >= 0; i--) {
	    				pixels[j] = tmppixels[i];
	    				j++;
	    			};
	    			ring.px.mirrowed = true;
	    		}

	    		// pixels
	    		var pixelI = 0;
	    		for (var p = 0; p < pixels.length;p++) {
	    			pixelConfig = pixels[p];

		    		var red = self.pixelData[map.name][self.pixelData[map.name].mode][ringI][pixelI][0];
		    		var green = self.pixelData[map.name][self.pixelData[map.name].mode][ringI][pixelI][1];
		    		var blue = self.pixelData[map.name][self.pixelData[map.name].mode][ringI][pixelI][2];

		    		if (!self.options.pixelColorCorrection || pixelConfig[2] || ring.pixelColorCorrection || map.pixelColorCorrection) {
		    			self.setPixel(pixelConfig[0], pixelConfig[1], red, green, blue);
		    		} else {
		    			self.setPixel(pixelConfig[0], pixelConfig[1], green, red, blue);
		    		}
			    	pixelI++;
		    	}
		    	ringI++;
	    	}
    	}
    }

    this.sendPixels();
}
