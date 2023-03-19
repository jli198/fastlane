/*
 * This creates a box on screen that can have an excessive amount of text in it,
 * and the user can scroll it by dragging the text or using a scroll bar on the side.
 * Not perfect, but works!
 */
export default class ScrollText extends Phaser.GameObjects.GameObject {
	constructor(config) {
		super(config.scene,config.x,config.y);
		console.log(this);
		this.scene = config.scene;
		var scene = this.scene;
		var defaults = {
			x:0,
			y:0,
			originX: 0,
			originY: 0,
			width: 200,
			height: 500,
			font: "small",
			background: 0xffffff,
			backgroundAlpha: 1.0,
			stroke: 0x000000,
			color: 0x000000,
			strokeWidth: 1,
			innerOffsetX: 2,
			innerOffsetY: 0,
			text: "",
			align: 0,
			scrollSpeed: 1, //larger is slower 
			scrollBackground: 0xd0d0d0,
			scrollButtonBackground: 0xffffff,
			parent: undefined, //this needs to be set in advance to calculate the mask
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
		this.container = new Phaser.GameObjects.Container(scene, this.config.x,this.config.y);

		var textWidth = this.config.width-(this.config.strokeWidth*2+this.config.innerOffsetX*2);

		//scroll bar
		var scroller_width = 10;
		var scroller_height = 10;
		this.scroller = new Phaser.GameObjects.Container(scene, this.config.width-scroller_width,0);

		//background gray part
		this.scroller.add(new Phaser.GameObjects.Rectangle(scene,0,0,scroller_width,this.config.height,this.config.scrollBackground).setOrigin(0,0).setStrokeStyle(this.config.strokeWidth,this.config.stroke)
			.setInteractive()
			.setData("obj",this)
			.on("pointerdown",function(pointer) {
				var obj = this.getData("obj");
				if(pointer.y-obj.abs_y < obj.scroller.slider.rectangle.y) {
					obj.scroller.up_button.emit("pointerdown");
				} else {
					obj.scroller.down_button.emit("pointerdown");
				}
			})
			.on("pointerup",function() {
				var obj = this.getData("obj");
				obj.pointerDown = false;
			})
		);
		//top button
		this.scroller.up_button = new Phaser.GameObjects.Rectangle(scene,0,0,scroller_width,scroller_height,this.config.scrollButtonBackground).setOrigin(0,0).setStrokeStyle(this.config.strokeWidth,this.config.stroke)
			.setInteractive()
			.setData("obj",this)
			.on("pointerup",function(pointer) {
				var obj = this.getData("obj");
				obj.pointerDown = false;
			})
			.on("pointerout",function(pointer) {
				var obj = this.getData("obj");
				obj.pointerDown = false;
			})
			.on("pointerdown",function(pointer) {
					var obj = this.getData("obj");
					obj.pointerDown = true;
					obj.pointerDownCheck = obj.scene.time.addEvent({
						delay: 50,
						loop: true,
						callback: () => {
							if(obj.pointerDown) {
								obj.textObj.y += obj.config.scrollSpeed*10;
								obj.textObj.y = Phaser.Math.Clamp(obj.textObj.y, obj.textObj.minY, obj.textObj.maxY);
								obj.scroller.slider.update(obj);
							} else {
								obj.pointerDownCheck.destroy();
							}
						},
						callbackScope: obj.scene
					});	
			})
		this.scroller.add(this.scroller.up_button);

		//arrow
		this.scroller.add(new Phaser.GameObjects.Triangle(scene,scroller_width-this.config.strokeWidth*2,scroller_height/2+this.config.strokeWidth,
			0,0,
			-scroller_width/3,scroller_height/3,
			scroller_width/3,scroller_height/3,
		this.config.stroke));

		//bottom button
		this.scroller.down_button = new Phaser.GameObjects.Rectangle(scene,0,this.config.height-scroller_height,scroller_width,scroller_height,this.config.scrollButtonBackground).setOrigin(0,0).setStrokeStyle(this.config.strokeWidth,this.config.stroke)
			.setInteractive()
			.setData("obj",this)
			.on("pointerup",function(pointer) {
				var obj = this.getData("obj");
				obj.pointerDown = false;
			})
			.on("pointerout",function(pointer) {
				var obj = this.getData("obj");
				obj.pointerDown = false;
			})
			.on("pointerdown",function(pointer) {
					var obj = this.getData("obj");
					obj.pointerDown = true;
					obj.pointerDownCheck = obj.scene.time.addEvent({
						delay: 50,
						loop: true,
						callback: () => {
							if(obj.pointerDown) {
								obj.textObj.y -= obj.config.scrollSpeed*10;
								obj.textObj.y = Phaser.Math.Clamp(obj.textObj.y, obj.textObj.minY, obj.textObj.maxY);
								obj.scroller.slider.update(obj);
							} else {
								obj.pointerDownCheck.destroy();
							}
						},
						callbackScope: obj.scene
					});	
			})
		this.scroller.add(this.scroller.down_button);

		//arrow
		this.scroller.add(new Phaser.GameObjects.Triangle(scene,scroller_width-this.config.strokeWidth*2,this.config.height-scroller_height+scroller_height/2+this.config.strokeWidth,
			0,scroller_height/3,
			-scroller_width/3,0,
			scroller_width/3,0,
			this.config.stroke));

		//slider thingy 
		this.scroller.slider = {
			top: scroller_height,
			height: scroller_height/2,
			bottom: this.config.height-scroller_height*2+scroller_height/2,
			update: function(obj) {
				var new_y = obj.scene.lerp(
					obj.scroller.slider.top, obj.textObj.maxY,
				 obj.scroller.slider.bottom, obj.textObj.minY, 
				 obj.textObj.y);				 
				obj.scroller.slider.rectangle.y = new_y;
			}
		}
		this.scroller.slider.rectangle = new Phaser.GameObjects.Rectangle(scene,0,this.scroller.slider.top,scroller_width,scroller_height/2,this.config.scrollButtonBackground).setOrigin(0,0).setStrokeStyle(this.config.strokeWidth,this.config.stroke)
			.setData("id","slider")
			.setData("obj",this)
			.setInteractive()
			.on("pointerup",function(){ 
				var obj = this.getData("obj");
				obj.pointerDown = false;
			})
			.on("pointermove",function(){ 
				var obj = this.getData("obj");
				obj.pointerDown = false;
			})
		this.scroller.add(this.scroller.slider.rectangle);
		this.scene.input.setDraggable(this.scroller.slider.rectangle);
		this.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
			if(gameObject.getData("id")=="slider") {
				var obj = gameObject.getData("obj");
				var dx = (dragX-gameObject.x);
				var dy = (dragY-gameObject.y);
				obj.textObj.y -= (dy);
				obj.textObj.y = Phaser.Math.Clamp(obj.textObj.y, obj.textObj.minY, obj.textObj.maxY);
				obj.scroller.slider.update(obj);				
			}
		})	

