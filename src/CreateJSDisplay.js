/**
*  @module cloudkid
*/
(function(undefined){

	"use strict";

	/**
	*   CreateJSDisplay is a display plugin for the CloudKid Framework 
	*	that uses the EaselJS library for rendering.
	*
	*   @class CreateJSDisplay
	*/
	var CreateJSDisplay = function(id, options)
	{
		this.id = id;
		this.canvas = document.getElementById(id);
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this._visible = this.canvas.style.display != "none";
		if(options.mouseOverRate !== undefined)
			this.mouseOverRate = options.mouseOverRate;
		//make stage
		if(options.stageType == "spriteStage")
		{
			//TODO: make a sprite stage (not officially released yet)
		}
		else
		{
			this.stage = new createjs.Stage(id);
		}
		this.enabled = true;//enable mouse/touch input
	};

	var p = CreateJSDisplay.prototype = {};

	/**
	*  the canvas managed by this display
	*  @property {DOMElement} canvas
	*  @readOnly
	*  @public
	*/
	p.canvas = null;

	/**
	*  The DOM id for the canvas
	*  @property {String} id
	*  @readOnly
	*  @public
	*/
	p.id = null;

	/**
	*  Convenience method for getting the width of the canvas element
	*  would be the same thing as canvas.width
	*  @property {int} width
	*  @readOnly
	*  @public
	*/
	p.width = 0;

	/**
	*  Convenience method for getting the height of the canvas element
	*  would be the same thing as canvas.height
	*  @property {int} height
	*  @readOnly
	*  @public
	*/
	p.height = 0;

	/**
	*  The rendering library's stage element, the root display object
	*  @property {createjs.Stage|createjs.SpriteStage}
	*  @readOnly
	*  @public
	*/
	p.stage = null;

	/**
	*  If rendering is paused on this display only. Pausing all displays can be done
	*  using Application.paused setter.
	*  @property {Boolean} paused
	*  @public
	*/
	p.paused = false;

	/**
	*  The rate at which EaselJS calculates mouseover events, in times/second.
	*  @property {Boolean} mouseOverRate
	*  @public
	*/
	p.mouseOverRate = 30;

	/**
	*  If input is enabled on the stage.
	*  @property {Boolean} _enabled
	*  @private
	*/
	p._enabled = false;

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			this._enabled = value;
			if(value)
			{
				this.stage.enableMouseOver(this.mouseOverRate);
				this.stage.enableDOMEvents(true);
				createjs.Touch.enable(this.stage);
			}
			else
			{
				this.stage.enableMouseOver(false);
				this.stage.enableDOMEvents(false);
				createjs.Touch.disable(this.stage);
			}
		}
	});

	/**
	*  If the display is visible.
	*  @property {Boolean} _visible
	*  @private
	*/
	p._visible = false;

	/**
	*  If the display is visible, using "display: none" css on the canvas. Invisible displays won't render.
	*  @property {Boolean} visible
	*  @public
	*/
	Object.defineProperty(p, "visible", {
		get: function(){ return this._visible; },
		set: function(value)
		{
			this._visible = value;
			this.canvas.style.display = value ? "block" : "none";
		}
	});

	/**
	* Resizes the canvas, and tells the rendering library if it needs to know (PixiJS does)
	* this is only called by the Application
	* @method resize
	* @internal
	* @param {int} width The width that the display should be
	* @param {int} height The height that the display should be
	*/
	p.resize = function(width, height)
	{
		this.canvas.width = width;
		this.canvas.height = height;
	};

	/** 
	* Updates the stage and draws it. Elapsed is a parameter because CreateJS needs it, PixiJS doesn't care.
	* this is only called by the Application. This method does nothing if paused is true.
	* @method render
	* @internal
	* @param {int} elapsed
	*/
	p.render = function(elapsed)
	{
		if(this.paused || !this._visible) return;

		this.stage.update(elapsed);
	};

	/**
	*  Destroy and don't use after this, this method is called by the Application and should 
	*  not be called directly, use Application.removeDisplay(id). 
	*  The stage recursively removes all display objects here.
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		this.enabled = false;
		this.stage.removeAllChildren(true);
		this.stage = this.canvas = null;
	};

	// Assign to the global namespace
	namespace('cloudkid').CreateJSDisplay = CreateJSDisplay;
	namespace('cloudkid.createjs').CreateJSDisplay = CreateJSDisplay;

}());