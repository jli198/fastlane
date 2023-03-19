/*
 * A simple Bitmaptext modal popup class.
 * 
 * Designed to be used outside of normal locations, etc., for system-level things.
 * 
 * Basic syntax examples:
 * 
 * 	this.add.existing(new ModalMessage({
 * 			"scene": this,
 *			"text": "A simple popup message."
 *	}))
 * 
 *	this.add.existing(new ModalMessage({
 *		"scene": this,
 *		"maxWidth": scene.width*0.7,
 *		"text": "Are you sure you want to do that?",
 *		"choices": [
 *			{
 *				"option": "Yes",
 *				"onclick": function(scene) {
 *					//do something
 *				}
 *			},
 * 			{
 * 				"option": "No"
 * 			}
 *		]
 * 	}))

 * 
 */

export default class ModalMessage extends Phaser.GameObjects.Container {
	constructor(config) {
		super(config.scene,0,0);
		this.scene = config.scene;
		console.log("ModalMessage");
		var scene = this.scene;
		//reject duplicate calls
		if(typeof scene.hasModalMessage !="undefined" && scene.hasModalMessage==true) return {};
		scene.hasModalMessage = true;
		var scene_width = scene.sys.game.scale.baseSize.width;
		var scene_height = scene.sys.game.scale.baseSize.height;
		var defaults = {
			maxWidth: Math.round(scene_width/2),
			maxHeight: Math.round(scene_height*0.8),
			font: "chunky",
			text: "",
			textObj: undefined,
			header: "",
			headerFont: "chunky",
			headerDistance: 4,
			headerColor: 0x404040,
			stroke: 0x000000,
			strokeWidth: 1,
			color: 0x000000,
			background: 0xffffff,
			paddingX: 5,
			paddingY: 5,
			modalFill: 0x000000,
			modalAlpha: 0.5,
			choices: [],
			choiceButtonType: 0, //0 = inverts, 1 = moves when clicked
			choiceFont: "small",
			choiceColor: 0x000000,
			choiceBackground: 0xffffff,
			choiceDistanceFromText: 8,
			choiceBetween: 2,
			choiceStrokeWidth: 2,
			choicePaddingX: 4,
			choicePaddingY: 2,
			dropShadow: true,
			dropShadowColor: 0x000000,
			dropShadowAlpha: 1,
			dropShadowX: 1,
			dropShadowY: 1,
			callback: undefined,
			ondisplay: undefined
		}
		//set settings
		this.config = {};
		for(var i in Object.keys(defaults)) {
			var k = Object.keys(defaults)[i];
			if(typeof config[k] == "undefined") {
				this.config[k] = defaults[k];
			} else {
				this.config[k] = config[k];
			}
		}
		this.setDepth(500000);
		this.clicker = new Phaser.GameObjects.Rectangle(scene,0,0,scene_width,scene_height,this.config.modalFill,this.config.modalAlpha).setOrigin(0,0).setInteractive();
		this.add(this.clicker);		

		var box_x = Math.round(scene_width/2-this.config.maxWidth/2);
		//we will set the box_y when we know the height of the box

		if(this.config.dropShadow) {
			this.shadow =  new Phaser.GameObjects.Rectangle(scene,box_x+this.config.dropShadowX+this.config.strokeWidth,this.config.dropShadowY,this.config.maxWidth,100,this.config.dropShadowColor,this.config.dropShadowAlpha).setOrigin(0,0);
			this.add(this.shadow);
		}

		this.box = new Phaser.GameObjects.Rectangle(scene,box_x,0,this.config.maxWidth,100,this.config.background)
			.setOrigin(0,0)	
			.setStrokeStyle(this.config.strokeWidth,this.config.stroke);
		this.add(this.box);
	
		var text_width = this.config.maxWidth-this.config.paddingX*2;
		var text_x = Math.round(scene_width/2-(text_width)/2);
		var text_y = this.config.paddingY;
		if(this.config.header !="") {
			this.header = new Phaser.GameObjects.BitmapText(scene,text_x,text_y,this.config.headerFont,this.config.header,undefined,1)
				.setMaxWidth(text_width)
				.setOrigin(0,0)
				.setTintFill(this.config.headerColor)
			this.add(this.header);
			text_y+=this.header.height+this.config.headerDistance;
		}

		if(typeof this.config.textObj == "undefined") {
			//create BitmapText object
			this.text = new Phaser.GameObjects.BitmapText(scene,text_x,text_y,this.config.font,this.config.text,undefined,1)
				.setMaxWidth(text_width)
				.setOrigin(0,0)
				.setTintFill(this.config.color)
		} else {
			//can also substitude your own object, which can be anything with a width and height
			this.text = this.config.textObj;
			this.text.setY(text_y);
		}
		//for small text, make sure it is centered.
		var box_width = this.box.width;
		if(this.text.width<text_width) {
			text_width = this.text.width;
			var text_x = Math.round(scene_width/2-(text_width)/2);
			this.text.setX(text_x);
			box_width = text_width+this.config.paddingX*2;
			box_x = Math.round(scene_width/2-box_width/2);
		}
		this.add(this.text);	

		if(this.config.choices.length == 0) {
			var choices_height = 0;
		} else {
			var choice_x = 0;
			var choice_y = 0;
			var choice_line = 0;
			this.choice_container = [];
			this.choice_container[0] = new Phaser.GameObjects.Container(scene,box_x,this.text.height+this.config.choiceDistanceFromText);
			var choices_widths = [];
			choices_widths[0] = 0;
			for(var i in this.config.choices) {
				var choice_txt = new Phaser.GameObjects.BitmapText(scene,choice_x+this.config.choiceStrokeWidth+this.config.choicePaddingX,choice_y+this.config.choiceStrokeWidth+this.config.choicePaddingY,this.config.choiceFont,this.config.choices[i].option)
					.setOrigin(0,0)
					.setTintFill(this.config.choiceColor)
					.setData("line",choice_line);
				var choice_box = new Phaser.GameObjects.Rectangle(scene,choice_x,choice_y,choice_txt.width+this.config.choicePaddingX*2+this.config.choiceStrokeWidth*2,choice_txt.height+this.config.choicePaddingY*2+this.config.choiceStrokeWidth*2,this.config.choiceBackground)
					.setOrigin(0,0)
					.setStrokeStyle(this.config.choiceStrokeWidth,this.config.stroke)
					.setData("txt",choice_txt)
					.setData("obj",this)
					.setData("choice",i)
					.setData("line",choice_line);
				var choice_box_height = choice_box.height;
				if(choice_x>0) {
					var this_width = choice_box.width+choice_x+this.config.choiceBetween;
				} else {
					var this_width = choice_box.width+choice_x;
				}

				if(this_width>this.config.maxWidth) {
					choice_line++;
					this.choice_container.push(new Phaser.GameObjects.Container(scene,box_x,this.text.height+this.config.choiceDistanceFromText));
					choice_box.setData("line",choice_line);
					choice_txt.setData("line",choice_line);
					choices_widths.push(0);
					choice_x = 0;
					choice_box.setX(choice_x);
					choice_txt.setX(choice_x+this.config.choiceStrokeWidth+this.config.choicePaddingX).setY(this.config.choiceStrokeWidth+this.config.choicePaddingY);
					choices_widths[choice_line] = choice_box.width+this.config.choiceStrokeWidth*2;
					choice_x+=choice_box.width+this.config.choiceStrokeWidth*2+this.config.choiceBetween;
				} else {
					choices_widths[choice_line] = choice_x+choice_box.width+this.config.choiceStrokeWidth*2;
					choice_x += choice_box.width+this.config.choiceStrokeWidth*2+this.config.choiceBetween;
				}

				//handle all clickings, mouseovers, etc.
				choice_box.setInteractive()
					.on("pointerdown",function() {
						var obj = this.getData("obj");
						var txt = this.getData("txt");
						switch(obj.config.choiceButtonType) {
							case 1: 
							this.setX(this.getData("x")+1).setY(this.getData("y")+1);
							txt.setX(txt.getData("x")+1).setY(txt.getData("y")+1);
						break;
							default: case 0:
							txt.setTintFill(obj.config.choiceBackground);
							this.setFillStyle(obj.config.choiceColor);
							break;
						}
					})
					.on("pointerout",function() {
						var obj = this.getData("obj");
						var txt = this.getData("txt");
						switch(obj.config.choiceButtonType) {
							case 1: 
								this.setX(this.getData("x")).setY(this.getData("y"));
								txt.setX(txt.getData("x")).setY(txt.getData("y"));
							break;
							default: case 0:
							txt.setTintFill(obj.config.choiceColor);
							this.setFillStyle(obj.config.choiceBackground);
							break;
						}
					})
					.on("pointermove",function(pointer) {
					var obj = this.getData("obj");
					var txt = this.getData("txt");
					if(typeof this.getData("x")=="undefined") {
							this.setData("x",this.x);
							this.setData("y",this.y);
							txt.setData("x",txt.x);
							txt.setData("y",txt.y);
						}
						if(pointer.isDown) {
							switch(obj.config.choiceButtonType) {
								case 1: 
									this.setX(this.getData("x")+1).setY(this.getData("y")+1);
									txt.setX(txt.getData("x")+1).setY(txt.getData("y")+1);
								break;
								default: case 0:
									txt.setTintFill(obj.config.choiceBackground);
									this.setFillStyle(obj.config.choiceColor);
								break;
							}
						} 
					})
					.on("pointerup",function() {
						var obj = this.getData("obj");
						var txt = this.getData("txt");
						var i = this.getData("choice");
						switch(obj.config.choiceButtonType) {
							case 1: 
								var x = this.getData("x");
								if(x == undefined) {
									this.setData("x",this.x-1);
									x = this.x;
								}
								var y = this.getData("x");
								if(y == undefined) {
									this.setData("y",this.y-1);
									y = this.y;
								}
								this.setX(x).setY(y);
							break;
							default: case 0:
								txt.setTintFill(obj.config.choiceColor);
								this.setFillStyle(obj.config.Choicebackground);
							break;
						}
						if(typeof obj.config.choices[i].onclick=="function") {
							obj.config.choices[i].onclick(obj.scene);
						}
						scene.hasModalMessage = false;
						obj.destroy();
					})
					
					this.choice_container[choice_line].add(choice_box);
					this.choice_container[choice_line].add(choice_txt);
			}
			for(var i = 0; i<=choice_line;i++) {
				var c_x = Math.round(scene_width/2-(choices_widths[i]-this.config.choiceStrokeWidth*2)/2);
				this.choice_container[i].setX(c_x);
				this.add(this.choice_container[i]);
			}
			var choices_height = this.config.choiceDistanceFromText+((choice_line+1)*choice_box_height+(this.config.choicePaddingY*choice_line));
		}

		var box_height = choices_height+this.text.height+this.config.paddingY*2;
		if(this.config.header) {
			box_height+=this.header.height+this.config.headerDistance;
		}
		this.box.setSize(box_width,box_height).setX(box_x);
		if(this.config.dropShadow) this.shadow.setSize(box_width,box_height).setX(box_x+this.config.dropShadowX);
		var box_y = Math.round(scene_height/2-box_height/2);
		this.box.setY(box_y);
		if(this.config.dropShadow) {
			this.shadow.setY(this.box.y+this.config.dropShadowY+this.config.strokeWidth);
		}
		var text_y = box_y + this.config.paddingY;
		if(this.header) {
			this.header.setX( Math.round(scene_width/2-(this.header.width)/2));
			this.header.setY(text_y);
			text_y+=this.header.height+this.config.headerDistance;
		}
		this.text.setY(text_y);
		if(this.choice_container) {
			text_y+=this.text.height+this.config.choiceDistanceFromText;
			for(var i = 0; i<=choice_line;i++) {
				this.choice_container[i].setY(text_y+((choice_box_height+this.config.choiceStrokeWidth+this.config.choiceBetween)*i))
			}
		}

		//add box hitbox now because we have resized it
		if(this.config.choices.length==0) {
			this.box
			.setInteractive()
			.setData("obj",this)
			.on("pointerup",function() {
				//click away box
				var obj = this.getData("obj");
				if(typeof obj.config.callback == "function") {
					obj.config.callback(obj.scene);
				} 		
				scene.hasModalMessage = true;
				obj.destroy();
			})
		}
		if(typeof this.config.ondisplay == "function") {
			this.config.ondisplay(scene,this);
		}
		return this;
	}

}