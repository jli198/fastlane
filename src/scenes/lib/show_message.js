


/*
 * The code that shows a message to the player. Requires an `options` object that has 
 * a lot of properties:
 *  `parent`: the container that is hosting this message. by default it will be scene.location_window,
 *  		but you can set it to anything. If you are trying to make a message OUTSIDE of the location_window,
 * 			create a temporary container for this, or it'll have problems.
 * 	`image`: the background image texture name used for the message (e.g. a speech bubble).
 *  `image_x`: the x position of the image texture (pixels) relative to the parent container. will be centered if not specified.
 *  `image_y`: the y position of the image texture (pixels) relative to the parent container. will be centered if not specified.
 *  `text_x`: the x position of the text object (pixels) relative to the parent container. will be centered if not specified.
 *  `text_y`: the y position of the text object (pixels) relative to the parent container. will be centered if not specified.
 *  `message`: the text message to display
 *  `callback`: a function that is run after the message has been dismissed. SOMETIMES GETS RUN TWICE in the case of
 * 			messages that can be dismissed AND have a delay. (this is a bug. just be aware of it for now.)
 * 			the callback function receives two variables: `scene` and `args` (see below). It does NOT receive the location
 * 			by default, because you might not be in a location. You can send the location as the `args` variable, though.
 *  `args`: if you want to pass information to the callback, put it in this variable.
 *  `choices`: an array of objects that requires the player to make a choice (e.g., confirm YES or NO).
 *  		each object in this `choices` array needs to have an `option` property (the text to be displayed
 * 			on the button, like "Yes"). they may optionally have an `onclick` property, which is a function
 * 			that is run if the button is pressed. the message prompt will always end (and trigger the callback)
 * 			no matter what button is pressed.
 *  `close_by_clicking`: a boolean that toggles whether the message goes away by clicking anywhere on the screen.
 * 			default is true. if you set it to false, make sure there is another way to make the message go away (like a 
 * 			display_time)
 * 	`display_time`: the amount of time the message will be displayed before automatically being dismissed.
 * 			this is in milliseconds (1000 = 1 sec.) by default, messages don't go away unless you click on them.
 * 	`display_time`: the amount of time the message will be displayed before automatically being dismissed.
 * 			this is in milliseconds (1000 = 1 sec.) by default, messages don't go away unless you click on them.
 *  `fade_in`: a boolean that causes the message to fade in when it appears.
 *  `fade_delay`: the amount of time (in milliseconds) that the fade animation works.
 *  `mouth`: a very silly thing that moves a given mouth image object. look at the locations for examples.
 * settings you probably won't change: 
 *  `origin`: the origin (0 or 0.5) for the image texture. set to 0 by default.
 *  `message_font`: the BitmapFont name for the message.
 *  `choices_font`: the BitmapFont name for the choices prompts. 

*/

