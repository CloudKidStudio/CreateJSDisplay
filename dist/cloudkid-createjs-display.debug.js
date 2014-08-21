/*! CreateJSDisplay 0.0.1 */
!function(a){"use strict";var b=function(b,c){this.id=b,c=c||{},this.canvas=document.getElementById(b),this.width=this.canvas.width,this.height=this.canvas.height,this._visible="none"!=this.canvas.style.display,c.mouseOverRate!==a&&(this.mouseOverRate=c.mouseOverRate),"spriteStage"==c.stageType||(this.stage=new createjs.Stage(b)),this.stage.autoClear=!!c.clearView,this.canvas.onmousedown=function(a){a.preventDefault()},this.enabled=!0,this.Animator=cloudkid.createjs.Animator},c=b.prototype={};c.canvas=null,c.id=null,c.width=0,c.height=0,c.stage=null,c.paused=!1,c.mouseOverRate=30,c._enabled=!1,Object.defineProperty(c,"enabled",{get:function(){return this._enabled},set:function(a){this._enabled=a,a?(this.stage.enableMouseOver(this.mouseOverRate),this.stage.enableDOMEvents(!0),createjs.Touch.enable(this.stage)):(this.stage.enableMouseOver(!1),this.stage.enableDOMEvents(!1),createjs.Touch.disable(this.stage),this.canvas.style.cursor="")}}),c._visible=!1,Object.defineProperty(c,"visible",{get:function(){return this._visible},set:function(a){this._visible=a,this.canvas.style.display=a?"block":"none"}}),c.resize=function(a,b){this.width=this.canvas.width=a,this.height=this.canvas.height=b},c.render=function(a){!this.paused&&this._visible&&this.stage.update(a)},c.destroy=function(){this.enabled=!1,this.stage.removeAllChildren(!0),this.canvas.onmousedown=null,this.stage=this.canvas=null},namespace("cloudkid").CreateJSDisplay=b,namespace("cloudkid.createjs").CreateJSDisplay=b}(),function(a){"use strict";var b=cloudkid.Application,c=null,d=function(){};d.VERSION="0.0.1",d.debug=!1,d.soundLib=null,d.captions=null;var e=null,f=null,g=null,h=!1,i={};d.init=function(){e=[],f=[],g={},h=!1,c=cloudkid.createjs.AnimatorTimeline},d.destroy=function(){d.stopAll(),e=null,f=null,g=null},b.registerInit(d.init),b.registerDestroy(d.destroy),d.play=function(b,c,f,h,j,k,l,m){var n;f&&"function"==typeof f?(n=f,f=i):f||(f=i),n=f.onComplete||n||null,h=f.onCompleteParams||h||null,j=f.startTime||j,j=j?.001*j:0,k=f.speed||k||1,m=f.doCancelledCallback||m||!1,l=f.soundData||l||null,e||d.init(),g[b.id]!==a&&d.stop(b,m);var o=d._makeTimeline(b,c,n,h,k,l);return o.firstFrame>-1&&o.lastFrame>-1?(o.time=-1==j?Math.random()*o.duration:j,b.elapsedTime=o.startTime+o.time,b.play(),b._tick(),d._hasTimelines()||d._startUpdate(),e.push(o),g[b.id]=o,o.soundStart>0&&d.soundLib.preloadSound&&d.soundLib.preloadSound(o.soundAlias),o):(Debug.log("No event "+c+" was found, or it lacks an end, on this MovieClip "+b),n&&n.apply(null,h),null)},d.playAtRandomFrame=function(a,b,c,e,f,g,h){return d.play(a,b,c,e,-1,f,g,h)},d._makeTimeline=function(a,e,f,g,h,i){var j=new c;if(!d._canAnimate(a))return j;a.advanceDuringTicks=!1;var k;a.framerate?k=a.framerate:(k=b.instance.options.fps,k||(k=b.instance.fps),k||(k=15),a.framerate=k),j.instance=a,j.event=e,j.onComplete=f,j.onCompleteParams=g,j.speed=h,i&&(j.playSound=!0,"string"==typeof i?(j.soundStart=0,j.soundAlias=i):(j.soundStart=i.start>0?i.start:0,j.soundAlias=i.alias),j.useCaptions=d.captions&&d.captions.hasCaption(j.soundAlias));for(var l=a.getLabels(),m=e+"_stop",n=e+"_loop",o=0,p=l.length;p>o;++o){var q=l[o];if(q.label==e)j.firstFrame=q.position;else{if(q.label==m){j.lastFrame=q.position;break}if(q.label==n){j.lastFrame=q.position,j.isLooping=!0;break}}}return j.length=j.lastFrame-j.firstFrame,j.startTime=j.firstFrame/k,j.duration=j.length/k,j},d._canAnimate=function(b){return b instanceof createjs.MovieClip?!0:b.framerate!==a&&b.getLabels!==a&&b.elapsedTime!==a&&b._tick!==a&&b.gotoAndStop!==a&&b.play!==a&&b.id!==a?!0:(Debug.error("Attempting to use Animator to play something that is not movieclip compatible: "+b),!1)},d.instanceHasAnimation=function(a,b){for(var c=a.getLabels(),d=-1,e=-1,f=b+"_stop",g=b+"_loop",h=0,i=c.length;i>h;++h){var j=c[h];if(j.label==b)d=j.position;else if(j.label==f||j.label==g){e=j.position;break}}return d>=0&&e>=0},d.stop=function(b,c){if(c=c||!1,e){if(g[b.id]===a)return void Debug.log("No timeline was found matching the instance id "+b);var f=g[b.id];d._remove(f,c)}},d.stopAll=function(a){if(d._hasTimelines())for(var b,c=e.slice(),f=0;f<c.length;f++)b=c[f],(!a||a.contains(b.instance))&&d._remove(b,!1)},d._remove=function(a,b){var c=f.indexOf(a);if(c>=0&&f.splice(c,1),c=e.indexOf(a),!(0>c)){var h=a.onComplete,i=a.onCompleteParams;a.instance.stop(),!b&&a.soundInst&&a.soundInst.stop(),e.splice(c,1),delete g[a.instance.id],a.useCaptions&&d.captions.stop(),a.instance=null,a.event=null,a.onComplete=null,a.onCompleteParams=null,d._hasTimelines()||d._stopUpdate(),b&&h&&h.apply(null,i)}},d.pause=function(){if(e&&!h){h=!0;for(var a=0;a<e.length;a++)e[a].paused=!0;d._stopUpdate()}},d.resume=function(){if(e&&h){h=!1;for(var a=0;a<e.length;a++)e[a].paused=!1;d._hasTimelines()&&d._startUpdate()}},d.pauseInGroup=function(a,b){if(d._hasTimelines()&&b)for(var c=0;c<e.length;c++)b.contains(e[c].instance)&&(e[c].paused=a)},d.getTimeline=function(b){return d._hasTimelines()&&g[b.id]!==a?g[b.id]:null},d.getPaused=function(){return h},d._startUpdate=function(){b.instance&&b.instance.on("update",d._update)},d._stopUpdate=function(){b.instance&&b.instance.off("update",d._update)},d._update=function(a){if(e){for(var b,c=.001*a,g=e.length-1;g>=0;--g){b=e[g];var h=b.instance;if(!b.paused){if(b.soundInst){if(!b.soundInst.isValid){f.push(b);continue}var i=.001*b.soundInst.position;if(0>i&&(i=0),b.time=b.soundStart+i,b.useCaptions&&d.captions.seek(b.soundInst.position),b.time>=b.duration){h.gotoAndStop(b.lastFrame),f.push(b);continue}}else{if(b.time+=c*b.speed,b.time>=b.duration){if(!b.isLooping){h.gotoAndStop(b.lastFrame),f.push(b);continue}b.time-=b.duration,b.onComplete&&b.onComplete.apply(null,b.onCompleteParams)}b.playSound&&b.time>=b.soundStart&&(b.time=b.soundStart,b.soundInst=d.soundLib.play(b.soundAlias,k.bind(this,b),j.bind(this,b)),b.useCaptions&&(d.captions.isSlave=!0,d.captions.run(b.soundAlias)))}h.elapsedTime=b.startTime+b.time,h.advance()}}for(g=0;g<f.length;g++)b=f[g],d._remove(b,!0)}};var j=function(a){a.playSound=!1,a.soundEnd=a.soundStart+.001*a.soundInst.length},k=function(a){a.soundEnd>0&&a.soundEnd>a.time&&(a.time=a.soundEnd),a.soundInst=null};d._hasTimelines=function(){return e?e.length>0:!1},d.toString=function(){return"[Animator version:"+d.VERSION+"]"},namespace("cloudkid").Animator=d,namespace("cloudkid.createjs").Animator=d}(),function(){"use strict";var a=function(){},b=a.prototype;b.onComplete=null,b.onCompleteParams=null,b.event=null,b.instance=null,b.firstFrame=-1,b.lastFrame=-1,b.isLooping=!1,b.isLastFrame=!1,b.length=0,b.useCaptions=!1,b._paused=!1,Object.defineProperty(a.prototype,"paused",{get:function(){return this._paused},set:function(a){a!=this._paused&&(this._paused=!!a,this.soundInst&&(this.paused?this.soundInst.pause():this.soundInst.unpause()))}}),b.startTime=0,b.duration=0,b.speed=1,b.time=0,b.soundAlias=null,b.soundInst=null,b.playSound=!1,b.soundStart=0,b.soundEnd=0,namespace("cloudkid").AnimatorTimeline=a,namespace("cloudkid.createjs").AnimatorTimeline=a}(),function(a){"use strict";function b(a){if(!a||"object"!=typeof a)return null;var b=a.constructor();for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b}var c=function(a,b,c){a&&this.initialize(a,b,c)},d=c.prototype=new createjs.Container,e=createjs.Container.prototype;d.back=null,d.label=null,d._overCB=null,d._outCB=null,d._downCB=null,d._upCB=null,d._clickCB=null,d._stateFlags=null,d._statePriority=null,d._stateData=null,d._width=0,d._height=0,d._offset=null,c.BUTTON_PRESS="buttonPress";var f=["disabled","enabled","up","over","down"],g=["disabled","down","over","up"];d.initialize=function(c,d,f){e.initialize.call(this),this.mouseChildren=!1,this._downCB=this._onMouseDown.bind(this),this._upCB=this._onMouseUp.bind(this),this._overCB=this._onMouseOver.bind(this),this._outCB=this._onMouseOut.bind(this),this._clickCB=this._onClick.bind(this);var h=this._stateData={};this._stateFlags={},this._offset=new createjs.Point;var i;d&&(i=b(d),delete i.text,i.x===a&&(i.x="center"),i.y===a&&(i.y="center"));var j,k,l,m,n;if(c.image){for(j=c.image,this._statePriority=c.priority||g,m=this._statePriority.length-1;m>=0;--m){n=this._statePriority[m],this._addProperty(n),"disabled"!=n&&"up"!=n&&(this._stateFlags[n]=!1);var o=c[n];if(h[n]=o?b(o):h.up,d)if(o&&o.label){o=o.label;var p=h[n].label={};p.font=o.font||i.font,p.color=o.color||i.color,p.stroke=o.hasOwnProperty("stroke")?o.stroke:i.stroke,p.shadow=o.hasOwnProperty("shadow")?o.shadow:i.shadow,p.textBaseline=o.textBaseline||i.textBaseline,p.x=o.x||i.x,p.y=o.y||i.y}else h[n].label=i}if(h.up.trim){var q=h.up.trim;k=q.width,l=q.height}else k=h.up.src.width,l=h.up.src.height;h.up||(Debug.error("Button lacks an up state! This is a serious problem! Input data follows:"),Debug.error(c)),h.over||(h.over=h.up),h.down||(h.down=h.up),h.disabled||(h.disabled=h.up),c.offset?(this._offset.x=c.offset.x,this._offset.y=c.offset.y):this._offset.x=this._offset.y=0}else j=c,k=j.width,l=j.height/3,this._statePriority=g,h.disabled=h.up={src:new createjs.Rectangle(0,0,k,l)},h.over={src:new createjs.Rectangle(0,l,k,l)},h.down={src:new createjs.Rectangle(0,2*l,k,l)},i&&(h.up.label=h.over.label=h.down.label=h.disabled.label=i),this._offset.x=this._offset.y=0;this.back=new createjs.Bitmap(j),this.addChild(this.back),this._width=k,this._height=l,d&&(this.label=new createjs.Text(d.text||"",h.up.label.font,h.up.label.color),this.addChild(this.label)),this.enabled=f===a?!0:!!f},Object.defineProperty(d,"width",{get:function(){return this._width*this.scaleX},set:function(a){this.scaleX=a/this._width}}),Object.defineProperty(d,"height",{get:function(){return this._height*this.scaleY},set:function(a){this.scaleY=a/this._height}}),d.setText=function(a){if(this.label){this.label.text=a;for(var b,c=0;c<this._statePriority.length;++c)if(this._stateFlags[this._statePriority[c]]){b=this._stateData[this._statePriority[c]];break}b||(b=this._stateData.up),b=b.label,this.label.x="center"==b.x?.5*(this._width-this.label.getMeasuredWidth())+this._offset.x:b.x+this._offset.x,this.label.y="center"==b.y?.5*this._height+this._offset.y:b.y+this._offset.y}},Object.defineProperty(d,"enabled",{get:function(){return!this._stateFlags.disabled},set:function(a){this._stateFlags.disabled=!a,a?(this.cursor="pointer",this.addEventListener("mousedown",this._downCB),this.addEventListener("mouseover",this._overCB),this.addEventListener("mouseout",this._outCB)):(this.cursor=null,this.removeEventListener("mousedown",this._downCB),this.removeEventListener("mouseover",this._overCB),this.removeEventListener("mouseout",this._outCB),this.removeEventListener("pressup",this._upCB),this.removeEventListener("click",this._clickCB),this._stateFlags.down=this._stateFlags.over=!1),this._updateState()}}),d._addProperty=function(a){f.indexOf(a)>=0||Object.defineProperty(this,a,{get:function(){return this._stateFlags[a]},set:function(b){this._stateFlags[a]=b,this._updateState()}})},d._updateState=function(){if(this.back){for(var a,b=0;b<this._statePriority.length;++b)if(this._stateFlags[this._statePriority[b]]){a=this._stateData[this._statePriority[b]];break}a||(a=this._stateData.up),this.back.sourceRect=a.src,a.trim?(this.back.x=a.trim.x+this._offset.x,this.back.y=a.trim.y+this._offset.y):(this.back.x=this._offset.x,this.back.y=this._offset.y),this.label&&(a=a.label,this.label.textBaseline=a.textBaseline||"middle",this.label.stroke=a.stroke,this.label.shadow=a.shadow,this.label.font=a.font,this.label.color=a.color||"#000",this.label.x="center"==a.x?.5*(this._width-this.label.getMeasuredWidth())+this._offset.x:a.x+this._offset.x,this.label.y="center"==a.y?.5*this._height+this._offset.y:a.y+this._offset.y)}},d._onMouseDown=function(){this.addEventListener("pressup",this._upCB),this.addEventListener("click",this._clickCB),this._stateFlags.down=!0,this._updateState()},d._onMouseUp=function(){this.removeEventListener("pressup",this._upCB),this.removeEventListener("click",this._clickCB),this._stateFlags.down=!1,this._updateState()},d._onClick=function(){this.dispatchEvent(new createjs.Event(c.BUTTON_PRESS))},d._onMouseOver=function(){this._stateFlags.over=!0,this._updateState()},d._onMouseOut=function(){this._stateFlags.over=!1,this._updateState()},d.destroy=function(){this.removeAllChildren(),this.removeAllEventListeners(),this._downCB=null,this._upCB=null,this._overCB=null,this._outCB=null,this.back=null,this.label=null,this._statePriority=null,this._stateFlags=null,this._stateData=null},c.generateDefaultStates=function(b,c,d){var e=b.width,f=b.height/3,h=document.createElement("canvas"),i=e,j=b.height;c&&(j+=f),d&&(i+=2*d.size,j+=f+2*d.size),h.width=i,h.height=j;var k=h.getContext("2d");k.drawImage(b,0,0);var l={image:h,up:{src:new createjs.Rectangle(0,0,e,f)},over:{src:new createjs.Rectangle(0,f,e,f)},down:{src:new createjs.Rectangle(0,2*f,e,f)}},m=new createjs.Bitmap(b);m.sourceRect=l.up.src;var n=b.height;if(c){k.save(),k.translate(0,n);var o=new createjs.ColorMatrix;c.saturation!==a&&o.adjustSaturation(c.saturation),c.brightness!==a&&o.adjustBrightness(2.55*c.brightness),c.contrast!==a&&o.adjustContrast(c.contrast),m.filters=[new createjs.ColorMatrixFilter(o)],m.cache(0,0,l.up.src.width,l.up.src.height),m.draw(k),l.disabled={src:new createjs.Rectangle(0,n,e,f)},n+=f,k.restore()}if(d){k.save();var p=e+2*d.size,q=f+2*d.size;m.filters=[new createjs.ColorFilter(0,0,0,1,d.red,d.green,d.blue,d.alpha!==a?-255+d.alpha:0)],m.scaleX=p/e,m.scaleY=q/f,m.x=0,m.y=n,m.cache(0,0,p,q),m.updateContext(k),m.draw(k),k.restore(),m.scaleX=m.scaleY=1,m.x=d.size,m.y=n+d.size,m.filters=null,m.uncache(),m.updateContext(k),m.draw(k);var r=new createjs.Rectangle(d.size,d.size,p,q);l.up.trim=r,l.over.trim=r,l.down.trim=r,l.disabled&&(l.disabled.trim=r),l.highlighted={src:new createjs.Rectangle(0,n,p,q)},l.priority=g.slice(),l.priority.unshift("highlighted"),l.offset={x:-d.size,y:-d.size}}return l},namespace("cloudkid").Button=c,namespace("cloudkid.createjs").Button=c}(),function(){"use strict";var a=function(a,b){this.initialize(a,b)},b=a.prototype;b.event=null,b.loops=0,b.initialize=function(a,b){this.event=a,this.loops=b||0},namespace("cloudkid").CharacterClip=a,namespace("cloudkid.createjs").CharacterClip=a}(),function(){"use strict";var a=cloudkid.createjs.Animator,b=function(){this.initialize()},c=b.prototype;c._animationStack=null,c._currentAnimation=null,c._loops=0,c._interruptable=!0,c._allowFrameDropping=!1,c._character=null,c._callback=null,c._destroyed=!1,c.initialize=function(){this._animationStack=[]},c.setCharacter=function(a){this.clear(),this._character=a,this._character&&(Debug.assert(this._character instanceof createjs.MovieClip,"character must subclass MovieClip"),this._character.stop())},c.gotoFrameAndStop=function(b){Debug.assert(this._character,"gotoFrameAndStop() requires a character!"),a.stop(this._character),this._animationStack.length=0,this._character.gotoAndStop(b)},c.playClips=function(b,c,d,e,f){if(c=c||null,d=d||!0,e=e||!0,f=f||!0,Debug.assert(this._character,"playClips requires a character!"),this._interruptable){a.stop(this._character),this._interruptable=d,this._callback&&!e&&this._callback(!0),this._callback=c,this._animationStack.length=0;for(var g in b)this._animationStack.push(b[g]);this._allowFrameDropping=f,this.startNext()}},c.startNext=function(){if(this._loops=0,this._animationStack.length>0)this._currentAnimation=this._animationStack.shift(),a.play(this._character,this._currentAnimation.event,this._animationComplete.bind(this),[this],this._allowFrameDropping);else if(this._callback){this._interruptable=!0;var b=this._callback;this._callback=null,b(!1)}},c._animationComplete=function(){this._loops++,0===this._currentAnimation.loops||this._loops<this._currentAnimation.loops?a.play(this._character,this._currentAnimation.event,this._animationComplete.bind(this),null,this._allowFrameDropping):this._currentAnimation.loops==this._loops&&this.startNext()},c.clear=function(){this._character&&a.stop(this._character),this._currentAnimation=null,this._interruptable=!0,this._callback=null,this._animationStack.length=0,this._loops=0},c.destroy=function(){this._destroyed||(this._destroyed=!0,this.clear(),this._character=null,this._animationStack=null)},namespace("cloudkid").CharacterController=b,namespace("cloudkid.createjs").CharacterController=b}(),function(){"use strict";var a=function(a,b,c){this.initialize(a,b,c)},b=a.prototype={};b.draggedObj=null,b.dragStartThreshold=20,b.mouseDownStagePos=null,b.mouseDownObjPos=null,b.allowStickyClick=!0,b.isTouchMove=!1,b.isHeldDrag=!1,b.isStickyClick=!1,b.snapSettings=null,b._theStage=null,b._dragOffset=null,b._dragStartCallback=null,b._dragEndCallback=null,b._triggerHeldDragCallback=null,b._triggerStickyClickCallback=null,b._stageMouseUpCallback=null,b._draggableObjects=null,b._updateCallback=null,b._helperPoint=null,b.initialize=function(a,b,c){this._updateCallback=this._updateObjPosition.bind(this),this._triggerHeldDragCallback=this._triggerHeldDrag.bind(this),this._triggerStickyClickCallback=this._triggerStickyClick.bind(this),this._stageMouseUpCallback=this._stopDrag.bind(this),this._theStage=a,this._dragStartCallback=b,this._dragEndCallback=c,this._draggableObjects=[],this.mouseDownStagePos={x:0,y:0},this.mouseDownObjPos={x:0,y:0}},b.startDrag=function(a,b){this._objMouseDown(b,a)},b._objMouseDown=function(a,b){null===this.draggedObj&&(this.draggedObj=b,createjs.Tween.removeTweens(b),this._dragOffset=this.draggedObj.parent.globalToLocal(a?a.stageX:0,a?a.stageY:0),this._dragOffset.x-=b.x,this._dragOffset.y-=b.y,this.mouseDownObjPos.x=b.x,this.mouseDownObjPos.y=b.y,a?(this._theStage._getPointerData(a.pointerID).target=b,this.allowStickyClick&&"touchstart"!=a.nativeEvent.type?(this.mouseDownStagePos.x=a.stageX,this.mouseDownStagePos.y=a.stageY,b.addEventListener("pressmove",this._triggerHeldDragCallback),b.addEventListener("pressup",this._triggerStickyClickCallback)):(this.mouseDownStagePos.x=a.stageX,this.mouseDownStagePos.y=a.stageY,this.isTouchMove="touchstart"==a.nativeEvent.type,this.isHeldDrag=!0,this._startDrag())):(this.isHeldDrag=!0,this._startDrag()))},b._triggerStickyClick=function(){this.isStickyClick=!0,this.draggedObj.removeEventListener("pressmove",this._triggerHeldDragCallback),this.draggedObj.removeEventListener("pressup",this._triggerStickyClickCallback),this._startDrag()},b._triggerHeldDrag=function(a){var b=a.stageX-this.mouseDownStagePos.x,c=a.stageY-this.mouseDownStagePos.y;b*b+c*c>=this.dragStartThreshold*this.dragStartThreshold&&(this.isHeldDrag=!0,this.draggedObj.removeEventListener("pressmove",this._triggerHeldDragCallback),this.draggedObj.removeEventListener("pressup",this._triggerStickyClickCallback),this._startDrag())},b._startDrag=function(){var a=this._theStage;a.removeEventListener("stagemousemove",this._updateCallback),a.addEventListener("stagemousemove",this._updateCallback),a.removeEventListener("stagemouseup",this._stageMouseUpCallback),a.addEventListener("stagemouseup",this._stageMouseUpCallback),this._dragStartCallback(this.draggedObj)},b.stopDrag=function(a){this._stopDrag(null,a===!0)},b._stopDrag=function(a,b){var c=this.draggedObj;c.removeEventListener("pressmove",this._triggerHeldDragCallback),c.removeEventListener("pressup",this._triggerStickyClickCallback),this._theStage.removeEventListener("stagemousemove",this._updateCallback),this._theStage.removeEventListener("stagemouseup",this._stageMouseUpCallback),this.draggedObj=null,this.isTouchMove=!1,this.isStickyClick=!1,this.isHeldMove=!1,b!==!1&&this._dragEndCallback(c)},b._updateObjPosition=function(a){if(this.isTouchMove||this._theStage.mouseInBounds){var b=this.draggedObj,c=b.parent.globalToLocal(a.stageX,a.stageY,this._helperPoint),e=b._dragBounds;if(b.x=d(c.x-this._dragOffset.x,e.x,e.right),b.y=d(c.y-this._dragOffset.y,e.y,e.bottom),this.snapSettings)switch(this.snapSettings.mode){case"points":this._handlePointSnap(c);break;case"grid":break;case"line":}}},b._handlePointSnap=function(a){for(var b=this.snapSettings,d=b.dist*b.dist,e=b.points,f=a.x-this._dragOffset.x,g=a.y-this._dragOffset.y,h=-1,i=null,j=e.length-1;j>=0;--j){var k=e[j],l=c(f,g,k.x,k.y);d>=l&&(h>l||-1==h)&&(h=l,i=k)}i&&(this.draggedObj.x=i.x,this.draggedObj.y=i.y)};var c=function(a,b,c,d){var e=a-c,f=b-d;return e*e+f*f},d=function(a,b,c){return b>a?b:a>c?c:a},e=function(){this.addEventListener("mousedown",this._onMouseDownListener),this.cursor="pointer"},f=function(){this.removeEventListener("mousedown",this._onMouseDownListener),this.cursor=null},g=function(a){this._dragMan._objMouseDown(a,this)};b.addObject=function(a,b){b||(b={x:0,y:0,width:this._theStage.canvas.width,height:this._theStage.canvas.height}),b.right=b.x+b.width,b.bottom=b.y+b.height,a._dragBounds=b,this._draggableObjects.indexOf(a)>=0||(a.enableDrag=e,a.disableDrag=f,a._onMouseDownListener=g.bind(a),a._dragMan=this,this._draggableObjects.push(a))},b.removeObject=function(a){a.disableDrag(),delete a.enableDrag,delete a.disableDrag,delete a._onMouseDownListener,delete a._dragMan,delete a._dragBounds;var b=this._draggableObjects.indexOf(a);b>=0&&this._draggableObjects.splice(b,1)},b.destroy=function(){null!==this.draggedObj&&(this.draggedObj.removeEventListener("pressmove",this._triggerHeldDragCallback),this.draggedObj.removeEventListener("pressup",this._triggerStickyClickCallback),this._theStage.removeEventListener("stagemousemove",this._updateCallback),this.draggedObj=null),this._updateCallback=null,this._dragStartCallback=null,this._dragEndCallback=null,this._triggerHeldDragCallback=null,this._triggerStickyClickCallback=null,this._stageMouseUpCallback=null,this._theStage=null;for(var a=this._draggableObjects.length-1;a>=0;--a){var b=this._draggableObjects[a];b.disableDrag(),delete b.enableDrag,delete b.disableDrag,delete b._onMouseDownListener,delete b._dragMan,delete b._dragBounds}this._draggableObjects=null,this._helperPoint=null},namespace("cloudkid").DragManager=a,namespace("cloudkid.createjs").DragManager=a}(),function(){"use strict";var a=function(){};a.prototype={},a.positionItems=function(b,c){var d,e;for(var f in c){var g=b[f];if(g){var h=c[f];g.x=h.x,g.y=h.y,e=h.scale,e&&(g.scaleX*=e.x,g.scaleY*=e.y),e=h.pivot,e&&(g.regX=e.x,g.regY=e.y),d=h.rotation,d&&(g.rotation=d),h.hitArea&&(g.hitShape=a.generateHitArea(h.hitArea))}else Debug.error("could not find object '"+f+"'")}},a.generateHitArea=function(a,c){if(c||(c=1),b(a)){if(1==c)return new createjs.Polygon(a);for(var d=[],e=0,f=a.length;f>e;++e)d.push(new createjs.Point(a[e].x*c,a[e].y*c));return new createjs.Polygon(d)}return"rect"!=a.type&&a.type?"ellipse"==a.type?new createjs.Ellipse((a.x-.5*a.w)*c,(a.y-.5*a.h)*c,a.w*c,a.h*c):"circle"==a.type?new createjs.Circle(a.x*c,a.y*c,a.r*c):"sector"==a.type?new createjs.Sector(a.x*c,a.y*c,a.r*c,a.start,a.end):null:new createjs.Rectangle(a.x*c,a.y*c,a.w*c,a.h*c)};var b=function(a){return"[object Array]"===Object.prototype.toString.call(a)};namespace("cloudkid").Positioner=a,namespace("cloudkid.createjs").Positioner=a}(),function(){"use strict";var a=function(a,b,c){this.width=a,this.height=b,this.ppi=c};a.prototype={},namespace("cloudkid").ScreenSettings=a,namespace("cloudkid.createjs").ScreenSettings=a}(),function(){"use strict";var a,b=function(b,c,d){switch(a=cloudkid.createjs.UIScaler,this._item=b,this._settings=c,this._designedScreen=d,this.origScaleX=b.scaleX,this.origScaleY=b.scaleY,this.origWidth=b.width,this.origBounds={x:0,y:0,width:b.width,height:b.height},this.origBounds.right=this.origBounds.x+this.origBounds.width,this.origBounds.bottom=this.origBounds.y+this.origBounds.height,c.vertAlign){case a.ALIGN_TOP:this.origMarginVert=b.y+this.origBounds.y;break;case a.ALIGN_CENTER:this.origMarginVert=.5*d.height-b.y;break;case a.ALIGN_BOTTOM:this.origMarginVert=d.height-(b.y+this.origBounds.bottom)}switch(c.horiAlign){case a.ALIGN_LEFT:this.origMarginHori=b.x+this.origBounds.x;break;case a.ALIGN_CENTER:this.origMarginHori=.5*d.width-b.x;break;case a.ALIGN_RIGHT:this.origMarginHori=d.width-(b.x+this.origBounds.right)}},c=b.prototype={};c.origMarginHori=0,c.origMarginVert=0,c.origWidth=0,c.origScaleX=0,c.origScaleY=0,c.origBounds=null,c._settings=null,c._item=null,c._designedScreen=null,c.resize=function(b){var c=b.height/this._designedScreen.height,d=b.ppi/this._designedScreen.ppi,e=(b.width-this._designedScreen.width*c)/2,f=c/d;this._settings.minScale&&f<this._settings.minScale?f=this._settings.minScale:this._settings.maxScale&&f>this._settings.maxScale&&(f=this._settings.maxScale),f*=d,this._item.scaleX=this.origScaleX*f,this._item.scaleY=this.origScaleY*f;var g;switch(g=this.origMarginVert*c,this._settings.vertAlign){case a.ALIGN_TOP:this._item.y=g-this.origBounds.y*f;break;case a.ALIGN_CENTER:this._item.y=.5*b.height-g;break;case a.ALIGN_BOTTOM:this._item.y=b.height-g-this.origBounds.bottom*f}switch(g=this.origMarginHori*c,this._settings.horiAlign){case a.ALIGN_LEFT:this._item.x=this._settings.titleSafe?e+g-this.origBounds.x*f:g-this.origBounds.x*f;break;case a.ALIGN_CENTER:this._item.x=this._settings.centeredHorizontally?.5*(b.width-this._item.width):.5*b.width-g;break;case a.ALIGN_RIGHT:this._item.x=this._settings.titleSafe?b.width-e-g-this.origBounds.right*f:b.width-g-this.origBounds.right*f}},c.destroy=function(){this.origBounds=null,this._item=null,this._settings=null,this._designedScreen=null},namespace("cloudkid").UIElement=b,namespace("cloudkid.createjs").UIElement=b}(),function(){"use strict";var a=function(){},b=a.prototype={};b.vertAlign=null,b.horiAlign=null,b.titleSafe=!1,b.maxScale=1,b.minScale=1,b.centeredHorizontally=!1,namespace("cloudkid").UIElementSettings=a,namespace("cloudkid.createjs").UIElementSettings=a}(),function(){"use strict";var a=cloudkid.createjs.UIElementSettings,b=cloudkid.createjs.UIElement,c=cloudkid.createjs.ScreenSettings,d=function(a,b,d,e){this._parent=a,this._items=[],this._designedScreen=new c(b,d,e)},e=d.prototype={},f=new c(0,0,0),g=!1;e._parent=null,e._designedScreen=null,e._items=null,d.ALIGN_TOP="top",d.ALIGN_BOTTOM="bottom",d.ALIGN_LEFT="left",d.ALIGN_RIGHT="right",d.ALIGN_CENTER="center",d.fromJSON=function(a,b,c,e){"boolean"!=typeof e&&(e=!0);var f,g,h,i,j,k=new d(a,b.designedWidth,b.designedHeight,b.designedPPI);for(g in c)f=c[g],f.align?(h=f.align.split("-"),i=h[0],j=h[1]):(i=ALIGN_CENTER,j=ALIGN_CENTER),k.add(a[g],i,j,f.titleSafe||!1,f.minScale||0/0,f.maxScale||0/0,f.centeredHorizontally||!1);return k.resize(),e&&k.destroy(),k},d.init=function(a,b,c){f.width=a,f.height=b,f.ppi=c,g=!0},e.getScale=function(){return f.height/this._designedScreen.height},e.add=function(c,e,f,g,h,i,j){var k=new a;k.vertAlign=e||d.ALIGN_CENTER,k.horiAlign=f||d.ALIGN_CENTER,k.titleSafe="boolean"!=typeof g?!1:g,k.maxScale="number"!=typeof i?0/0:i,k.minScale="number"!=typeof h?0/0:h,k.centeredHorizontally=j||!1,this._items.push(new b(c,k,this._designedScreen))},d.resizeBackground=function(a){if(g){var b,c,d;b=a.image.height,c=a.image.width,d=f.height/b,a.scaleX=a.scaleY=d,a.x=.5*(f.width-c*d)}},d.resizeBackgrounds=function(a){for(var b=0,c=a.length;c>b;++b)d.resizeBackground(a[b])},e.resize=function(){if(this._items.length>0)for(var a=0,b=this._items.length;b>a;++a)this._items[a].resize(f)},e.destroy=function(){if(this._items.length>0)for(var a=0,b=this._items.length;b>a;++a)this._items[a].destroy();this._parent=null,this._designedScreen=null,this._items=null},namespace("cloudkid").UIScaler=d,namespace("cloudkid.createjs").UIScaler=d}();