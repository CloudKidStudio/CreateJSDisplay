(function() {
	var DrawingApp = function(options)
	{
		Application.call(this, options);
	}
	
	// Import library dependencies
	var Point = createjs.Point,
		Graphics = createjs.Graphics,
		Shape = createjs.Shape,
		Application = cloudkid.Application,
		MediaLoader = cloudkid.MediaLoader;
	
	// Extend the createjs container
	var p = DrawingApp.prototype = Object.create(Application.prototype);
	
	// The name of this app
	p.name = "DrawingApp";
	
	// Private stage variable
	var stage;
	
	// Private mouse down variable
	var isMouseDown;

	// Private current shape
	var currentShape;
	
	// The clear button
	var button;

	// Number variables needed
	var oldMidX, oldMidY, oldX, oldY;
	
	/**
	* @protected
	*/
	p.init = function()
	{
		Debug.log("DrawingApp is ready to use.");
		
		stage = this.display.stage;
		stage.addEventListener('stagemouseup', handleMouseUp);
		stage.addEventListener('stagemousedown', handleMouseDown);
		
		stage.enableMouseOver(30);

		this.on("update", this.update.bind(this));
		
		MediaLoader.instance.load(
			'images/button.png', 
			this._onButtonLoaded.bind(this)
		);
	}

	/**
	*  Callback for the button  
	*/
	p._onButtonLoaded = function(result)
	{		
		button = new cloudkid.Button(result.content, {
			text: "Clear",
			font: "20px Arial",
			color: "#ffffff"
		});
				
		button.x = this.display.width - button.width - 5;
		button.y = this.display.height - button.height - 5;
		
		button.addEventListener(cloudkid.Button.BUTTON_PRESS, this._clear.bind(this));
		
		stage.addChild(button);
	};
	
	/**
	*   Clear the stage 
	*/
	p._clear = function()
	{
		stage.removeAllChildren();
		stage.addChild(button);
	};
	
	/**
	* Called by the stage to update
	* @public
	*/
	p.update = function(elapsed)
	{
		if (isMouseDown)
		{
			var pt = new Point(stage.mouseX, stage.mouseY);
			var midPoint = new Point(oldX + pt.x>>1, oldY+pt.y>>1);
			currentShape.graphics.moveTo(midPoint.x, midPoint.y);
			currentShape.graphics.curveTo(oldX, oldY, oldMidX, oldMidY);

			oldX = pt.x;
			oldY = pt.y;

			oldMidX = midPoint.x;
			oldMidY = midPoint.y;
		}
	};
	
	/**
	*  Destroy this app, don't use after this
	*/
	p.destroy = function()
	{
		Debug.log("DrawingApp destroy.");
		
		if (stage)
		{
			stage.onMouseDown = null;
			stage.onMouseUp = null;
			stage.removeEventListener('stagemouseup', handleMouseUp);
			stage.removeEventListener('stagemousedown', handleMouseDown);
		}
		
		if (button)
		{
			button.destroy();
			button = null;
		}
		
		stage = null;
		currentShape = null;
	}
	
	/**
	*  Handler for the mouse down event
	*  @private
	*/
	function handleMouseDown()
	{
		isMouseDown = true;
		
		var g = new Graphics();
		g.setStrokeStyle(3, 'round', 'round').beginStroke("#999");
		
		var s = new Shape(g);
		oldX = stage.mouseX;
		oldY = stage.mouseY;
		oldMidX = stage.mouseX;
		oldMidY = stage.mouseY;
		
		stage.addChildAt(s, 0);
		currentShape = s;
	}

	/**
	*  Handler for the mouse up event
	*  @private
	*/
	function handleMouseUp()
	{
 		isMouseDown = false;
	}
	
	namespace('cloudkid').DrawingApp = DrawingApp;
}());