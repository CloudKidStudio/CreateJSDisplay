(function(){

	fl.runScript(fl.configURI + "/JSFLLibraries/JSON.jsfl");
	JSON.prettyPrint = true;
	
	var doc = fl.getDocumentDOM();
	var library = doc.library;
	var selectedItem = library.getSelectedItems()[0];
	var outputObj = {};
	outputObj.fps = doc.frameRate;
	outputObj.labels = {};
	//get all those pesky frame labels
	var timeline = selectedItem.timeline;
	var layers = timeline.layers;
	for(var l = 0, lLen = layers.length; l < lLen; ++l)
	{
		var layer = layers[l];
		if(layer.layerType == "folder") continue;
		//hide guide/mask layers and show everything else, for origin calculation purposes
		layer.visible = layer.layerType != "guide" && layer.layerType != "mask";

		var frames = layer.frames;
		for(var f = 0, fLen = frames.length; f < fLen;)
		{
			var frame = frames[f];
			if(frame.name)
			{
				outputObj.labels[frame.name] = f;
			}
			f += frame.duration;
		}
	}
	//set up information on the pngs that would be exported
	var data = {};
	outputObj.frames = [data];
	var symbolName = selectedItem.name.substring(selectedItem.name.indexOf("/") + 1);
	data.name = symbolName + "#";//the name of the clip with a # to replace with the frame number
	data.min = 0;//flash frame numbers start at 0 when you use the spritesheet exporter
	data.max = timeline.frameCount - 1;//go until the end
	data.digits = 4;//flash frame numbers always have 4 digits
	//get the origin
	var left = 100000000;
	var top = 100000000;
	for(var i = 1, len = timeline.frameCount + 1; i < len; ++i)
	{
		var bounds = timeline.getBounds(i, false);//don't get hidden layers, aka the masks and guides we just hid
		if(bounds.left < left)
			left = bounds.left;
		if(bounds.top < top)
			top = bounds.top;
	}
	outputObj.origin = {x: -left, y: -top};
	//export the movieclip data
	var uri = fl.browseForFileURL("save", "Select a file to save the movieclip data", "JSON Files (*.json)", "json");
	if(uri)
		FLfile.write(uri, JSON.stringify(outputObj));
	uri = fl.browseForFileURL("save", "Select a file to save the spritesheet");
	if(uri)
	{
		if(uri.lastIndexOf(".") > 0)
			uri = uri.substring(0, uri.lastIndexOf("."));
		var exporter = new SpriteSheetExporter();
		exporter.layoutFormat = "JSON";
		exporter.algorithm = "maxRects";
		exporter.allowRotate = false;
		exporter.allowTrimming = true;
		exporter.autoSize = true;
		exporter.shapePadding = 1;
		exporter.stackDuplicateFrames = true;
		exporter.addSymbol(selectedItem);
		exporter.exportSpriteSheet(uri ,{format:"png", bitDepth:32, backgroundColor:"#00000000"})
	}
}());