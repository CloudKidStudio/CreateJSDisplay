/*! CreateJSDisplay 0.0.1 2014-08-07 */
/**
*  @module cloudkid
*/
(function(undefined){

	"use strict";

	/**
	*   CreateJSDisplay is a display plugin for the CloudKid Application Framework 
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
/**
*  @module cloudkid
*/
(function(undefined){

	"use strict";

	// Imports
	var Application = cloudkid.Application,
		AnimatorTimeline = null;//saved in global init for less complicated build order
	
	/**
	*   Animator is a static class designed to provided
	*   base animation functionality, using frame labels of MovieClips
	*
	*   @class Animator
	*   @static
	*/
	var Animator = function(){};
	
	/**
	* The current version of the Animator class 
	* 
	* @property {String} VERSION
	* @public
	* @static
	*/
	Animator.VERSION = "${version}";
	
	/**
	* If we fire debug statements 
	* 
	* @property {bool} debug
	* @public
	* @static
	*/
	Animator.debug = false;
	
	/**
	* The instance of cloudkid.Audio or cloudkid.Sound for playing audio along with animations.
	* This MUST be set in order to play synced animations.
	* 
	* @property {cloudkid.Audio|cloudkid.Sound} soundLib
	* @public
	* @static
	*/
	Animator.soundLib = null;

	/**
	*  The global captions object to use with animator
	*  @property {cloudkid.Captions} captions
	*  @public
	*  @static
	*/
	Animator.captions = null;
	
	/**
	* The collection of timelines
	* 
	* @property {Array} _timelines
	* @private
	*/
	var _timelines = null;
	
	/**
	* A collection of timelines for removal - kept out here so it doesn't need to be
	* reallocated every frame
	* 
	* @property {Array} _removedTimelines
	* @private
	*/
	var _removedTimelines = null;
	
	/** Look up a timeline by the instance
	* 
	* @property {Dictionary} _timelinesMap
	* @private
	*/
	var _timelinesMap = null;
	
	/**
	* If the Animator is paused
	* 
	* @property {bool} _paused
	* @private
	*/
	var _paused = false;

	/**
	* An empty object to avoid creating new objects in play()
	* when an options object is not used for parameters.
	* 
	* @property {Object} _optionsHelper
	* @private
	*/
	var _optionsHelper = {};
	
	/**
	*	Sets the variables of the Animator to their defaults. Use when _timelines is null,
	*	if the Animator data was cleaned up but was needed again later.
	*	
	*	@function init
	*	@static
	*/
	Animator.init = function()
	{
		_timelines = [];
		_removedTimelines = [];
		_timelinesMap = {};
		_paused = false;
		AnimatorTimeline = cloudkid.createjs.AnimatorTimeline;
	};
	
	/**
	*	Stops all animations and cleans up the variables used.
	*	
	*	@function destroy
	*	@static
	*/
	Animator.destroy = function()
	{
		Animator.stopAll();
		
		_timelines = null;
		_removedTimelines = null;
		_timelinesMap = null;
	};

	Application.registerInit(Animator.init);
	Application.registerDestroy(Animator.destroy);
	
	/**
	*   Play an animation for a frame label event
	*   
	*   @function play
	*   @param {AnimatorTimeline} instance The timeline to animate
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose stop")
	*   @param {Object|function} [options] The object of optional parameters or onComplete callback function
	*   @param {function} [options.onComplete=null] The callback function when the animation is done
	*   @param {Array} [options.onCompleteParams=null] Parameters to pass to onComplete function
	*	@param {int} [options.startTime=0] The time in milliseconds into the animation to start. A value of -1 makes the animation play at a random startTime.
	*	@param {Number} [options.speed=1] The speed at which to play the animation.
	*	@param {Object|String} [options.soundData=null] soundData Data about a sound to sync the animation to, as an alias or in the format {alias:"MyAlias", start:0}.
	*		start is the seconds into the animation to start playing the sound. If it is omitted or soundData is a string, it defaults to 0.
	*   @param {bool} [options.doCancelledCallback=false] Should an overridden animation's callback function still run?
	*   @return {AnimatorTimeline} The Timeline object
	*   @static
	*/
	Animator.play = function(instance, event, options, onCompleteParams, startTime, speed, soundData, doCancelledCallback)
	{
		var onComplete;

		if (options && typeof options == "function")
		{
			onComplete = options;
			options = _optionsHelper;//use the helper instead of creating a new object
		}
		else if (!options)
		{
			options = _optionsHelper;//use the helper instead of creating a new object
		}

		onComplete = options.onComplete || onComplete || null;
		onCompleteParams = options.onCompleteParams || onCompleteParams || null;
		startTime = options.startTime || startTime;
		startTime = startTime ? startTime * 0.001 : 0;//convert into seconds, as that is what the time uses internally
		speed = options.speed || speed || 1;
		doCancelledCallback = options.doCancelledCallback || doCancelledCallback || false;
		soundData = options.soundData || soundData || null;

		if (!_timelines) 
			Animator.init();
		
		if (_timelinesMap[instance.id] !== undefined)
		{
			Animator.stop(instance, doCancelledCallback);
		}
		var timeline = Animator._makeTimeline(instance, event, onComplete, onCompleteParams, speed, soundData);
		
		if (timeline.firstFrame > -1 && timeline.lastFrame > -1)//if the animation is present and complete
		{
			timeline.time = startTime == -1 ? Math.random() * timeline.duration : startTime;
			
			instance.elapsedTime = timeline.startTime + timeline.time;
			instance.play();//have it set its 'paused' variable to false
			instance._tick();//update the movieclip to make sure it is redrawn correctly at the next opportunity
			
			// Before we add the timeline, we should check to see
			// if there are no timelines, then start the enter frame
			// updating
			if (!Animator._hasTimelines()) Animator._startUpdate();
			
			_timelines.push(timeline);
			_timelinesMap[instance.id] = timeline;

			//If the sound doesn't play immediately and we can preload it, we should do that
			if(timeline.soundStart > 0 && Animator.audioLib.preloadSound)
			{
				Animator.soundLib.preloadSound(timeline.soundAlias);
			}
			
			return timeline;
		}
		
		if (true)
		{
			Debug.log("No event " + event + " was found, or it lacks an end, on this MovieClip " + instance);
		}
		
		if (onComplete)
		{
			onComplete.apply(null, onCompleteParams);
		}
		return null;
	};
	
	/**
	*   Play an animation for a frame label event, starting at a random frame within the animation
	*   
	*   @function playAtRandomFrame
	*   @param {AnimatorTimeline} instance The timeline to animate.
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose_stop").
	*   @param {Object|function} [options] The object of optional parameters or onComplete callback function
	*   @param {function} [options.onComplete=null] The callback function when the animation is done
	*   @param {Array} [options.onCompleteParams=null] Parameters to pass to onComplete function
	*	@param {Number} [options.speed=1] The speed at which to play the animation.
	*	@param {Object} [options.soundData=null] soundData Data about a sound to sync the animation to, as an alias or in the format {alias:"MyAlias", start:0}.
	*		start is the seconds into the animation to start playing the sound. If it is omitted or soundData is a string, it defaults to 0.
	*   @param {bool} [options.doCancelledCallback=false] Should an overridden animation's callback function still run?
	*   @return {AnimatorTimeline} The Timeline object
	*   @static
	*/
	Animator.playAtRandomFrame = function(instance, event, options, onCompleteParams, speed, soundData, doCancelledCallback)
	{
		return Animator.play(instance, event, options, onCompleteParams, -1, speed, soundData, doCancelledCallback);
	};
	
	/**
	*   Creates the AnimatorTimeline for a given animation
	*   
	*   @function _makeTimeline
	*   @param {easeljs.MovieClip} instance The timeline to animate
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose stop")
	*   @param {function} onComplete The function to callback when we're done
	*   @param {function} onCompleteParams Parameters to pass to onComplete function
	*   @param {Number} speed The speed at which to play the animation.
	*	@param {Object} soundData Data about sound to sync the animation to.
	*   @return {AnimatorTimeline} The Timeline object
	*   @private
	*   @static
	*/
	Animator._makeTimeline = function(instance, event, onComplete, onCompleteParams, speed, soundData)
	{
		var timeline = new AnimatorTimeline();
		if(!Animator._canAnimate(instance))//not a movieclip
		{
			return timeline;
		}
		instance.advanceDuringTicks = false;//make sure the movieclip doesn't play outside the control of Animator
		var fps;
		if(!instance.framerate)//make sure the movieclip is framerate independent
		{
			fps = Application.instance.options.fps;
			if(!fps)
				fps = Application.instance.fps;
			if(!fps)
				fps = 15;
			instance.framerate = fps;
		}
		else
			fps = instance.framerate;//we'll want this for some math later
		timeline.instance = instance;
		timeline.event = event;
		timeline.onComplete = onComplete;
		timeline.onCompleteParams = onCompleteParams;
		timeline.speed = speed;
		if(soundData)
		{
			timeline.playSound = true;
			if(typeof soundData == "string")
			{
				timeline.soundStart = 0;
				timeline.soundAlias = soundData;
			}
			else
			{
				timeline.soundStart = soundData.start > 0 ? soundData.start : 0;//seconds
				timeline.soundAlias = soundData.alias;
			}
			timeline.useCaptions = Animator.captions && Animator.captions.hasCaption(timeline.soundAlias);
		}
		
		//go through the list of labels (they are sorted by frame number)
		var labels = instance.getLabels();
		var stopLabel = event + "_stop";
		var loopLabel = event + "_loop";
		for(var i = 0, len = labels.length; i < len; ++i)
		{
			var l = labels[i];
			if(l.label == event)
			{
				timeline.firstFrame = l.position;
			}
			else if(l.label == stopLabel)
			{
				timeline.lastFrame = l.position;
				break;
			}
			else if(l.label == loopLabel)
			{
				timeline.lastFrame = l.position;
				timeline.isLooping = true;
				break;
			}
		}

		timeline.length = timeline.lastFrame - timeline.firstFrame;
		timeline.startTime = timeline.firstFrame / fps;
		timeline.duration = timeline.length / fps;
		
		return timeline;
	};

	/**
	*   Determines if a given instance can be animated by Animator, to allow things that aren't
	*	MovieClips from EaselJS to be animated if they share the same API. Note - 'id' is a property with
	*	a unique value for each createjs.DisplayObject. If a custom object is made that does not inherit from DisplayObject,
	*	it needs to not have an id that is identical to anything from EaselJS.
	*   
	*   @function _canAnimate
	*   @param {easeljs.MovieClip} instance The object to check for animation properties.
	*   @return {Boolean} If the instance can be animated or not.
	*   @private
	*   @static
	*/
	Animator._canAnimate = function(instance)
	{
		if(instance instanceof createjs.MovieClip)//all createjs.MovieClips are A-OK
			return true;
		if(instance.framerate !== undefined &&//property - calculate timing
			instance.getLabels !== undefined &&//method - get framelabels
			instance.elapsedTime !== undefined &&//property - set time passed
			instance._tick !== undefined &&//method - update after setting elapsedTime
			instance.gotoAndStop !== undefined &&//method - stop at end of anim
			instance.play !== undefined &&//method - start playing
			instance.id !== undefined)//property - used to avoid duplication of timelines
			return true;
		if(true)
		{
			Debug.error("Attempting to use Animator to play something that is not movieclip compatible: " + instance);
		}
		return false;
	};

	/**
	*   Checks if animation exists
	*   
	*   @function _makeTimeline
	*   @param {easeljs.MovieClip} instance The timeline to check
	*   @param {String} event The frame label event (e.g. "onClose" to "onClose stop")
	*   @public
	*   @static
	*	@return {bool} does this animation exist?
	*/
	Animator.instanceHasAnimation = function(instance, event)
	{
		var labels = instance.getLabels();
		var startFrame = -1, stopFrame = -1;
		var stopLabel = event + "_stop";
		var loopLabel = event + "_loop";
		for(var i = 0, len = labels.length; i < len; ++i)
		{
			var l = labels[i];
			if(l.label == event)
			{
				startFrame = l.position;
			}
			else if(l.label == stopLabel || l.label == loopLabel)
			{
				stopFrame = l.position;
				break;
			}
		}

		return startFrame >= 0 && stopFrame >= 0;
	};
	
	/**
	*   Stop the animation.
	*   
	*   @function stop
	*   @param {createjs.MovieClip} instance The MovieClip to stop the action on
	*   @param {bool} doOnComplete If we are suppose to do the complete callback when stopping (default is false)
	*   @static
	*/
	Animator.stop = function(instance, doOnComplete)
	{
		doOnComplete = doOnComplete || false;
		
		if (!_timelines) return;
		
		if (_timelinesMap[instance.id] === undefined)
		{
			if (true)
			{
				Debug.log("No timeline was found matching the instance id " + instance);
			}
			return;
		}
		var timeline = _timelinesMap[instance.id];
		Animator._remove(timeline, doOnComplete);
	};
	
	/**
	*   Stop all current Animator animations.
	*   This is good for cleaning up all animation, as it doesn't do a callback on any of them.
	*   
	*   @function stopAll
	*   @param {createjs.Container} container Optional - specify a container to stop timelines contained within
	*   @static
	*/
	Animator.stopAll = function(container)
	{
		if (!Animator._hasTimelines()) return;
		
		var timeline;
		var removedTimelines = _timelines.slice();

		for(var i=0; i < removedTimelines.length; i++)
		{
			timeline = removedTimelines[i];
			
			if (!container || container.contains(timeline.instance))
			{
				Animator._remove(timeline, false);
			}
		}
	};
	
	/**
	*   Remove a timeline from the stack
	*   
	*   @function _remove
	*   @param {AnimatorTimeline} timeline
	*   @param {bool} doOnComplete If we do the on complete callback
	*   @private
	*   @static
	*/
	Animator._remove = function(timeline, doOnComplete)
	{
		var index = _removedTimelines.indexOf(timeline);
		if (index >= 0)
		{
			_removedTimelines.splice(index, 1);
		}
		
		index = _timelines.indexOf(timeline);
		
		// We can't remove an animation twice
		if (index < 0) return;
		
		var onComplete = timeline.onComplete;
		var onCompleteParams = timeline.onCompleteParams;
		
		// Stop the animation
		timeline.instance.stop();

		//in most cases, if doOnComplete is true, it's a natural stop and the audio can be allowed to continue
		if(!doOnComplete && timeline.soundInst)
			timeline.soundInst.stop();//stop the sound from playing
		
		// Remove from the stack
		_timelines.splice(index, 1);
		delete _timelinesMap[timeline.instance.id];

		//stop the captions, if relevant
		if (timeline.useCaptions)
		{
			Animator.captions.stop();
		}
		
		// Clear the timeline
		timeline.instance = null;
		timeline.event = null;
		timeline.onComplete = null;
		timeline.onCompleteParams = null;
		
		// Check if we should stop the update
		if (!Animator._hasTimelines()) Animator._stopUpdate();
		
		if (doOnComplete && onComplete)
		{
			onComplete.apply(null, onCompleteParams);
		}
	};
	
	/**
	*   Pause all tweens which have been excuted by Animator.play()
	*   
	*   @function pause
	*   @static
	*/
	Animator.pause = function()
	{
		if (!_timelines) return;
		
		if (_paused) return;
		
		_paused = true;
		
		for(var i = 0; i < _timelines.length; i++)
		{
			_timelines[i].paused = true;
		}
		Animator._stopUpdate();
	};
	
	/**
	*   Resumes all tweens executed by the Animator.play()
	*   
	*   @function resume
	*   @static
	*/
	Animator.resume = function()
	{
		if(!_timelines) return;
		
		if (!_paused) return;
		
		_paused = false;
		
		// Resume playing of all the instances
		for(var i = 0; i < _timelines.length; i++)
		{
			_timelines[i].paused = false;
		}
		if (Animator._hasTimelines()) Animator._startUpdate();
	};
	
	/**
	*   Pauses or unpauses all timelines that are children of the specified DisplayObjectContainer.
	*   
	*   @function pauseInGroup
	*   @param {bool} paused If this should be paused or unpaused
	*   @param {createjs.Container} container The container to stop timelines contained within
	*   @static
	*/
	Animator.pauseInGroup = function(paused, container)
	{
		if (!Animator._hasTimelines() || !container) return;
		
		for(var i=0; i< _timelines.length; i++)
		{
			if (container.contains(_timelines[i].instance))
			{
				_timelines[i].paused = paused;
			}
		}
	};
	
	
	/**
	*   Get the timeline object for an instance
	*   
	*   @function getTimeline
	*   @param {createjs.MovieClip} instance MovieClip 
	*   @return {AnimatorTimeline} The timeline
	*   @static
	*/
	Animator.getTimeline = function(instance)
	{
		if (!Animator._hasTimelines()) return null;
		
		if (_timelinesMap[instance.id] !== undefined)
		{
			return _timelinesMap[instance.id];
		}
		return null;
	};
	
	/**
	*  Whether the Animator class is currently paused.
	*  
	*  @function getPaused
	*  @return {bool} if we're paused or not
	*/
	Animator.getPaused = function()
	{
		return _paused;
	};
	
	/**
	*  Start the updating 
	*  
	*  @function _startUpdate
	*  @private
	*  @static
	*/
	Animator._startUpdate = function()
	{
		if (Application.instance)
			Application.instance.on("update", Animator._update);
	};
	
	/**
	*   Stop the updating
	*   
	*   @function _stopUpdate
	*   @private
	*   @static
	*/
	Animator._stopUpdate = function()
	{
		if (Application.instance)
			Application.instance.off("update", Animator._update);
	};
	
	/**
	*   The update every frame
	*   
	*   @function
	*   @param {int} elapsed The time in milliseconds since the last frame
	*   @private
	*   @static
	*/
	Animator._update = function(elapsed)
	{
		if(!_timelines) return;
		
		var delta = elapsed * 0.001;//ms -> sec
		
		var t;
		for(var i = _timelines.length - 1; i >= 0; --i)
		{
			t = _timelines[i];
			var instance = t.instance;
			if(t.paused) continue;
			
			if(t.soundInst)
			{
				if(t.soundInst.isValid)
				{
					//convert sound position ms -> sec
					t.time = t.soundStart + t.soundInst.position * 0.001;
					
					if (t.useCaptions)
					{
						Animator.captions.seek(t.soundInst.position);
					}
					//if the sound goes beyond the animation, then stop the animation
					//audio animations shouldn't loop, because doing that properly is difficult
					//letting the audio continue should be okay though
					if(t.time >= t.duration)
					{
						instance.gotoAndStop(t.lastFrame);
						_removedTimelines.push(t);
					}
				}
				//if sound is no longer valid, stop animation playback immediately
				else
				{
					_removedTimelines.push(t);
					continue;
				}
			}
			else
			{
				t.time += delta * t.speed;
				if(t.time >= t.duration)
				{
					if(t.isLooping)
					{
						t.time -= t.duration;
						if (t.onComplete)
							t.onComplete.apply(null, t.onCompleteParams);
					}
					else
					{
						instance.gotoAndStop(t.lastFrame);
						_removedTimelines.push(t);
					}
				}
				if(t.playSound && t.time >= t.soundStart)
				{
					t.time = t.soundStart;
					t.soundInst = Animator.audioLib.play(
						t.soundAlias, 
						onSoundDone.bind(this, t), 
						onSoundStarted.bind(this, t)
					);
					if (t.useCaptions)
					{
						Animator.captions.isSlave = true;
						Animator.captions.run(t.soundAlias);
					}
				}
			}
			instance.elapsedTime = t.startTime + t.time;
			//because the movieclip only checks the elapsed time here (advanceDuringTicks is false), 
			//calling advance() with no parameters is fine
			instance.advance();
		}
		for(i = 0; i < _removedTimelines.length; i++)
		{
			t = _removedTimelines[i];
			Animator._remove(t, true);
		}
	};
	
	/**
	*  The sound has been started
	*  @method onSoundStarted
	*  @private
	*  @param {AnimatorTimeline} timeline
	*/
	var onSoundStarted = function(timeline)
	{
		timeline.playSound = false;
		timeline.soundEnd = timeline.soundStart + timeline.soundInst.length * 0.001;//convert sound length to seconds
	};
	
	/**
	*  The sound is done
	*  @method onSoundDone
	*  @private
	*  @param {AnimatorTimeline} timeline
	*/
	var onSoundDone = function(timeline)
	{
		if(timeline.soundEnd > 0 && timeline.soundEnd > timeline.time)
			timeline.time = timeline.soundEnd;
		timeline.soundInst = null;
	};
	
	/**
	*  Check to see if we have timeline
	*  
	*  @function _hasTimelines
	*  @return {bool} if we have timelines
	*  @private
	*  @static
	*/
	Animator._hasTimelines = function()
	{
		if(!_timelines) return false;
		return _timelines.length > 0;
	};
	
	/**
	*  String representation of this class
	*  
	*  @function toString
	*  @return String
	*  @static
	*/
	Animator.toString = function() 
	{
		return "[Animator version:" + Animator.VERSION + "]";
	};
	
	// Assign to the global namespace
	namespace('cloudkid').Animator = Animator;
	namespace('cloudkid.createjs').Animator = Animator;

}());
/**
*  @module cloudkid
*/
(function(){

	"use strict";

	/**
	*   Animator Timeline is a class designed to provide
	*   base animation functionality
	*   
	*   @class AnimatorTimeline
	*   @constructor
	*/
	var AnimatorTimeline = function(){};
	
	// Create a prototype
	var p = AnimatorTimeline.prototype;
	
	/**
	* The event to callback when we're done
	* 
	* @event onComplete
	*/
	p.onComplete = null;
	
	/** 
	* The parameters to pass when completed 
	* 
	* @property {Array} onCompleteParams
	*/
	p.onCompleteParams = null;
	
	/**
	* The event label
	* 
	* @property {String} event
	*/
	p.event = null;
	
	/**
	* The instance of the timeline to animate 
	* 
	* @property {AnimatorTimeline} instance
	*/
	p.instance = null;
	
	/**
	* The frame number of the first frame
	* 
	* @property {int} firstFrame
	*/
	p.firstFrame = -1;
	
	/**
	* The frame number of the last frame
	* 
	* @property {int} lastFrame
	*/
	p.lastFrame = -1;
	
	/**
	* If the animation loops - determined by looking to see if it ends in " stop" or " loop"
	* 
	* @property {bool} isLooping
	*/
	p.isLooping = false;
	
	/**
	* Ensure we show the last frame before looping
	* 
	* @property {bool} isLastFrame
	*/
	p.isLastFrame = false;
	
	/**
	* length of timeline in frames
	* 
	* @property {int} length
	*/
	p.length = 0;

	/**
	*  If this timeline plays captions
	*
	*  @property {bool} useCaptions
	*  @readOnly
	*/
	p.useCaptions = false;
	
	/**
	* If the timeline is paused.
	* 
	* @property {bool} _paused
	* @private
	*/
	p._paused = false;
	
	/**
	* Sets and gets the animation's paused status.
	* 
	* @property {bool} paused
	* @public
	*/
	Object.defineProperty(AnimatorTimeline.prototype, "paused", {
		get: function() { return this._paused; },
		set: function(value) {
			if(value == this._paused) return;
			this._paused = !!value;
			if(this.soundInst)
			{
				if(this.paused)
					this.soundInst.pause();
				else
					this.soundInst.unpause();
			}
		}
	});

	/**
	* The animation start time in seconds on the movieclip's timeline.
	* @property {Number} startTime
	* @public
	*/
	p.startTime = 0;
	/**
	* The animation duration in seconds.
	* @property {Number} duration
	* @public
	*/
	p.duration = 0;
	/**
	* The animation speed. Default is 1.
	* @property {Number} speed
	* @public
	*/
	p.speed = 1;
	/**
	* The position of the animation in seconds.
	* @property {Number} time
	* @public
	*/
	p.time = 0;
	/**
	* Sound alias to sync to during the animation.
	* @property {String} soundAlias
	* @public
	*/
	p.soundAlias = null;
	/**
	* A sound instance object from cloudkid.Sound or cloudkid.Audio, used for tracking sound position.
	* @property {Object} soundInst
	* @public
	*/
	p.soundInst = null;
	/**
	* If the timeline will, but has yet to play a sound.
	* @property {bool} playSound
	* @public
	*/
	p.playSound = false;
	/**
	* The time (seconds) into the animation that the sound starts.
	* @property {Number} soundStart
	* @public
	*/
	p.soundStart = 0;
	/**
	* The time (seconds) into the animation that the sound ends
	* @property {Number} soundEnd
	* @public
	*/
	p.soundEnd = 0;
	
	// Assign to the name space
	namespace('cloudkid').AnimatorTimeline = AnimatorTimeline;
	namespace('cloudkid.createjs').AnimatorTimeline = AnimatorTimeline;
	
}());
(function(undefined) {

	/**
	*  A class similar to createjs.MovieClip, but made to play animations from a cloudkid.TextureAtlas.
	*  The CreateJS Sprite class requires a spritesheet with equal sized and spaced frames. By using cloudkid.TextureAtlas,
	*  you can use a much smaller spritesheet, sprites on screen with fewer extra transparent pixels, and use the same
	*  API as MovieClip.
	*
	*  See "Export BitmapMovieClip.jsfl" in the library for a script that will export a selected MovieClip in the library
	*  with all of the information (except data.scale) needed to reassemble the BitmapMovieClip.
	*
	*  @class BitmapMovieClip
	*  @extends createjs.Container
	*  @constructor
	*  @param {TextureAtlas} atlas=null The texture atlas to pull frames from.
	*  @param {Object} data=null Initialization data
	*   @param {int} [data.fps] Framerate to play the movieclip at. Omitting this will use the current framerate.
	*   @param {Object} [data.labels] A dictionary of the labels in the movieclip to assist in playing animations.
	*   @param {Object} [data.origin={x:0,y:0}] The origin of the movieclip.
	*   @param {Array} [data.frames] An array of frame sequences to pull from the texture atlas.
	*   @param {String} [data.frames.name] The name to use for the frame sequence. This should include a "#" to be replaced with the image number.
	*   @param {int} [data.frames.min] The first frame number in the frame sequence.
	*   @param {int} [data.frames.max] The last frame number in the frame sequence.
	*   @param {int} [data.frames.digits=4] The maximum number of digits in the names of the frames, e.g. myAnim0001 has 4 digits.
	*   @param {Number} [data.scale=1] The scale at which the art was exported, e.g. a scale of 1.4 means the art was increased
	*          in size to 140% before exporting and should be scaled back down before drawing to the screen.
	*
	*  Format for data:
	*	{
	*		fps:30,
	*		labels:
	*		{
	*			animStart:0,
	*			animStart_loop:15
	*		},
	*		origin:{ x: 20, y:30 },
	*		frames:
	*		[
	*			{
	*				name:"myAnim#",
	*				min:1,
	*				max:20,
	*				digits:4
	*			}
	*		],
	*		scale:1
	*	}
	*
	* The object describes a 30 fps animation that is 20 frames long, and was originally myAnim0001.png->myAnim0020.png,
	* with frame labels on the first and 16th frame. 'digits' is optional, and defaults to 4.
	*/
	var BitmapMovieClip = function(atlas, data)
	{
		createjs.Container.call(this);
		this.mouseChildren = false;//mouse events should reference this, not the child bitmap
		this._bitmap = new createjs.Bitmap();
		this.addChild(this._bitmap);
		if(atlas && data)
			this.init(atlas, data);
	};

	var p = BitmapMovieClip.prototype = new createjs.Container();
	var s = createjs.Container.prototype;

	//==== Public properties =====

	/**
	 * Indicates whether this BitmapMovieClip should loop when it reaches the end of its timeline.
	 * @property loop
	 * @type Boolean
	 * @default true
	 */
	p.loop = true;

	/**
	 * The current frame of the movieclip.
	 * @property currentFrame
	 * @type Number
	 * @default 0
	 * @readonly
	 */
	p.currentFrame = 0;

	/**
	 * If true, the BitmapMovieClip's position will not advance when ticked.
	 * @property paused
	 * @type Boolean
	 * @default false
	 */
	p.paused = false;

	/**
	 * If true, the BitmapMovieClip will advance its timeline during ticks. If false then it must be externally advanced.
	 * @property advanceDuringTicks
	 * @type Boolean
	 * @default true
	 */
	p.advanceDuringTicks = true;

	/**
	 * By default BitmapMovieClip instances advance one frame per tick. Specifying a framerate for the BitmapMovieClip
	 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
	 * framerate.
	 *
	 * For example, if a BitmapMovieClip with a framerate of 10 is placed on a Stage being updated at 40fps, then the BitmapMovieClip will
	 * advance roughly one frame every 4 ticks. This will not be exact, because the time between each tick will
	 * vary slightly between frames.
	 *
	 * This feature is dependent on the tick event object (or an object with an appropriate "delta" property) being
	 * passed into {{#crossLink "Stage/update"}}{{/crossLink}}.
	 * @property framerate
	 * @type {Number}
	 * @default 0
	 **/
	Object.defineProperty(p, 'framerate', {
		get: function() {
			return this._framerate;
		},
		set: function(value) {
			if(value > 0)
			{
				this._framerate = value;
				this._duration = value ? this._frames.length / value : 0;
			}
			else
				this._framerate = this._duration = 0;
		}
	});

	/**
	 * When the BitmapMovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	 * @property elapsedTime
	 * @type Number
	 * @default 0
	 * @public
	 */
	Object.defineProperty(p, 'elapsedTime', {
		get: function() {
			return this._t;
		},
		set: function(value) {
			this._t = value;
		}
	});

	//==== Private properties =====

	/**
	 * By default BitmapMovieClip instances advance one frame per tick. Specifying a framerate for the BitmapMovieClip
	 * will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
	 * framerate.
	 * 
	 * @property _framerate
	 * @type {Number}
	 * @default 0
	 * @private
	 **/
	p._framerate = 0;

	/**
	 * When the BitmapMovieClip is framerate independent, this is the total time in seconds for the animation.
	 * @property _duration
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._duration = 0;

	/**
	 * When the BitmapMovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	 * @property _t
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._t = 0;

	/**
	 * @property _prevPosition
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._prevPosition = 0;

	/**
	 * The Bitmap used to render the current frame of the animation.
	 * @property _bitmap
	 * @type createjs.Bitmap
	 * @private
	 */
	p._bitmap = 0;

	/**
	 * An array of frame labels.
	 * @property _labels
	 * @type Array
	 * @private
	 */
	p._labels = 0;

	/**
	 * An array of textures.
	 * @property _frames
	 * @type Array
	 * @private
	 */
	p._frames = null;

	/**
	 * The current texture.
	 * @property _currentTexture
	 * @type cloudkid.TextureAtlas.Texture
	 * @private
	 */
	p._currentTexture = null;

	/**
	 * The origin point of the BitmapMovieClip.
	 * @property _origin
	 * @type createjs.Point
	 * @private
	 */
	p._origin = null;

	/**
	 * A scale to apply to the images in the BitmapMovieClip
	 * to restore normal size (if spritesheet was exported at a smaller or larger size).
	 * @property _scale
	 * @type Number
	 * @private
	 */
	p._scale = 1;

	//==== Public Methods =====

	/**
	 * Returns true or false indicating whether the display object would be visible if drawn to a canvas.
	 * This does not account for whether it would be visible within the boundaries of the stage.
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
	 **/
	p.isVisible = function() {
		// children are placed in draw, so we can't determine if we have content.
		return !!(this.visible && this.alpha > 0 && this.scaleX !== 0 && this.scaleY !== 0);
	};

	/**
	 * Draws the display object into the specified context ignoring its visible, alpha, shadow, and transform.
	 * Returns true if the draw was handled (useful for overriding functionality).
	 * NOTE: This method is mainly for internal use, though it may be useful for advanced uses.
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D context object to draw into.
	 * @param {Boolean} ignoreCache Indicates whether the draw operation should ignore any current cache.
	 * For example, used for drawing the cache (to prevent it from simply drawing an existing cache back
	 * into itself).
	 **/
	p.draw = function(ctx, ignoreCache) {
		// draw to cache first:
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		this._updateTimeline();
		s.draw.call(this, ctx, ignoreCache);//Container's call
		return true;
	};

	/**
	 * Sets paused to false.
	 * @method play
	 **/
	p.play = function() {
		this.paused = false;
	};
	
	/**
	 * Sets paused to true.
	 * @method stop
	 **/
	p.stop = function() {
		this.paused = true;
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to false.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 **/
	p.gotoAndPlay = function(positionOrLabel) {
		this.paused = false;
		this._goto(positionOrLabel);
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to true.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The animation or frame name to go to.
	 **/
	p.gotoAndStop = function(positionOrLabel) {
		this.paused = true;
		this._goto(positionOrLabel);
	};

	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in ms to advance by. Only applicable if framerate is set.
	 * @method advance
	*/
	p.advance = function(time) {
		if(!this.paused)
		{
			if(this._framerate > 0)
			{
				if(this.advanceDuringTicks)
					this._t += time * 0.001;//milliseconds -> seconds
				if(this._t > this._duration)
					this._t = this.loop ? this._t - this._duration : this._duration;
				this._prevPosition = Math.floor(this._t * this._framerate);
				if(this._prevPosition >= this._frames.length)
					this._prevPosition = this._frames.length - 1;
			}
			else if(this.advanceDuringTicks)
				this._prevPosition = this._prevPosition + 1;
			this._updateTimeline();
		}
	};
	
	/**
	 * Returns a sorted list of the labels defined on this BitmapMovieClip. Shortcut to TweenJS: Timeline.getLabels();
	 * @method getLabels
	 * @return {Array[Object]} A sorted array of objects with label and position (aka frame) properties.
	 **/
	p.getLabels = function() {
		return this._labels;
	};
	
	/**
	 * Returns the name of the label on or immediately before the current frame. See TweenJS: Timeline.getCurrentLabel()
	 * for more information.
	 * @method getCurrentLabel
	 * @return {String} The name of the current label or null if there is no label.
	 **/
	p.getCurrentLabel = function() {
		var labels = this._labels;
		var current = null;
		for(var i = 0, len = labels.length; i < len; ++i)
		{
			if(labels[i].position <= this.currentFrame)
				current = labels[i].label;
			else
				break;
		}
		return current;
	};

	/**
	 * Returns the name of the label on or immediately before the current frame. See TweenJS: Timeline.getCurrentLabel()
	 * for more information.
	 * @method init
	 * @param {TextureAtlas} atlas The texture atlas to pull frames from.
	 * @param {Object} data Initialization data
	 *  @param {int} [data.fps] Framerate to play the movieclip at. Omitting this will use the current framerate.
	 *  @param {Object} [data.labels] A dictionary of the labels in the movieclip to assist in playing animations.
	 *  @param {Object} [data.origin={x:0,y:0}] The origin of the movieclip.
	 *  @param {Array} [data.frames] An array of frame sequences to pull from the texture atlas.
	 *  @param {String} [data.frames.name] The name to use for the frame sequence. This should include a "#" to be replaced with the image number.
	 *  @param {int} [data.frames.min] The first frame number in the frame sequence.
	 *  @param {int} [data.frames.max] The last frame number in the frame sequence.
	 *  @param {int} [data.frames.digits=4] The maximum number of digits in the names of the frames, e.g. myAnim0001 has 4 digits.
	 *   @param {Number} [data.scale=1] The scale at which the art was exported, e.g. a scale of 1.4 means the art was increased
	 *          in size to 140% before exporting and should be scaled back down before drawing to the screen.
	 *
	 *  Format for data:
	 *	{
	 *		fps:30,
	 *		labels:
	 *		{
	 *			animStart:0,
	 *			animStart_loop:15
	 *		},
	 *		origin:{ x: 20, y:30 },
	 *		frames:
	 *		[
	 *			{
	 *				name:"myAnim#",
	 *				min:1,
	 *				max:20,
	 *				digits:4
	 *			}
	 *		]
	 *	}
	 *
	 * The object describes a 30 fps animation that is 20 frames long, and was originally myAnim0001.png->myAnim0020.png,
	 * with frame labels on the first and 16th frame. 'digits' is optional, and defaults to 4.
	 **/
	p.init = function(atlas, data)
	{
		//collect the frame labels
		var labels = this._labels = [];
		if(data.labels)
		{
			for(var name in data.labels)
			{
				labels.push({label:name, position: data.labels[name]});
			}
			labels.sort(labelSorter);
		}
		//collect the frames
		this._frames = [];
		for(var i = 0; i < data.frames.length; ++i)
		{
			var frameSet = data.frames[i];
			atlas.getFrames(frameSet.name, frameSet.min, frameSet.max, frameSet.digits, this._frames);
		}
		//set up the framerate
		if(data.fps)
			this.framerate = data.fps;
		else if(this._framerate)
			this.framerate = this._framerate;
		if(data.scale && data.scale > 0)
			this._scale = 1 / data.scale;
		else
			this._scale = 1;
		this._bitmap.scaleX = this._bitmap.scaleY = this._scale;
		if(data.origin)
			this._origin = new createjs.Point(data.origin.x * this._scale, data.origin.y * this._scale);
		else
			this._origin = new createjs.Point();
	};

	function labelSorter(a, b)
	{
		return a.position - b.position;
	}

	/**
	*	Copies the labels, textures, origin, and framerate from another BitmapMovieClip.
	*	The labels and textures are copied by reference, instead of a deep copy.
	*	@method copyFrom
	*	@param {BitmapMovieClip} other The movieclip to copy data from.
	*/
	p.copyFrom = function(other)
	{
		this._frames = other._frames;
		this._labels = other._labels;
		this._origin = other._origin;
		this._framerate = other._framerate;
		this._duration = other._duration;
		this._scale = other._scale;
		this._bitmap.scaleX = this._bitmap.scaleY = this._scale;
	};

	/**
	*	Destroys the BitmapMovieClip, removing all children and nulling all reference variables.
	*	@method destroy
	*/
	p.destroy = function()
	{
		this.removeAllChildren();
		this._bitmap = null;
		this._frames = null;
		this._origin = null;
	};

	//===== Private Methods =====

	/**
	 * @method _tick
	 * @param {Object} props Properties to copy to the DisplayObject {{#crossLink "DisplayObject/tick"}}{{/crossLink}} event object.
	 * function.
	 * @protected
	 **/
	p._tick = function(props) {
		this.advance(props&&props.delta);
		s._tick.call(this, props);
	};
	
	/**
	 * @method _goto
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 * @protected
	 **/
	p._goto = function(positionOrLabel) {
		var pos = null;
		if(typeof positionOrLabel == "string")
		{
			var labels = this._labels;
			for(var i = 0, len = labels.length; i < len; ++i)
			{
				if(labels[i].label == positionOrLabel)
				{
					pos = labels[i].position;
					break;
				}
			}
		}
		else
			pos = positionOrLabel;
		if (pos === null) { return; }
		this._prevPosition = pos;
		if(this._framerate > 0)
			this._t = pos / this._framerate;
		else
			this._t = 0;
		this._updateTimeline();
	};

	/**
	 * @method _updateTimeline
	 * @protected
	 **/
	p._updateTimeline = function() {
		if(this._prevPosition < 0)
			this._prevPosition = 0;
		else if(this._prevPosition >= this._frames.length)
			this._prevPosition = this._frames.length - 1;
		this.currentFrame = this._prevPosition;
		if(this._currentTexture != this._frames[this.currentFrame])
		{
			var tex = this._currentTexture = this._frames[this.currentFrame];
			this._bitmap.image = tex.image;
			this._bitmap.sourceRect = tex.frame;
			this._bitmap.x = -this._origin.x + tex.offset.x * this._bitmap.scaleX;
			this._bitmap.y = -this._origin.y + tex.offset.y * this._bitmap.scaleY;
		}
	};
	
	/**
	 * @method _reset
	 * @private
	 **/
	p._reset = function() {
		this._prevPosition = 0;
		this._t = 0;
		this.currentFrame = 0;
	};

	namespace('cloudkid').BitmapMovieClip = BitmapMovieClip;
	namespace('cloudkid.createjs').BitmapMovieClip = BitmapMovieClip;
}());
/**
*  @module cloudkid
*/
(function() {

	"use strict";

	/**
	*  Designed to provide utility related to Bitmaps.
	*  @class BitmapUtils
	*/
	var BitmapUtils = {};

	/**
	*	Replaces Bitmaps in the global lib dictionary with a version that pulls the image from a spritesheet.
	*
	*	@method loadSpriteSheet
	*	@static
	*	@param {Object} frameDict A dictionary of frame information, with frame, trimmed, 
	*		and spriteSourceSize properties (like the JSON hash output from TexturePacker).
	*	@param {Image|HTMLCanvasElement} spritesheetImage The spritesheet image that contains all of the frames.
	*	@param {Number} [scale=1] The scale to apply to all sprites from the spritesheet. 
	*		For example, a half sized spritesheet should have a scale of 2.
	*/
	BitmapUtils.loadSpriteSheet = function(frameDict, spritesheetImage, scale)
	{
		if(scale > 0) 
		{
			// Do nothing
		}
		else
		{
			scale = 1;//scale should default to 1
		}

		for(var key in frameDict)
		{
			var frame = frameDict[key];
			var index = key.indexOf(".");
			if(index > 0)
				key = key.substring(0, index);//remove any file extension from the frame id
			var bitmap = lib[key];
			/* jshint ignore:start */
			var newBitmap = lib[key] = function()
			{
				createjs.Container.call(this);
				var child = new createjs.Bitmap(this._image);
				this.addChild(child);
				child.sourceRect = this._frameRect;
				var s = this._scale;
				child.setTransform(this._frameOffsetX * s, this._frameOffsetY * s, s, s);
			};
			/* jshint ignore:end */
			var p = newBitmap.prototype = new createjs.Container();
			p._image = spritesheetImage;//give it a reference to the spritesheet
			p._scale = scale;//tell it what scale to use on the Bitmap to bring it to normal size
			var frameRect = frame.frame;
			//save the source rectangle of the sprite
			p._frameRect = new createjs.Rectangle(frameRect.x, frameRect.y, frameRect.w, frameRect.h);
			//if the sprite is trimmed, then save the amount that was trimmed off the left and top sides
			if(frame.trimmed)
			{
				p._frameOffsetX = frame.spriteSourceSize.x;
				p._frameOffsetY = frame.spriteSourceSize.y;
			}
			else
				p._frameOffsetX = p._frameOffsetY = 0;
			if(bitmap && bitmap.prototype.nominalBounds)
				p.nominalBounds = bitmap.prototype.nominalBounds;//keep the nominal bounds from the original bitmap, if it existed
			else
				p.nominalBounds = new createjs.Rectangle(0, 0, frame.sourceSize.w, frame.sourceSize.h);
		}
	};

	/**
	*	Replaces Bitmaps in the global lib dictionary with a version that uses a scaled bitmap, so you can load up
	*	smaller bitmaps behind the scenes that are scaled back up to normal size, or high res bitmaps that are
	*	scaled down.
	*
	*	@method replaceWithScaledBitmap
	*	@static
	*	@param {String|Object} idOrDict A dictionary of Bitmap ids to replace, or a single id.
	*	@param {Number} [scale] The scale to apply to the image(s).
	*/
	BitmapUtils.replaceWithScaledBitmap = function(idOrDict, scale)
	{
		//scale is required, but it doesn't hurt to check - also, don't bother for a scale of 1
		if(scale != 1 && scale > 0) 
		{
			// Do nothing
		}
		else
		{
			return;
		}

		var key, bitmap, newBitmap, p;
		if(typeof idOrDict == "string")
		{
			key = idOrDict;
			bitmap = lib[key];
			if(bitmap)
			{
				/* jshint ignore:start */
				newBitmap = lib[key] = function()
				{
					createjs.Container.call(this);
					var child = new this._oldBM();
					this.addChild(child);
					child.setTransform(0, 0, this._scale, this._scale);
				};
				/* jshint ignore:end */
				p = newBitmap.prototype = new createjs.Container();
				p._oldBM = bitmap;//give it a reference to the Bitmap
				p._scale = scale;//tell it what scale to use on the Bitmap to bring it to normal size
				p.nominalBounds = bitmap.prototype.nominalBounds;//keep the nominal bounds
			}
		}
		else
		{
			for(key in idOrDict)
			{
				bitmap = lib[key];
				if(bitmap)
				{
					/* jshint ignore:start */
					newBitmap = lib[key] = function()
					{
						createjs.Container.call(this);
						var child = new this._oldBM();
						this.addChild(child);
						child.setTransform(0, 0, this._scale, this._scale);
					};
					/* jshint ignore:end */
					p = newBitmap.prototype = new createjs.Container();
					p._oldBM = bitmap;//give it a reference to the Bitmap
					p._scale = scale;//tell it what scale to use on the Bitmap to bring it to normal size
					p.nominalBounds = bitmap.prototype.nominalBounds;//keep the nominal bounds
				}
			}
		}
	};

	namespace('cloudkid').BitmapUtils = BitmapUtils;
	namespace('cloudkid.createjs').BitmapUtils = BitmapUtils;
}());
/**
*  @module cloudkid
*/
(function(undefined) {

	"use strict";
	
	/**
	*  A Multipurpose button class. It is designed to have one image, and an optional text label.
	*  The button can be a normal button or a selectable button.
	*  The button functions similarly with both CreateJS and PIXI, but slightly differently in
	*  initialization and callbacks. Add event listeners for click and mouseover to know about 
	*  button clicks and mouse overs, respectively.
	* 
	*  @class Button
	*  @extends createjs.Container
	*  @constructor
	*  @param {Object|Image|HTMLCanvasElement} [imageSettings] Information about the art to be used for button states, as well as if the button is selectable or not.
	*         If this is an Image or Canvas element, then the button assumes that the image is full width and 3 images
	*         tall, in the order (top to bottom) up, over, down. If so, then the properties of imageSettings are ignored.
	*  @param {Image|HTMLCanvasElement} [imageSettings.image] The image to use for all of the button states.
	*  @param {Array} [imageSettings.priority=null] The state priority order. If omitted, defaults to ["disabled", "down", "over", "up"].
	*         Previous versions of Button used a hard coded order: ["highlighted", "disabled", "down", "over", "selected", "up"].
	*  @param {Object} [imageSettings.up] The visual information about the up state.
	*  @param {createjs.Rectangle} [imageSettings.up.src] The sourceRect for the state within the image.
	*  @param {createjs.Rectangle} [imageSettings.up.trim=null] Trim data about the state, where x & y are how many pixels were 
	*         trimmed off the left and right, and height & width are the untrimmed size of the button.
	*  @param {Object} [imageSettings.up.label=null] Label information specific to this state. Properties on this parameter override data 
	*         in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	*  @param {Object} [imageSettings.over=null] The visual information about the over state. If omitted, uses the up state.
	*  @param {createjs.Rectangle} [imageSettings.over.src] The sourceRect for the state within the image.
	*  @param {createjs.Rectangle} [imageSettings.over.trim=null] Trim data about the state, where x & y are how many pixels were 
	*         trimmed off the left and right, and height & width are the untrimmed size of the button.
	*  @param {Object} [imageSettings.over.label=null] Label information specific to this state. Properties on this parameter override data 
	*         in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	*  @param {Object} [imageSettings.down=null] The visual information about the down state. If omitted, uses the up state.
	*  @param {createjs.Rectangle} [imageSettings.down.src] The sourceRect for the state within the image.
	*  @param {createjs.Rectangle} [imageSettings.down.trim=null] Trim data about the state, where x & y are how many pixels were 
	*         trimmed off the left and right, and height & width are the untrimmed size of the button.
	*  @param {Object} [imageSettings.down.label=null] Label information specific to this state. Properties on this parameter override data 
	*         in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	*  @param {Object} [imageSettings.disabled=null] The visual information about the disabled state. If omitted, uses the up state.
	*  @param {createjs.Rectangle} [imageSettings.disabled.src] The sourceRect for the state within the image.
	*  @param {createjs.Rectangle} [imageSettings.disabled.trim=null] Trim data about the state, where x & y are how many pixels were 
	*         trimmed off the left and right, and height & width are the untrimmed size of the button.
	*  @param {Object} [imageSettings.disabled.label=null] Label information specific to this state. Properties on this parameter override 
	*         data in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	*  @param {Object} [imageSettings.<yourCustomState>=null] The visual information about a custom state found in imageSettings.priority.
	*         Any state added this way has a property of the same name added to the button. Examples of previous states that have been
	*         moved to this system are "selected" and "highlighted".
	*  @param {createjs.Rectangle} [imageSettings.<yourCustomState>.src] The sourceRect for the state within the image.
	*  @param {createjs.Rectangle} [imageSettings.<yourCustomState>.trim=null] Trim data about the state, where x & y are how many pixels 
	*         were trimmed off the left and right, and height & width are the untrimmed size of the button.
	*  @param {Object} [imageSettings.<yourCustomState>.label=null] Label information specific to this state. Properties on this parameter 
	*         override data in the label parameter for this button state only. All values except "text" from the label parameter may be
	*         overridden.
	*  @param {createjs.Point} [imageSettings.origin=null] An optional offset for all button graphics, in case you want button 
	*         positioning to not include a highlight glow, or any other reason you would want to offset the button art and label.
	*  @param {Object} [label=null] Information about the text label on the button. Omitting this makes the button not use a label.
	*  @param {String} [label.text] The text to display on the label.
	*  @param {String} [label.font] The font name and size to use on the label, as createjs.Text expects.
	*  @param {String} [label.color] The color of the text to use on the label, as createjs.Text expects.
	*  @param {String} [label.textBaseline="middle"] The baseline for the label text, as createjs.Text expects.
	*  @param {Object} [label.stroke=null] The stroke to use for the label text, if desired, as createjs.Text (CloudKid fork only) expects.
	*  @param {createjs.Shadow} [label.shadow=null] A shadow object to apply to the label text.
	*  @param {String|Number} [label.x="center"] An x position to place the label text at relative to the button. If omitted,
	*         "center" is used, which attempts to horizontally center the label on the button.
	*  @param {String|Number} [label.y="center"] A y position to place the label text at relative to the button. If omitted,
	*         "center" is used, which attempts to vertically center the label on the button. This may be unreliable -
	*         see documentation for createjs.Text.getMeasuredLineHeight().
	*  @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	*/
	var Button = function(imageSettings, label, enabled)
	{
		if(!imageSettings) return;
		this.initialize(imageSettings, label, enabled);
	};
	
	// Extend Container
	var p = Button.prototype = new createjs.Container();
	
	var s = createjs.Container.prototype;//super
	
	/**
	*  The sprite that is the body of the button.
	*  @public
	*  @property {createjs.Bitmap} back
	*  @readOnly
	*/
	p.back = null;

	/**
	*  The text field of the button. The label is centered by both width and height on the button.
	*  @public
	*  @property {createjs.Text} label
	*  @readOnly
	*/
	p.label = null;
	
	//===callbacks for mouse/touch events
	/**
	* Callback for mouse over, bound to this button.
	* @private
	* @property {Function} _overCB
	*/
	p._overCB = null;

	/**
	* Callback for mouse out, bound to this button.
	* @private
	* @property {Function} _outCB
	*/
	p._outCB = null;

	/**
	* Callback for mouse down, bound to this button.
	* @private
	* @property {Function} _downCB
	*/
	p._downCB = null;

	/**
	* Callback for press up, bound to this button.
	* @private
	* @property {Function} _upCB
	*/
	p._upCB = null;

	/**
	* Callback for click, bound to this button.
	* @private
	* @property {Function} _clickCB
	*/
	p._clickCB = null;
	
	/**
	* A dictionary of state booleans, keyed by state name.
	* @private
	* @property {Object} _stateFlags
	*/
	p._stateFlags = null;
	/**
	* An array of state names (Strings), in their order of priority.
	* The standard order previously was ["highlighted", "disabled", "down", "over", "selected", "up"].
	* @private
	* @property {Array} _statePriority
	*/
	p._statePriority = null;
	
	/**
	* A dictionary of state graphic data, keyed by state name.
	* Each object contains the sourceRect (src) and optionally 'trim', another Rectangle.
	* Additionally, each object will contain a 'label' object if the button has a text label.
	* @private
	* @property {Object} _stateData
	*/
	p._stateData = null;

	/**
	* The width of the button art, independent of the scaling of the button itself.
	* @private
	* @property {Number} _width
	*/
	p._width = 0;

	/**
	* The height of the button art, independent of the scaling of the button itself.
	* @private
	* @property {Number} _height
	*/
	p._height = 0;

	/**
	* An offset to button positioning, generally used to adjust for a highlight around the button.
	* @private
	* @property {createjs.Point} _offset
	*/
	p._offset = null;
	
	/**
	* An event for when the button is pressed (while enabled).
	* @public
	* @static
	* @property {String} BUTTON_PRESS
	*/
	Button.BUTTON_PRESS = "buttonPress";
	
	/*
	* A list of state names that should not have properties autogenerated.
	* @private
	* @static
	* @property {Array} RESERVED_STATES
	*/
	var RESERVED_STATES = ["disabled", "enabled", "up", "over", "down"];
	/*
	* A state priority list to use as the default.
	* @private
	* @static
	* @property {Array} DEFAULT_PRIORITY
	*/
	var DEFAULT_PRIORITY = ["disabled", "down", "over", "up"];
	
	/** 
	*  Constructor for the button when using CreateJS.
	*  @method initialize
	*  @param {Object|Image|HTMLCanvasElement} [imageSettings] See the constructor for more information
	*  @param {Object} [label=null] Information about the text label on the button. Omitting this makes the button not use a label.
	*  @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	*/
	p.initialize = function(imageSettings, label, enabled)
	{
		s.initialize.call(this);

		this.mouseChildren = false;//input events should have this button as a target, not the child Bitmap.
		
		this._downCB = this._onMouseDown.bind(this);
		this._upCB = this._onMouseUp.bind(this);
		this._overCB = this._onMouseOver.bind(this);
		this._outCB = this._onMouseOut.bind(this);
		this._clickCB = this._onClick.bind(this);
		
		var _stateData = this._stateData = {};
		this._stateFlags = {};
		this._offset = new createjs.Point();
		
		//a clone of the label data to use as a default value, without changing the original
		var labelData;
		if(label)
		{
			labelData = clone(label);
			delete labelData.text;
			if(labelData.x === undefined)
				labelData.x = "center";
			if(labelData.y === undefined)
				labelData.y = "center";
		}
		
		var image, width, height, i, state;
		if(imageSettings.image)//is a settings object with rectangles
		{
			image = imageSettings.image;
			this._statePriority = imageSettings.priority || DEFAULT_PRIORITY;
			//each rects object has a src property (createjs.Rectangle), and optionally a trim rectangle
			for(i = this._statePriority.length - 1; i >= 0; --i)//start at the end to start at the up state
			{
				state = this._statePriority[i];
				//set up the property for the state so it can be set - the function will ignore reserved states
				this._addProperty(state);
				//set the default value for the state flag
				if(state != "disabled" && state != "up")
					this._stateFlags[state] = false;
				var inputData = imageSettings[state];
				//it's established that over, down, and particularly disabled default to the up state
				_stateData[state] = inputData ? clone(inputData) : _stateData.up;
				//set up the label info for this state
				if(label)
				{
					//if there is actual label data for this state, use that
					if(inputData && inputData.label)
					{
						inputData = inputData.label;
						var stateLabel = _stateData[state].label = {};
						stateLabel.font = inputData.font || labelData.font;
						stateLabel.color = inputData.color || labelData.color;
						stateLabel.stroke = inputData.hasOwnProperty("stroke") ? inputData.stroke : labelData.stroke;
						stateLabel.shadow = inputData.hasOwnProperty("shadow") ? inputData.shadow : labelData.shadow;
						stateLabel.textBaseline = inputData.textBaseline || labelData.textBaseline;
						stateLabel.x = inputData.x || labelData.x;
						stateLabel.y = inputData.y || labelData.y;
					}
					//otherwise use the default
					else
						_stateData[state].label = labelData;
				}
			}
			if(_stateData.up.trim)//if the texture is trimmed, use that for the sizing
			{
				var upTrim = _stateData.up.trim;
				width = upTrim.width;
				height = upTrim.height;
			}
			else//texture is not trimmed and is full size
			{
				width = _stateData.up.src.width;
				height = _stateData.up.src.height;
			}
			//ensure that our required states exist
			if(!_stateData.up)
			{
				Debug.error("Button lacks an up state! This is a serious problem! Input data follows:");
				Debug.error(imageSettings);
			}
			if(!_stateData.over)
				_stateData.over = _stateData.up;
			if(!_stateData.down)
				_stateData.down = _stateData.up;
			if(!_stateData.disabled)
				_stateData.disabled = _stateData.up;
			//set up the offset
			if(imageSettings.offset)
			{
				this._offset.x = imageSettings.offset.x;
				this._offset.y = imageSettings.offset.y;
			}
			else
			{
				this._offset.x = this._offset.y = 0;
			}
		}
		else//imageSettings is just an image to use directly - use the old stacked images method
		{
			image = imageSettings;
			width = image.width;
			height = image.height / 3;
			this._statePriority = DEFAULT_PRIORITY;
			_stateData.disabled = _stateData.up = {src:new createjs.Rectangle(0, 0, width, height)};
			_stateData.over = {src:new createjs.Rectangle(0, height, width, height)};
			_stateData.down = {src:new createjs.Rectangle(0, height * 2, width, height)};
			if(labelData)
			{
				_stateData.up.label = 
				_stateData.over.label = 
				_stateData.down.label = 
				_stateData.disabled.label = labelData;
			}
			this._offset.x = this._offset.y = 0;
		}
		
		this.back = new createjs.Bitmap(image);
		this.addChild(this.back);
		this._width = width;
		this._height = height;
		
		if(label)
		{
			this.label = new createjs.Text(label.text || "", _stateData.up.label.font, _stateData.up.label.color);
			this.addChild(this.label);
		}
		
		//set the button state initially
		this.enabled = enabled === undefined ? true : !!enabled;
	};
	
	/*
	*  A simple function for making a shallow copy of an object.
	*/
	function clone(obj)
	{
		if (!obj || "object" != typeof obj) return null;
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}
	
	/**
	*  The width of the button, based on the width of back. This value is affected by scale.
	*  @property {Number} width
	*/
	Object.defineProperty(p, "width", {
		get:function(){return this._width * this.scaleX;},
		set:function(value){
			this.scaleX = value / this._width;
		}
	});

	/**
	*  The height of the button, based on the height of back. This value is affected by scale.
	*  @property {Number} height
	*/
	Object.defineProperty(p, "height", {
		get:function(){return this._height * this.scaleY;},
		set:function(value){
			this.scaleY = value / this._height;
		}
	});
	
	/**
	*  Sets the text of the label. This does nothing if the button was not initialized with a label.
	*  @public
	*  @method setText
	*  @param {String} text The text to set the label to.
	*/
	p.setText = function(text)
	{
		if(this.label)
		{
			this.label.text = text;
			var data;
			for(var i = 0; i < this._statePriority.length; ++i)
			{
				if(this._stateFlags[this._statePriority[i]])
				{
					data = this._stateData[this._statePriority[i]];
					break;
				}
			}
			if(!data)
				data = this._stateData.up;
			data = data.label;
			if(data.x == "center")
				this.label.x = (this._width - this.label.getMeasuredWidth()) * 0.5 + this._offset.x;
			else
				this.label.x = data.x + this._offset.x;
			if(data.y == "center")
				this.label.y = this._height * 0.5 + this._offset.y;
			else
				this.label.y = data.y + this._offset.y;
		}
	};
	
	/**
	*  Whether or not the button is enabled.
	*  @property {Boolean} enabled
	*  @default true
	*/
	Object.defineProperty(p, "enabled", {
		get: function() { return !this._stateFlags.disabled; },
		set: function(value)
		{
			this._stateFlags.disabled = !value;
			
			if(value)
			{
				this.cursor = 'pointer';
				this.addEventListener('mousedown', this._downCB);
				this.addEventListener('mouseover', this._overCB);
				this.addEventListener('mouseout', this._outCB);
			}
			else
			{
				this.cursor = null;
				this.removeEventListener('mousedown', this._downCB);
				this.removeEventListener('mouseover', this._overCB);
				this.removeEventListener('mouseout', this._outCB);
				this.removeEventListener('pressup', this._upCB);
				this.removeEventListener("click", this._clickCB);
				this._stateFlags.down = this._stateFlags.over = false;
			}
			
			this._updateState();
		}
	});
	
	/**
	*  Adds a property to the button. Setting the property sets the value in
	*  _stateFlags and calls _updateState().
	*  @private
	*  @method _addProperty
	*  @param {String} propertyName The property name to add to the button.
	*/
	p._addProperty = function(propertyName)
	{
		//check to make sure we don't add reserved names
		if(RESERVED_STATES.indexOf(propertyName) >= 0) return;
		
		Object.defineProperty(this, propertyName, {
			get: function() { return this._stateFlags[propertyName]; },
			set: function(value)
			{
				this._stateFlags[propertyName] = value;
				this._updateState();
			}
		});
	};
	
	/**
	*  Updates back based on the current button state.
	*  @private
	*  @method _updateState
	*/
	p._updateState = function()
	{
		if(!this.back) return;
		var data;
		//use the highest priority state
		for(var i = 0; i < this._statePriority.length; ++i)
		{
			if(this._stateFlags[this._statePriority[i]])
			{
				data = this._stateData[this._statePriority[i]];
				break;
			}
		}
		//if no state is active, use the up state
		if(!data)
			data = this._stateData.up;
		this.back.sourceRect = data.src;
		//position the button back
		if(data.trim)
		{
			this.back.x = data.trim.x + this._offset.x;
			this.back.y = data.trim.y + this._offset.y;
		}
		else
		{
			this.back.x = this._offset.x;
			this.back.y = this._offset.y;
		}
		//if we have a label, update that too
		if(this.label)
		{
			data = data.label;
			//update the text properties
			this.label.textBaseline = data.textBaseline || "middle";//Middle is easy to center
			this.label.stroke = data.stroke;
			this.label.shadow = data.shadow;
			this.label.font = data.font;
			this.label.color = data.color || "#000";//default for createjs.Text
			//position the text
			if(data.x == "center")
				this.label.x = (this._width - this.label.getMeasuredWidth()) * 0.5 + this._offset.x;
			else
				this.label.x = data.x + this._offset.x;
			if(data.y == "center")
				this.label.y = this._height * 0.5 + this._offset.y;
			else
				this.label.y = data.y + this._offset.y;
		}
	};
	
	/**
	*  The callback for when the button receives a mouse down event.
	*  @private
	*  @method _onMouseDown
	*/
	p._onMouseDown = function(e)
	{
		this.addEventListener('pressup', this._upCB);
		this.addEventListener("click", this._clickCB);
		this._stateFlags.down = true;
		this._updateState();
	};
	
	/**
	*  The callback for when the button for when the mouse/touch is released on the button
	*  - only when the button was held down initially.
	*  @private
	*  @method _onMouseUp
	*/
	p._onMouseUp = function(e)
	{
		this.removeEventListener('pressup', this._upCB);
		this.removeEventListener("click", this._clickCB);
		this._stateFlags.down = false;
		//if the over flag is true, then the mouse was released while on the button, thus being a click
		this._updateState();
	};

	/**
	*  The callback for when the button the button is clicked or tapped on. This is
	*  the most reliable way of detecting mouse up/touch end events that are on this button
	*  while letting the pressup event handle the mouse up/touch ends on and outside the button.
	*  @private
	*  @method _onClick
	*/
	p._onClick = function(e)
	{
		this.dispatchEvent(new createjs.Event(Button.BUTTON_PRESS));
	};
	
	/**
	*  The callback for when the button is moused over.
	*  @private
	*  @method _onMouseOver
	*/
	p._onMouseOver = function(e)
	{
		this._stateFlags.over = true;
		this._updateState();
	};
	
	/**
	*  The callback for when the mouse leaves the button area.
	*  @private
	*  @method _onMouseOut
	*/
	p._onMouseOut = function(e)
	{
		this._stateFlags.over = false;
		this._updateState();
	};
	
	/**
	*  Destroys the button.
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.removeAllChildren();
		this.removeAllEventListeners();
		this._downCB = null;
		this._upCB = null;
		this._overCB = null;
		this._outCB = null;
		this.back = null;
		this.label = null;
		this._statePriority = null;
		this._stateFlags = null;
		this._stateData = null;
	};

	/**
	*  Generates a desaturated up state as a disabled state, and an update with a solid colored glow for a highlighted state.
	*  @method generateDefaultStates
	*  @static
	*  @param {Image|HTMLCanvasElement} image The image to use for all of the button states, in the standard up/over/down format.
	*  @param {Object} [disabledSettings] The settings object for the disabled state. If omitted, no disabled state is created.
	*  @param {Number} [disabledSettings.saturation] The saturation adjustment for the disabled state. 
	*         100 is fully saturated, 0 is unchanged, -100 is desaturated.
	*  @param {Number} [disabledSettings.brightness] The brightness adjustment for the disabled state. 
	*         100 is fully bright, 0 is unchanged, -100 is completely dark.
	*  @param {Number} [disabledSettings.contrast] The contrast adjustment for the disabled state. 
	*         100 is full contrast, 0 is unchanged, -100 is no contrast.
	*  @param {Object} [highlightSettings] The settings object for the highlight state. If omitted, no state is created.
	*  @param {Number} [highlightSettings.size] How many pixels to make the glow, eg 8 for an 8 pixel increase on each side.
	*  @param {Number} [highlightSettings.red] The red value for the glow, from 0 to 255.
	*  @param {Number} [highlightSettings.green] The green value for the glow, from 0 to 255.
	*  @param {Number} [highlightSettings.blue] The blue value for the glow, from 0 to 255.
	*  @param {Number} [highlightSettings.alpha] The alpha value for the glow, from 0 to 255, with 0 being transparent and 255 fully opaque.
	*/
	Button.generateDefaultStates = function(image, disabledSettings, highlightSettings)
	{
		//figure out the normal button size
		var buttonWidth = image.width;
		var buttonHeight = image.height / 3;
		//create a canvas element and size it
		var canvas = document.createElement("canvas");
		var width = buttonWidth;
		var height = image.height;
		if(disabledSettings)
		{
			height += buttonHeight;
		}
		if(highlightSettings)
		{
			width += highlightSettings.size * 2;
			height += buttonHeight + highlightSettings.size * 2;
		}
		canvas.width = width;
		canvas.height = height;
		//get the drawing context
		var context = canvas.getContext("2d");
		//draw the image to it
		context.drawImage(image, 0, 0);
		//start setting up the output
		var output = {
			image: canvas,
			up:{ src:new createjs.Rectangle(0, 0, buttonWidth, buttonHeight) },
			over:{ src:new createjs.Rectangle(0, buttonHeight, buttonWidth, buttonHeight) },
			down:{ src:new createjs.Rectangle(0, buttonHeight * 2, buttonWidth, buttonHeight) }
		};
		//set up a bitmap to draw other states with
		var drawingBitmap = new createjs.Bitmap(image);
		drawingBitmap.sourceRect = output.up.src;
		//set up a y position for where the next state should go in the canvas
		var nextY = image.height;
		if(disabledSettings)
		{
			context.save();
			//position the button to draw
			context.translate(0, nextY);
			//set up the desaturation matrix
			var matrix = new createjs.ColorMatrix();
			if(disabledSettings.saturation !== undefined)
				matrix.adjustSaturation(disabledSettings.saturation);
			if(disabledSettings.brightness !== undefined)
				matrix.adjustBrightness(disabledSettings.brightness * 2.55);//convert to CreateJS's -255->255 system from -100->100
			if(disabledSettings.contrast !== undefined)
				matrix.adjustContrast(disabledSettings.contrast);
			drawingBitmap.filters = [new createjs.ColorMatrixFilter(matrix)];
			//draw the state
			drawingBitmap.cache(0, 0, output.up.src.width, output.up.src.height);
			drawingBitmap.draw(context);
			//update the output with the state
			output.disabled = { src: new createjs.Rectangle(0, nextY, buttonWidth, buttonHeight) };
			nextY += buttonHeight;//set up the next position for the highlight state, if we have it
			context.restore();//reset any transformations
		}
		if(highlightSettings)
		{
			context.save();
			//calculate the size of this state
			var highlightStateWidth = buttonWidth + highlightSettings.size * 2;
			var highlightStateHeight = buttonHeight + highlightSettings.size * 2;
			//set up the color changing filter
			drawingBitmap.filters = [new createjs.ColorFilter(0,0,0,1, 
				/*r*/highlightSettings.red, 
				/*g*/highlightSettings.green, 
				/*b*/highlightSettings.blue, 
				highlightSettings.alpha !== undefined ? -255 + highlightSettings.alpha : 0)];
			//size the colored highlight
			drawingBitmap.scaleX = (highlightStateWidth) / buttonWidth;
			drawingBitmap.scaleY = (highlightStateHeight) / buttonHeight;
			//position it
			drawingBitmap.x = 0;
			drawingBitmap.y = nextY;
			//draw the state
			drawingBitmap.cache(0, 0, highlightStateWidth, highlightStateHeight);
			drawingBitmap.updateContext(context);
			drawingBitmap.draw(context);
			context.restore();//reset any transformations
			//size and position it to normal
			drawingBitmap.scaleX = drawingBitmap.scaleY = 1;
			drawingBitmap.x = highlightSettings.size;
			drawingBitmap.y = nextY + highlightSettings.size;
			drawingBitmap.filters = null;
			drawingBitmap.uncache();
			//draw the up state over the highlight state glow
			drawingBitmap.updateContext(context);
			drawingBitmap.draw(context);
			//set up the trim values for the other states
			var trim = new createjs.Rectangle(
				highlightSettings.size, 
				highlightSettings.size, 
				highlightStateWidth,
				highlightStateHeight);
			output.up.trim = trim;
			output.over.trim = trim;
			output.down.trim = trim;
			if(output.disabled)
				output.disabled.trim = trim;
			//set up the highlight state for the button
			output.highlighted = {
				src:new createjs.Rectangle(0, nextY, highlightStateWidth, highlightStateHeight)
			};
			//set up the state priority to include the highlighted state
			output.priority = DEFAULT_PRIORITY.slice();
			output.priority.unshift("highlighted");
			//add in an offset to the button to account for the highlight glow without affecting button positioning
			output.offset = {x: -highlightSettings.size, y: -highlightSettings.size};
		}
		return output;
	};

	namespace('cloudkid').Button = Button;
	namespace('cloudkid.createjs').Button = Button;
}());

/**
*  @module cloudkid
*/
(function(){
	
	"use strict";

	/**
	*   CharacterClip is used by the CharacterController class
	*   
	*   @class CharacterClip
	*   @constructor
	*   @param {String} event Animator event to play
	*   @param {int} loops The number of loops
	*/
	var CharacterClip = function(event, loops)
	{
		this.initialize(event, loops);
	};
	
	var p = CharacterClip.prototype;
	
	/**
	* The event to play
	*
	*@property {String} event
	*/
	p.event = null;
	
	/**
	* The number of times to loop
	* 
	* @property {int} loops
	*/
	p.loops = 0;
	
	/**
	*   Initialiaze this character clip
	*   
	*   @function initialize
	*   @param {String} event The frame label to play using Animator.play
	*   @param {int} loops The number of times to loop, default of 0 plays continuously
	*/
	p.initialize = function(event, loops)
	{
		this.event = event;
		this.loops = loops || 0;
	};
	
	// Assign to the cloudkid namespace
	namespace('cloudkid').CharacterClip = CharacterClip;
	namespace('cloudkid.createjs').CharacterClip = CharacterClip;
}());
/**
*  @module cloudkid
*/
(function(){

	"use strict";

	// Imports
	var Animator = cloudkid.createjs.Animator;
	
	/**
	*   Character Controller class is designed to play animated
	*   sequences on the timeline. This is a flexible way to
	*   animate characters on a timeline
	*   
	*   @class CharacterController
	*/
	var CharacterController = function()
	{
		this.initialize();
	};
	
	var p = CharacterController.prototype;
	
	/**
	* The current stack of animations to play
	*
	* @property {Array} _animationStack
	* @private
	*/
	p._animationStack = null;
	
	/**
	* The currently playing animation 
	* 
	* @property {CharacterClip} _currentAnimation
	* @private
	*/
	p._currentAnimation = null;
	
	/**
	* Current number of loops for the current animation
	* 
	* @property {int} _loops
	* @private
	*/
	p._loops = 0;
	
	/**
	* If the current animation choreographies can't be interrupted 
	* 
	* @property {bool} _interruptable
	* @private
	*/
	p._interruptable = true;
	
	/**
	* If frame dropping is allowed for this animation set
	* 
	* @property {bool} _allowFrameDropping
	* @private
	*/
	p._allowFrameDropping = false;
	
	/**
	* The current character
	* 
	* @property {createjs.MovieClip} _character
	* @private
	*/
	p._character = null;
	
	/**
	* Callback function for playing animation 
	* 
	* @property {function} _callback
	* @private
	*/
	p._callback = null;
	
	/** 
	* If this instance has been destroyed
	* 
	* @property {bool} _destroyed
	* @private
	*/
	p._destroyed = false;
	
	/**
	* Initiliazes this Character controller
	* 
	* @function initialize
	*/
	p.initialize = function()
	{
		this._animationStack = [];
	};
	
	/**
	*   Set the current character, setting to null clears character
	*   
	*   @function setCharacter
	*   @param {createjs.MovieClip} character MovieClip
	*/
	p.setCharacter = function(character)
	{
		this.clear();
		this._character = character;
		if (this._character)
		{
			Debug.assert(this._character instanceof createjs.MovieClip, "character must subclass MovieClip");
			this._character.stop();
		}
	};
	
	/**
	*   If we want to play a static frame
	*   
	*   @function gotoFrameAndStop
	*   @param {String} event The frame label to stop on
	*/
	p.gotoFrameAndStop = function(event)
	{
		Debug.assert(this._character, "gotoFrameAndStop() requires a character!");
		Animator.stop(this._character);
		this._animationStack.length = 0;
		this._character.gotoAndStop(event);
	};
	
	/**
	 * Will play a sequence of animations
	 * 
	 * @function playClips
	 * @param {Array} clips an array of CharacterClip objects
	 * @param {function} callback Callback for when the animations are either done, or
	 *             have been interrupted. Will pass true is interrupted,
	 *             false if they completed
	 * @param {bool} interruptable If calling this can interrupt the current animation(s)
	 * @param {bool} cancelPreviousCallback Cancel the callback the last time this was called
	 * @param {bool} allowFrameDropping If frame dropping is allowed for this frame, if the Animator is doing frame drop checks
	 */
	p.playClips = function(clips, callback, interruptable, cancelPreviousCallback, allowFrameDropping)
	{
		callback = callback || null;
		interruptable = interruptable || true;
		cancelPreviousCallback = cancelPreviousCallback || true;
		allowFrameDropping = allowFrameDropping || true;
		
		Debug.assert(this._character, "playClips requires a character!");
		
		if (!this._interruptable) return;
		
		Animator.stop(this._character);
		
		this._interruptable = interruptable;
		
		if (this._callback && !cancelPreviousCallback)
		{
			this._callback(true);
		}
		
		this._callback = callback;
		this._animationStack.length = 0;
		for(var c in clips)
		{
			this._animationStack.push(clips[c]);
		}
		this._allowFrameDropping = allowFrameDropping;
		
		this.startNext();
	};
	
	/**
	*   Start the next animation in the sequence
	*   
	*   @function startNext
	*/
	p.startNext = function()
	{
		this._loops = 0;
		if (this._animationStack.length > 0)
		{
			this._currentAnimation = this._animationStack.shift();
			Animator.play(
				this._character, 
				this._currentAnimation.event, 
				this._animationComplete.bind(this), 
				[this], 
				this._allowFrameDropping
			);	
		}
		else if(this._callback)
		{
			this._interruptable = true;
			var cb = this._callback;
			this._callback = null;
			cb(false);
		}
	};
	
	/**
	*   When the animation has completed playing
	*   
	*   @function _animationComplete
	*   @private
	*/
	p._animationComplete = function()
	{		
		this._loops++;
		
		if(this._currentAnimation.loops === 0 || this._loops < this._currentAnimation.loops)
		{
			Animator.play(
				this._character, 
				this._currentAnimation.event, 
				this._animationComplete.bind(this), 
				null, 
				this._allowFrameDropping
			);
		}
		else if (this._currentAnimation.loops == this._loops)
		{
			this.startNext();
		}
	};
	
	/**
	*   Clear any animations for the current character
	*   
	*   @function clear
	*/
	p.clear = function()
	{
		if (this._character)
		{
			Animator.stop(this._character);
		}
		this._currentAnimation = null;
		this._interruptable = true;
		this._callback = null;
		this._animationStack.length = 0;
		this._loops = 0;
	};
	
	/**
	*  Don't use after this
	*  
	*  @function destroy
	*/
	p.destroy = function()
	{
		if(this._destroyed) return;
		
		this._destroyed = true;
		this.clear();
		this._character = null;
		this._animationStack = null;
	};
	
	// Assign to the cloudkid namespace
	namespace('cloudkid').CharacterController = CharacterController;
	namespace('cloudkid.createjs').CharacterController = CharacterController;
}());
/**
*  @module cloudkid
*/
(function() {
	
	"use strict";
	
	/**
	*  Drag manager is responsible for handling the dragging of stage elements.
	*  Supports click-n-stick (click to start, move mouse, click to release) and click-n-drag (standard dragging) functionality.
	*  
	*  @class DragManager
	*  @constructor
	*  @param {function} startCallback The callback when when starting
	*  @param {function} endCallback The callback when ending
	*/
	var DragManager = function(startCallback, endCallback)
	{
		this.initialize(startCallback, endCallback);
	};
	
	/** Reference to the drag manager */
	var p = DragManager.prototype = {};
	
	/**
	* The object that's being dragged
	* @public
	* @readOnly
	* @property {createjs.DisplayObject} draggedObj
	*/
	p.draggedObj = null;
	
	/**
	* The radius in pixel to allow for dragging, or else does sticky click
	* @public
	* @property dragStartThreshold
	* @default 20
	*/
	p.dragStartThreshold = 20;
	
	/**
	* The position x, y of the mouse down on the stage
	* @private
	* @property {object} mouseDownStagePos
	*/
	p.mouseDownStagePos = null;

	/**
	* The position x, y of the object when interaction with it started.
	* @private
	* @property {object} mouseDownObjPos
	*/
	p.mouseDownObjPos = null;

	/**
	* If sticky click dragging is allowed.
	* @public
	* @property {Bool} allowStickyClick
	* @default true
	*/
	p.allowStickyClick = true;
	
	/**
	* Is the move touch based
	* @public
	* @readOnly
	* @property {Bool} isTouchMove
	* @default false
	*/
	p.isTouchMove = false;
	
	/**
	* Is the drag being held on mouse down (not sticky clicking)
	* @public
	* @readOnly
	* @property {Bool} isHeldDrag
	* @default false
	*/
	p.isHeldDrag = false;
	
	/**
	* Is the drag a sticky clicking (click on a item, then mouse the mouse)
	* @public
	* @readOnly
	* @property {Bool} isStickyClick
	* @default false
	*/
	p.isStickyClick = false;

	/**
	* Settings for snapping.
	*
	*  Format for snapping to a list of points:
	*	{
	*		mode:"points",
	*		dist:20,//snap when within 20 pixels/units
	*		points:[
	*			{ x: 20, y:30 },
	*			{ x: 50, y:10 }
	*		]
	*	}
	*
	* @public
	* @property {Object} snapSettings
	* @default null
	*/
	p.snapSettings = null;
	
	/**
	* Reference to the stage
	* @private
	* @property {createjsStage} _theStage
	*/
	p._theStage = null;
	
	/**
	* The local to global position of the drag
	* @private
	* @property {createjs.Point} _dragOffset
	*/
	p._dragOffset = null;
	
	/**
	* Callback when we start dragging
	* @private
	* @property {Function} _dragStartCallback
	*/
	p._dragStartCallback = null;
	
	/**
	* Callback when we are done dragging
	* @private
	* @property {Function} _dragEndCallback
	*/
	p._dragEndCallback = null;
	
	/**
	* Callback to test for the start a held drag
	* @private
	* @property {Function} _triggerHeldDragCallback
	*/
	p._triggerHeldDragCallback = null;
	
	/**
	* Callback to start a sticky click drag
	* @private
	* @property {Function} _triggerStickyClickCallback
	*/
	p._triggerStickyClickCallback = null;
	
	/**
	* Callback when we are done with the drag
	* @private
	* @property {Function} _stageMouseUpCallback
	*/
	p._stageMouseUpCallback = null;
	
	/**
	* The collection of draggable objects
	* @private
	* @property {Array} _draggableObjects
	*/
	p._draggableObjects = null;
		
	/**
	* The function call when the mouse/touch moves
	* @private
	* @property {function} _updateCallback 
	*/
	p._updateCallback = null;

	/**
	* A point for reuse instead of lots of object creation.
	* @private
	* @property {createjs.Point} _helperPoint 
	*/
	p._helperPoint = null;
	
	/** 
	* Constructor 
	* @method initialize
	* @constructor
	* @param {function} startCallback The callback when when starting
	* @param {function} endCallback The callback when ending
	*/
	p.initialize = function(stage, startCallback, endCallback)
	{
		this._updateCallback = this._updateObjPosition.bind(this);
		this._triggerHeldDragCallback = this._triggerHeldDrag.bind(this);
		this._triggerStickyClickCallback = this._triggerStickyClick.bind(this);
		this._stageMouseUpCallback = this._stopDrag.bind(this);
		this._theStage = stage;
		this._dragStartCallback = startCallback;
		this._dragEndCallback = endCallback;
		this._draggableObjects = [];
		this.mouseDownStagePos = {x:0, y:0};
		this.mouseDownObjPos = {x:0, y:0};
	};
	
	/**
	*	Manually starts dragging an object. If a mouse down event is not supplied as the second argument, it 
	*   defaults to a held drag, that ends as soon as the mouse is released.
	*  @method startDrag
	*  @public
	*  @param {createjs.DisplayObject} object The object that should be dragged.
	*  @param {createjs.MouseEvent} ev A mouse down event to listen to to determine what type of drag should be used.
	*/
	p.startDrag = function(object, ev)
	{
		this._objMouseDown(ev, object);
	};
	
	/**
	* Mouse down on an obmect
	*  @method _objMouseDown
	*  @private
	*  @param {createjs.MouseEvent} ev A mouse down event to listen to to determine what type of drag should be used.
	*  @param {createjs.DisplayObject} object The object that should be dragged.
	*/
	p._objMouseDown = function(ev, obj)
	{
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if(this.draggedObj !== null) return;

		this.draggedObj = obj;
		//stop any active tweens on the object, in case it is moving around or something
		createjs.Tween.removeTweens(obj);
		
		//get the mouse position in global space and convert it to parent space
		this._dragOffset = this.draggedObj.parent.globalToLocal(ev ? ev.stageX : 0, ev ? ev.stageY : 0);
		
		//move the offset to respect the object's current position
		this._dragOffset.x -= obj.x;
		this._dragOffset.y -= obj.y;

		//save the position of the object before dragging began, for easy restoration, if desired
		this.mouseDownObjPos.x = obj.x;
		this.mouseDownObjPos.y = obj.y;
		
		if(!ev)//if we don't get an event (manual call neglected to pass one) then default to a held drag
		{
			this.isHeldDrag = true;
			this._startDrag();
		}
		else
		{
			//override the target for the mousedown/touchstart event to be this object, in case we are dragging a cloned object
			this._theStage._getPointerData(ev.pointerID).target = obj;

			if(!this.allowStickyClick || ev.nativeEvent.type == 'touchstart')//if it is a touch event, force it to be the held drag type
			{
				this.mouseDownStagePos.x = ev.stageX;
				this.mouseDownStagePos.y = ev.stageY;
				this.isTouchMove = ev.nativeEvent.type == 'touchstart';
				this.isHeldDrag = true;
				this._startDrag();
			}
			else//otherwise, wait for a movement or a mouse up in order to do a held drag or a sticky click drag
			{
				this.mouseDownStagePos.x = ev.stageX;
				this.mouseDownStagePos.y = ev.stageY;
				obj.addEventListener("pressmove", this._triggerHeldDragCallback);
				obj.addEventListener("pressup", this._triggerStickyClickCallback);
			}
		}
	};
	
	/**
	* Start the sticky click
	* @method _triggerStickyClick
	* @private
	*/
	p._triggerStickyClick = function()
	{
		this.isStickyClick = true;
		this.draggedObj.removeEventListener("pressmove", this._triggerHeldDragCallback);
		this.draggedObj.removeEventListener("pressup", this._triggerStickyClickCallback);
		this._startDrag();
	};

	/**
	* Start hold dragging
	* @method _triggerHeldDrag
	* @private
	* @param {createjs.MouseEvent} ev The mouse down event
	*/
	p._triggerHeldDrag = function(ev)
	{
		var xDiff = ev.stageX - this.mouseDownStagePos.x;
		var yDiff = ev.stageY - this.mouseDownStagePos.y;
		if(xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			this.draggedObj.removeEventListener("pressmove", this._triggerHeldDragCallback);
			this.draggedObj.removeEventListener("pressup", this._triggerStickyClickCallback);
			this._startDrag();
		}
	};

	/**
	* Internal start dragging on the stage
	* @method _startDrag
	* @private 
	*/
	p._startDrag = function()
	{
		var stage = this._theStage;
		stage.removeEventListener("stagemousemove", this._updateCallback);
		stage.addEventListener("stagemousemove", this._updateCallback);
		stage.removeEventListener("stagemouseup", this._stageMouseUpCallback);
		stage.addEventListener("stagemouseup", this._stageMouseUpCallback);
		
		this._dragStartCallback(this.draggedObj);
	};
	
	/**
	* Stops dragging the currently dragged object.
	* @public
	* @method stopDrag
	* @param {Bool} doCallback If the drag end callback should be called. Default is false.
	*/
	p.stopDrag = function(doCallback)
	{
		this._stopDrag(null, doCallback === true);//pass true if it was explicitly passed to us, false and undefined -> false
	};

	/**
	* Internal stop dragging on the stage
	* @method _stopDrag
	* @private 
	* @param {createjs.MouseEvent} ev Mouse up event
	* @param {Bool} doCallback If we should do the callback
	*/
	p._stopDrag = function(ev, doCallback)
	{
		var obj = this.draggedObj;
		obj.removeEventListener("pressmove", this._triggerHeldDragCallback);
		obj.removeEventListener("pressup", this._triggerStickyClickCallback);
		this._theStage.removeEventListener("stagemousemove", this._updateCallback);
		this._theStage.removeEventListener("stagemouseup", this._stageMouseUpCallback);
		this.draggedObj = null;
		this.isTouchMove = false;
		this.isStickyClick = false;
		this.isHeldMove = false;

		if(doCallback !== false) // true or undefined
			this._dragEndCallback(obj);
	};

	/**
	* Update the object position based on the mouse
	* @method _updateObjPosition
	* @private
	* @param {createjs.MouseEvent} e Mouse move event
	*/
	p._updateObjPosition = function(e)
	{
		if(!this.isTouchMove && !this._theStage.mouseInBounds) return;
		
		var draggedObj = this.draggedObj;
		var mousePos = draggedObj.parent.globalToLocal(e.stageX, e.stageY, this._helperPoint);
		var bounds = draggedObj._dragBounds;
		draggedObj.x = clamp(mousePos.x - this._dragOffset.x, bounds.x, bounds.right);
		draggedObj.y = clamp(mousePos.y - this._dragOffset.y, bounds.y, bounds.bottom);
		if(this.snapSettings)
		{
			switch(this.snapSettings.mode)
			{
				case "points":
					this._handlePointSnap(mousePos);
					break;
				case "grid":
					//not yet implemented
					break;
				case "line":
					//not yet implemented
					break;
			}
		}
	};

	/**
	* Handles snapping the dragged object to the nearest among a list of points
	* @method _handlePointSnap
	* @private
	* @param {createjs.Point} localMousePos The mouse position in the same space as the dragged object.
	*/
	p._handlePointSnap = function(localMousePos)
	{
		var snapSettings = this.snapSettings;
		var minDistSq = snapSettings.dist * snapSettings.dist;
		var points = snapSettings.points;
		var objX = localMousePos.x - this._dragOffset.x;
		var objY = localMousePos.y - this._dragOffset.y;
		var leastDist = -1;
		var closestPoint = null;
		for(var i = points.length - 1; i >= 0; --i)
		{
			var p = points[i];
			var distSq = distSquared(objX, objY, p.x, p.y);
			if(distSq <= minDistSq && (distSq < leastDist || leastDist == -1))
			{
				leastDist = distSq;
				closestPoint = p;
			}
		}
		if(closestPoint)
		{
			this.draggedObj.x = closestPoint.x;
			this.draggedObj.y = closestPoint.y;
		}
	};

	/*
	* Small distance squared function
	*/
	var distSquared = function(x1, y1, x2, y2)
	{
		var xDiff = x1 - x2;
		var yDiff = y1 - y2;
		return xDiff * xDiff + yDiff * yDiff;
	};
	
	/*
	* Simple clamp function
	*/
	var clamp = function(x,a,b)
	{
		return (x < a ? a : (x > b ? b : x));
	};
	
	//=== Giving functions and properties to draggable objects objects
	var enableDrag = function()
	{
		this.addEventListener("mousedown", this._onMouseDownListener);
		this.cursor = "pointer";
	};
	
	var disableDrag = function()
	{
		this.removeEventListener("mousedown", this._onMouseDownListener);
		this.cursor = null;
	};
	
	var _onMouseDown = function(ev)
	{
		this._dragMan._objMouseDown(ev, this);
	};
	
	/** 
	* Adds properties and functions to the object - use enableDrag() and disableDrag() on 
	* objects to enable/disable them (they start out disabled). Properties added to objects:
	* _dragBounds (Rectangle), _onMouseDownListener (Function), _dragMan (cloudkid.DragManager) reference to the DragManager
	* these will override any existing properties of the same name
	* @method addObject
	* @public
	* @param {createjs.DisplayObject} obj The display object
	* @param {createjs.Rectangle} bound The rectangle bounds
	*/
	p.addObject = function(obj, bounds)
	{
		if(!bounds)
		{
			bounds = {x:0, y:0, width:this._theStage.canvas.width, height:this._theStage.canvas.height};
		}
		bounds.right = bounds.x + bounds.width;
		bounds.bottom = bounds.y + bounds.height;
		obj._dragBounds = bounds;
		if(this._draggableObjects.indexOf(obj) >= 0)
		{
			//don't change any of the functions or anything, just quit the function after having updated the bounds
			return;
		}
		obj.enableDrag = enableDrag;
		obj.disableDrag = disableDrag;
		obj._onMouseDownListener = _onMouseDown.bind(obj);
		obj._dragMan = this;
		this._draggableObjects.push(obj);
	};
	
	/** 
	* Removes properties and functions added by addObject().
	* @public
	* @method removeObject
	* @param {createjs.DisplayObject} obj The display object
	*/
	p.removeObject = function(obj)
	{
		obj.disableDrag();
		delete obj.enableDrag;
		delete obj.disableDrag;
		delete obj._onMouseDownListener;
		delete obj._dragMan;
		delete obj._dragBounds;
		var index = this._draggableObjects.indexOf(obj);
		if(index >= 0)
			this._draggableObjects.splice(index, 1);
	};
	
	/**
	*  Destroy the manager
	*  @public
	*  @method destroy
	*/
	p.destroy = function()
	{
		if(this.draggedObj !== null)
		{
			//clean up dragged obj
			this.draggedObj.removeEventListener("pressmove", this._triggerHeldDragCallback);
			this.draggedObj.removeEventListener("pressup", this._triggerStickyClickCallback);
			this._theStage.removeEventListener("stagemousemove", this._updateCallback);
			this.draggedObj = null;
		}
		this._updateCallback = null;
		this._dragStartCallback = null;
		this._dragEndCallback = null;
		this._triggerHeldDragCallback = null;
		this._triggerStickyClickCallback = null;
		this._stageMouseUpCallback = null;
		this._theStage = null;
		for(var i = this._draggableObjects.length - 1; i >= 0; --i)
		{
			var obj = this._draggableObjects[i];
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
		}
		this._draggableObjects = null;
		this._helperPoint = null;
	};
	
	/** Assign to the global namespace */
	namespace('cloudkid').DragManager = DragManager;
	namespace('cloudkid.createjs').DragManager = DragManager;
}());
(function(undefined) {

	/**
	*  Handles a spritesheet.
	*  @class TextureAtlas
	*  @constructor
	*  @param {Image|HTMLCanvasElement|Array} image The image that all textures pull from.
	*       This can also be an array of images, if the TextureAtlas should be built from several spritesheets.
	*  @param {Object|Array} spritesheetData The JSON object describing the frames in the atlas.
	*       This is expected to fit the JSON Hash format as exported from TexturePacker.
	*       This can also be an array of data objects, if the TextureAtlas should be built from several spritesheets.
	*/
	var TextureAtlas = function(image, spritesheetData)
	{
		/**
		*  The an array of image elements (Image|HTMLCanvasElement) that frames in texture atlas use.
		*  @property {Array} _image
		*  @private
		*/
		if(Array.isArray(image))
		{
			this._images = image;
		}
		else
		{
			this._images = [image];
			spritesheetData = [spritesheetData];
		}

		/**
		*  The dictionary of Textures that this atlas consists of.
		*  @property {Object} frames
		*/
		this.frames = {};

		for(var i = 0; i < this._images.length; ++i)
		{
			image = this._images[i];

			var dataFrames = spritesheetData[i].frames;
			for(var name in dataFrames)
			{
				var data = dataFrames[name];
				var index = name.lastIndexOf(".");
				if(index > 0)
					name = name.substring(0, index);//strip off any ".png" or ".jpg" at the end
				index = name.lastIndexOf("/");
				if(index < 0)
					name = name.substring(index + 1);//strip off any folder structure included in the name
				this.frames[name] = new Texture(image, data);
			}
		}
	};
	
	// Extend Object
	var p = TextureAtlas.prototype = {};

	/**
	*  Handler when the skip button is pressed
	*  @method getFrame
	*  @param {String} name The frame name to get.
	*  @return {cloudkid.TextureAtlas.Texture} The texture by that name, or null if it doesn't exist.
	*/
	p.getFrame = function(name)
	{
		return this.frames[name] || null;
	};

	/**
	*  Get an array of Textures that match a specific name.
	*  @method getFrames
	*  @param {String} name The base name of all frames to look for, like "anim_#" to search for an animation exported
	*         as anim_0001.png (the ".png" is dropped when the TextureAtlas is loaded).
	*  @param {int} numberMin The number to start on while looking for frames. Flash generally starts at 1.
	*  @param {int} numberMax The number to go until while looking for frames. 
	*         If your animation runs from frame 0001 to frame 0014, numberMax would be 14.
	*  @param {int} [maxDigits=4] Maximum number of digits, like 4 for an animation exported as anim_0001.png
	*  @param {Array} [outArray] If already using an array, this can fill it instead of creating a new one.
	*  @return {Array} An collection of cloudkid.TextureAtlas.Textures.
	*/
	p.getFrames = function(name, numberMin, numberMax, maxDigits, outArray)
	{
		if(maxDigits === undefined)
			maxDigits = 4;
		if(maxDigits < 0)
			maxDigits = 0;
		if(!outArray)
			outArray = [];
		//set up strings to add the correct number of zeros ahead of time to avoid creating even more strings.
		var zeros = [];//preceding zeroes array
		var compares = [];//powers of 10 array for determining how many preceding zeroes to use
		var i, c;
		for(i = 1; i < maxDigits; ++i)
		{
			var s = "";
			c = 1;
			for(var j = 0; j < i; ++j)
			{
				s += "0";
				c *= 10;
			}
			zeros.unshift(s);
			compares.push(c);
		}
		var compareLength = compares.length;//the length of the compar

		var prevTex;//the previous Texture, so we can place the same object in multiple times to control animation rate
		for(i = numberMin, len = numberMax; i <= len; ++i)
		{
			var num = null;
			//calculate the number of preceding zeroes needed, then create the full number string.
			for(c = 0; c < compareLength; ++c)
			{
				if(i < compares[c])
				{
					num = zeros[c] + i;
					break;
				}
			}
			if(!num)
				num = i.toString();
			
			//If the texture doesn't exist, use the previous texture - this should allow us to use fewer textures
			//that are in fact the same, if those textures were removed before making the spritesheet
			var texName = name.replace("#", num);
			var tex = this.frames[texName];
			if(tex)
				prevTex = tex;
			if(prevTex)
				outArray.push(prevTex);
		}

		return outArray;
	};

	p.destroy = function()
	{
		this.image = null;
		this.frames = null;
	};

	namespace('cloudkid').TextureAtlas = TextureAtlas;
	namespace('cloudkid.createjs').TextureAtlas = TextureAtlas;

	/**
	*  A Texture - a specific portion of an image that can then be drawn by a Bitmap.
	*  This class is hidden within TextureAtlas, and can't be manually created.
	*  @class Texture
	*/
	var Texture = function(image, data)
	{
		/**
		*  The image element that this texture references.
		*  @property {Image|HTMLCanvasElement} image
		*/
		this.image = image;
		var f = data.frame;
		/**
		*  The frame rectangle within the image.
		*  @property {createjs.Rectangle} frame
		*/
		this.frame = new createjs.Rectangle(f.x, f.y, f.w, f.h);
		/**
		*  If this texture has been trimmed.
		*  @property {Boolean} trimmed
		*/
		this.trimmed = data.trimmed;
		/**
		*  The offset that the trimmed sprite should be placed at to restore it to the untrimmed position.
		*  @property {createjs.Point} offset
		*/
		this.offset = new createjs.Point(data.spriteSourceSize.x, data.spriteSourceSize.y);
		/**
		*  The width of the untrimmed texture.
		*  @property {Number} width
		*/
		this.width = data.sourceSize.w;
		/**
		*  The height of the untrimmed texture.
		*  @property {Number} height
		*/
		this.height = data.sourceSize.h;
	};
}());