		//overall control background
		this.background = new Phaser.GameObjects.Rectangle(scene,0,0,this.config.width,this.config.height,this.config.background,this.config.backgroundAlpha).setStrokeStyle(this.config.strokeWidth,this.config.stroke).setOrigin(0,0);

		//text object
		var bt = new Phaser.GameObjects.BitmapText(scene,this.config.innerOffsetX+this.config.strokeWidth,this.config.innerOffsetY+this.config.strokeWidth,this.config.font,this.config.text,this.config.align).setMaxWidth(textWidth).setTintFill(this.config.color).setOrigin(0,0);	
		if(scene.supportsWebGL()) {
			this.textObj = bt;
		} else {
			//this is a workaround for Canvas -- renders the BitmapText to a RenderTexture and uses that
			//with the mask. which surprisingly works. 
			this.textObj = new Phaser.GameObjects.RenderTexture(scene,bt.x,bt.y,bt.width,bt.height);
			this.textObj.draw(bt,0,0);
			bt.setVisible(false);
		}

		this.textObj.minY = -(this.textObj.height-this.config.height)-this.config.strokeWidth;
		this.textObj.maxY = this.config.innerOffsetY;
		if(this.textObj.minY>this.textObj.maxY) this.textObj.minY = this.textObj.maxY;


