(function() {
	
	"use strict";
	
	/**
	*  Initially layouts all interface elements
	*  @module cloudkid
	*  @class Positioner
	*/
	var Positioner = function(){};
	
	// Set the protype
	Positioner.prototype = {};
	
	/**
	*  Initial position of all layout items
	*  @method positionItems
	*  @static
	*  @param {createjs.DisplayObject} parent
	*  @param {Object} itemSettings JSON format with position information
	*/
	Positioner.positionItems = function(parent, itemSettings)
	{
		var pt;
		for(var iName in itemSettings)
		{
			var item = parent[iName];
			if(!item)
			{
				Debug.error("could not find object '" +  iName + "'");
				continue;
			}
			var setting = itemSettings[iName];
			if(setting.x !== undefined)
				item.x = setting.x;
			if(setting.y !== undefined)
				item.y = setting.y;
			pt = setting.scale;
			if(pt)
			{
				item.scaleX *= pt.x;
				item.scaleY *= pt.y;
			}
			pt = setting.pivot;
			if(pt)
			{
				item.regX = pt.x;
				item.regY = pt.y;
			}
			if(setting.rotation !== undefined)
				item.rotation = settings.rotation;
			//item.name = iName;
			if(setting.hitArea)
			{
				item.hitShape = Positioner.generateHitArea(setting.hitArea);
			}
		}
	};
	
	/**
	*  Create the polygon hit area for interface elements
	*  @static
	*  @method generateHitArea
	*  @param {Object|Array} hitArea One of the following: <br/>
	*  * An array of points for a polygon, e.g. 
	*
	*		[{x:0, y:0}, {x:0, y:20}, {x:20, y:0}]
	*
	*  * An object describing a rectangle, e.g.
	*
	*		{type:"rect", x:0, y:0, w:10, h:30}
	*
	*  * An object describing an ellipse, where x and y are the center, e.g. 
	*
	*		{type:"ellipse", x:0, y:0, w:10, h:30}
	*
	*  * An object describing a circle, where x and y are the center, e.g.
	*
	*		{type:"circle", x:0, y:0, r:20}
	*  @param {Number} scale=1 The size to scale hitArea by
	*  @return {Object} A geometric shape object for hit testing, either a Polygon, Rectangle, Ellipse, or Circle,
	*      depending on the hitArea object. The shape will have a contains() function for hit testing.
	*/
	Positioner.generateHitArea = function(hitArea, scale)
	{
		if(!scale)
			scale = 1;
		if(isArray(hitArea))
		{
			if(scale == 1)
				return new createjs.Polygon(hitArea);
			else
			{
				var temp = [];
				for(var i = 0, len = hitArea.length; i < len; ++i)
				{
					temp.push(new createjs.Point(hitArea[i].x * scale, hitArea[i].y * scale));
				}
				return new createjs.Polygon(temp);
			}
		}
		else if(hitArea.type == "rect" || !hitArea.type)
			return new createjs.Rectangle(hitArea.x * scale, hitArea.y * scale, hitArea.w * scale, hitArea.h * scale);
		else if(hitArea.type == "ellipse")
			return new createjs.Ellipse((hitArea.x - hitArea.w * 0.5) * scale, (hitArea.y - hitArea.h * 0.5) * scale, hitArea.w * scale, hitArea.h * scale);//convert center to upper left corner
		else if(hitArea.type == "circle")
			return new createjs.Circle(hitArea.x * scale, hitArea.y * scale, hitArea.r * scale);
		else if(hitArea.type == "sector")
			return new createjs.Sector(hitArea.x * scale, hitArea.y * scale, hitArea.r * scale, hitArea.start, hitArea.end);
		return null;
	};

	var isArray = function(o)
	{
		return Object.prototype.toString.call(o) === '[object Array]';
	};
	
	namespace('cloudkid').Positioner = Positioner;
	namespace('cloudkid.createjs').Positioner = Positioner;
}());