module.exports = function(scene,options) {
		if(typeof options=="undefined") return false;
		if(typeof options.parent == "undefined") {
			if(typeof scene.location_window !="undefined") {
				parent = scene.location_window; //our default "parent" -- should work most of the time
			} else {
				parent = scene.background; //this probably won't work well
			}
		} else {
			parent = options.parent;
		}

		var x = (typeof options.image_x=="undefined")?0:options.image_x;
		var y = (typeof options.image_y=="undefined")?0:options.image_y;
		var center_x = (typeof options.image_x=="undefined")?true:false;
		var center_y = (typeof options.image_y=="undefined")?true:false;
		var image_origin = typeof(options.origin == "undefined")?0:options.origin;
		var callback = (typeof options.callback=="function")?options.callback:false;
		var display_time = (typeof options.display_time=="undefined")?undefined:options.display_time;
		var choices = (typeof options.choices=="undefined")?false:options.choices;
		var texture = (typeof options.image=="undefined")?"MISSING_TEXTURE":options.image;
		var message = (typeof options.message=="undefined")?"":options.message;
		var message_font = (typeof options.font=="undefined")?"large":options.font;
		var choices_font = (typeof options.choices_font=="undefined")?"chunky":options.choices_font;
		var close_by_clicking = (typeof options.close_by_clicking=="undefined")?true:options.close_by_clicking;
		var fade_in = (typeof options.fade_in=="undefined")?false:options.fade_in;
		var fade_out = (typeof options.fade_out=="undefined")?false:options.fade_out;
		var fade_delay = (typeof options.fade_delay=="undefined")?500:options.fade_delay;
		var drop_in = (typeof options.drop_in=="undefined")?false:options.drop_in;
		var drop_delay = (typeof options.drop_delay=="undefined")?500:options.drop_delay;
		var depth = (typeof options.depth=="undefined")?false:options.depth;



		var args = options.args;

		scene.player.modal = true;

		//this is just tremendously silly -- but adaptable!
		if(typeof options.mouth!="undefined") {
			var mouth_dx = (typeof options.mouth_dx=="undefined")?1:options.mouth_dx;
			var mouth_dy = (typeof options.mouth_dy=="undefined")?3:options.mouth_dy;
			var mouth_duration = (typeof options.mouth_duration=="undefined")?70:options.mouth_duration;
			var mouth_repeat = (typeof options.mouth_repeat=="undefined")?4:options.mouth_repeat;
			if(typeof scene.mouth_tween!="undefined") {
				//reset any moving mouths -- otherwise they'll sort of walk of the screen
				//if this function gets called again before its tween stops
				scene.mouth_tween.stop();
				parent.mouth.x = options.mouth_x;
				parent.mouth.y = options.mouth_y;
			}
			scene.mouth_tween = scene.tweens.add({
				targets: parent.mouth,
				y: parent.mouth.y+mouth_dy,
				x: parent.mouth.x+mouth_dx,
				yoyo: true,
				repeat: mouth_repeat,
				duration: mouth_duration,
			})
		}

		var speechBubble = new Phaser.GameObjects.Container(scene,x,y);
		if(depth) speechBubble.setDepth(depth);
		var bubble = new Phaser.GameObjects.Image(scene,0,0,texture).setOrigin(0,0)

		if(center_x) {
			//we do this here because a) we need the x coordinate, and b) we need the bubble image width
			x = Math.round(scene.width/2-bubble.width/2-parent.x);
			speechBubble.setX(x)
		}
		if(center_y) {
			y =Math.round(scene.height/2-bubble.height/2-parent.y);
			speechBubble.setY(y);
		}
		
		//creates a rectangle that detects clicks on top of everything else -- makes it either modal or easily dismissable
		var screenClicker = scene.add.rectangle(-parent.x-x,-parent.y-y,scene.width,scene.height).setOrigin(0)
		.setDepth(1000)
		.setData("scene",scene)
		.setInteractive() //we make this interactive even if clicking disabled is false, otherwise you'll click through it
		speechBubble.add(screenClicker);

		if(!choices) {
			//basic functionality for making the bubble go away if there are no choices
			if(close_by_clicking) { //can disable clicking -- make sure there is some other way to get rid of the message if enabled!
				screenClicker.on("pointerup",function(e) {
					var scene = this.getData("scene");
					if(fade_out) {
						scene.tweens.add({
							targets: speechBubble,
							duration: fade_delay,
							alpha: 0.0,
							onComplete: function() {
								scene.player.modal = false;
								if(typeof callback=="function") callback(scene,args);
								speechBubble.destroy();		
							}
						})
					} else { 
						scene.player.modal = false;
						if(typeof callback=="function") callback(scene,args);
						speechBubble.destroy();
					}
				})
			}
			if(scene.settings.speech_display!==false||(display_time != "undefined"&&display_time!==false)) {					
				scene.time.addEvent( {
					delay: (typeof display_time=="undefined")?scene.settings.speech_display:display_time,
					callback: function() {
						if(typeof speechBubble != "undefined") {
							if(fade_out) {
								scene.tweens.add({
									targets: speechBubble,
									duration: fade_delay,
									alpha: 0.0,
									onComplete: function() {
										scene.player.modal = false;
										if(typeof callback=="function") callback(scene,args);
										speechBubble.destroy();		
									}
								})
							} else {
								scene.player.modal = false;
								if(typeof callback=="function") callback(scene,args);
								speechBubble.destroy();
							}
						}
					},
					callbackScope: scene
				})
			}
		}

		var text_x = (typeof options.text_x=="undefined")?Math.round(bubble.width/2):options.text_x;
		var text_y = (typeof options.text_y=="undefined")?Math.round(bubble.height/2):options.text_y;
		var text_width = (typeof options.text_width == "undefined")?106:options.text_width;
		var center_x = (typeof options.center_x=="undefined")?true:options.center_x;
		var center_y = (typeof options.center_y=="undefined")?true:options.center_y;

		speechBubble.add(bubble);
		var msg = new Phaser.GameObjects.BitmapText(scene,text_x,text_y,message_font,message,undefined,1).setMaxWidth(text_width).setAlpha(0.7);
		if(center_x) msg.setX(text_x-Math.round(msg.width/2)); //works better than setOrigin
		if(center_y) msg.setY(text_y-Math.round(msg.height/2));
		speechBubble.add(msg)

		//puts choices in a bubble
		if(choices!==false) {
			var choice_container = new Phaser.GameObjects.Container(scene,0,0);
			choice_container.y = (typeof options.choice_y=="undefined")?bubble.height-13:options.choice_y;
			var choice_gap = (typeof options.choice_gap=="undefined")?14:options.choice_gap;

			var c_text_x = (typeof options.choice_x=="undefined")?0:options.choice_x;
			var choice_options = [];
			for(var i=0; i<choices.length;i++) {
				var opt = new Phaser.GameObjects.BitmapText(scene,c_text_x,0,choices_font,choices[i].option,undefined,1).setMaxWidth(text_width).setOrigin(0).setAlpha(0.7);
				opt.setY(opt.y-Math.round(opt.height/2));
				opt.setX(opt.x-Math.round(opt.width));
				var choice_args;
				if(typeof choices[i].args != "undefined") choice_args = choices[i].args;
				if(typeof choice_args == "undefined" && typeof args !="undefined") choice_args = args;
				var rect = new Phaser.GameObjects.Rectangle(scene,opt.x+opt.width/2+1,opt.y+1+opt.height/2,opt.width+10,opt.height+2).setStrokeStyle(1.1,0x000000,0.7)
					.setData("c",choices[i])
					.setInteractive()
					.on("pointerdown",function () {
						this.setFillStyle(0xffffff,1);
					})
					.on("pointerout",function() {
						this.setFillStyle(0xffffff,0);
					})
					.on("pointerup",function() {
						this.setFillStyle(0xffffff,0);
						var c = this.getData("c");
						if(typeof c.onclick == "function") {
							c.onclick(this.scene,choice_args);
						}
						if(typeof callback=="function") callback(this.scene,args);
						this.scene.player.modal = false;
						this.parentContainer.parentContainer.destroy();	
					})

				choice_options.push(rect)
				choice_container.add(choice_options[choice_options.length-1]);
				choice_container.add(opt);

				c_text_x+=(opt.width+choice_gap);

			}
			choice_container.x = text_x-(c_text_x-choice_gap)/2+choice_gap;
			speechBubble.add(choice_container);
		}

		if(fade_in) {
			speechBubble.setAlpha(0);
			scene.tweens.add({
				targets: speechBubble,
				duration: fade_delay,
				alpha: 1.0,
			})
		}
		if(drop_in) {
			//it would be neat to mask this so that it only dropped in on the location_window,
			//but I can't quite get it to work and it's not worth spending hours on
			var target_y = speechBubble.y;
			speechBubble.y = -bubble.height;
			scene.tweens.add({
				targets: speechBubble,
				duration: drop_delay,
				y: target_y
			})
		}

		parent.add(speechBubble);
	}