		//control border
		this.border = new Phaser.GameObjects.Rectangle(scene,0,0,this.config.width,this.config.height,this.config.background,0).setStrokeStyle(this.config.strokeWidth,this.config.stroke).setOrigin(0,0);

		this.container.add(this.background);
		this.container.add(this.textObj);
		this.container.add(this.border);
		this.container.add(this.scroller);
		
		var abs_x = this.config.x+this.config.strokeWidth+this.config.innerOffsetX;
		var abs_y = this.config.y+this.config.strokeWidth+this.config.innerOffsetY;

		if(typeof this.config.parent!="undefined") {
			var ac = this.get_absolute_coordinates(this.config.parent);
			abs_x+=ac.x;
			abs_y+=ac.y;
		}
		
		this.abs_x = abs_x;
		this.abs_y = abs_y;

		//This is creating the mask that hides the text on visible in the control
		const shape = new Phaser.GameObjects.Graphics(scene,{x:0,y:0});
		shape.fillStyle(0xffffff);
		shape.beginPath();
		var maskWidth = textWidth;
		var maskHeight = this.config.height-(this.config.strokeWidth*2,this.config.innerOffsetY*2);
		shape.fillRect(abs_x,abs_y,maskWidth,maskHeight)
		const mask = shape.createGeometryMask();
		this.textObj.setMask(mask);
	
		//make the background scrollable
		this.background.setInteractive()
		.setData("obj",this)
		.on('pointermove', function (pointer) {
			if(pointer.isDown) {
				var obj = this.getData("obj");
				obj.textObj.y += (pointer.velocity.y / obj.config.scrollSpeed);
				obj.textObj.y = Phaser.Math.Clamp(obj.textObj.y, -(obj.textObj.height-obj.config.height+obj.config.innerOffsetY), obj.config.innerOffsetY+obj.config.strokeWidth);
				obj.scroller.slider.update(obj);
			}
		});

		var object = this;
		//allows the setting of text
		this.container.setText = function(text) {
			if(object.scene.supportsWebGL()) {
				object.textObj.setText(text);
			} else {
				//re-render the RenderTexture for Canvas renderer
				var textWidth = object.config.width-(object.config.strokeWidth*2+object.config.innerOffsetX*2);
				var bt = new Phaser.GameObjects.BitmapText(scene,object.textObj.x,object.textObj.y,object.config.font,text,object.config.align).setMaxWidth(textWidth).setTintFill(object.config.color).setOrigin(0,0);
				object.textObj.clear();
				object.textObj.resize(bt.width,bt.height);
				object.textObj.draw(bt,0,0);	
				bt.setVisible(false);				
			}
			this.textObj.minY = -(this.textObj.height-this.config.height)-this.config.strokeWidth;
			this.textObj.maxY = this.config.innerOffsetY;
			if(this.textObj.minY>this.textObj.maxY) this.textObj.minY = this.textObj.maxY;	
		}	
		this.container.config = this.config;

		return this.container;
	}

	//returns the absolute coordinates of any object
	get_absolute_coordinates(object) {
		var tempMatrix = new Phaser.GameObjects.Components.TransformMatrix();
		var tempParentMatrix = new Phaser.GameObjects.Components.TransformMatrix();
		object.getWorldTransformMatrix(tempMatrix, tempParentMatrix);
		var m = tempMatrix.decomposeMatrix();
		var x = m.translateX;
		var y = m.translateY;
		return {"x":x,"y":y}
	}


}

