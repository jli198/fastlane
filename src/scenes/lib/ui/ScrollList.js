/*
 * This creates a listbox on screen with scrolling items in it 
 * that can be selected. 
 */
export default class ScrollList extends Phaser.GameObjects.GameObject {
	constructor(config) {		
		super(config.scene,config.x,config.y);
		console.log(this);
		this.scene = config.scene;
		var scene = this.scene;
		this.items = [];
		this.selected = false;

		var defaults = {
			x:0, //x position of control 
			y:0, //y position of control 
			originX: 0, //setOrigin x
			originY: 0, //setOrigin y
			width: 200, //control width
			height: 500, //control height

			font: "large", //bitmap font name for ites 
			items: [], //array of items -- can also be object/val pairs

			selectable: true, //can user select items?
			textColor: 0x000000, 
			textColorSelected: 0xffffff,
			listBackground: 0xffffff,
			listBackgroundAlpha: 0.001,
			listBackgroundSelected: 0x5b3319,
			listBackgroundAlphaSelected: 1.0,

			stroke: 0x000000, //line color 
			strokeWidth: 1, //line width
			scrollerWidth: 11, //width of the scroll button bar
			scrollerHeight: 10,  //height of the scroll button bar
			scrollerArrowUp: "tiny_arrow_up", //arrow at the top of bar
			scrollerArrowDown: "tiny_arrow_down", //arrow at bottom

			innerOffsetX: 2,
			innerOffsetY: 0,
			itemSpacing: 1,
			scrollSpeed: 1, //larger is slower 
			scrollBackground: 0xd0d0d0,
			scrollButtonBackground: 0xffffff,

			renderMask: true, //if set to false, it won't render the mask until you run the .renderMask() method. 
			parent: undefined, //this needs to be set in advance to calculate the mask
			abs_x_offset: undefined, //can manually offset the mask here if necessary
			abs_y_offset: undefined, //can manually offset the mask here if necessary
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

		this.items = this.config.items;

		this.container = new Phaser.GameObjects.Container(scene, this.config.x,this.config.y);
		
		this.container.obj = this;

		//scroll bar
		var scroller_width = this.config.scrollerWidth;
		var scroller_height = this.config.scrollerHeight;
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
		
		//up button
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
								obj.listObj.y += obj.config.scrollSpeed*10;
								obj.listObj.y = Phaser.Math.Clamp(obj.listObj.y, obj.listObj.minY, obj.listObj.maxY);
								obj.scroller.slider.update(obj);
							} else {
								obj.pointerDownCheck.destroy();
							}
						},
						callbackScope: obj.scene
					});	
			})
		this.scroller.add(this.scroller.up_button);

		//up arrow
		var scrollerArrowX = scroller_width-this.config.strokeWidth*2;
		var scrollerArrowY = scroller_height/2+this.config.strokeWidth;
		if(this.config.scrollerArrowUp) {
			var scrollerArrowUp = new Phaser.GameObjects.Image(scene,scrollerArrowX,scrollerArrowY-1,this.config.scrollerArrowUp);
			scrollerArrowUp.setX(Math.round(scrollerArrowUp.x-scrollerArrowUp.width/2));
			scene.center(scrollerArrowUp);
			this.scroller.add(scrollerArrowUp);
		} else {
			this.scroller.add(new Phaser.GameObjects.Triangle(scene,scrollerArrowX,scrollerArrowY,
				0,0,
				-scroller_width/3,scroller_height/3,
				scroller_width/3,scroller_height/3,
			this.config.stroke));
		}

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
								obj.listObj.y -= obj.config.scrollSpeed*10;
								obj.listObj.y = Phaser.Math.Clamp(obj.listObj.y, obj.listObj.minY, obj.listObj.maxY);
								obj.scroller.slider.update(obj);
							} else {
								obj.pointerDownCheck.destroy();
							}
						},
						callbackScope: obj.scene
					});	
			})
		this.scroller.add(this.scroller.down_button);

		//down arrow
		
		if(this.config.scrollerArrowDown) {
			var scrollerArrowDown = new Phaser.GameObjects.Image(scene,scrollerArrowX,this.config.height-scrollerArrowY+1,this.config.scrollerArrowDown);
			scrollerArrowDown.setX(Math.round(scrollerArrowDown.x-scrollerArrowDown.width/2));
			scene.center(scrollerArrowDown);
			this.scroller.add(scrollerArrowDown);
		} else {
			this.scroller.add(new Phaser.GameObjects.Triangle(scene,scrollerArrowX,this.config.height-scrollerArrowY+2,
				0,scroller_height/3,
				-scroller_width/3,0,
				scroller_width/3,0,
				this.config.stroke));
		}

		//slider thingy 
		this.scroller.slider = {
			top: scroller_height,
			height: scroller_height/2,
			bottom: this.config.height-scroller_height*2+scroller_height/2,
			update: function(obj) {
				var new_y = obj.scene.lerp(
					 obj.scroller.slider.top, obj.listObj.maxY,
					obj.scroller.slider.bottom, obj.listObj.minY, 
					obj.listObj.y);
				if(obj.listObj.maxY == obj.listObj.minY) new_y = obj.scroller.slider.top;
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
				obj.listObj.y -= (dy);
				obj.listObj.y = Phaser.Math.Clamp(obj.listObj.y, obj.listObj.minY, obj.listObj.maxY);
				obj.scroller.slider.update(obj);				
			}
		})	
		
		if(this.listObj) this.listObj.destroy();
		this.listObj = new Phaser.GameObjects.Container(scene,0,0);
		this.makeList();

		//overall control background
		this.background = new Phaser.GameObjects.Rectangle(scene,0,0,this.config.width,this.config.height,this.config.listBackground,this.config.listBackgroundAlpha).setStrokeStyle(this.config.strokeWidth,this.config.stroke).setOrigin(0,0);

		//control border
		this.border = new Phaser.GameObjects.Rectangle(scene,0,0,this.config.width,this.config.height,this.config.listBackground,0).setStrokeStyle(this.config.strokeWidth,this.config.stroke).setOrigin(0,0);

		
		this.container.add(this.background);
		this.container.add(this.listObj);
		this.container.add(this.border);
		this.container.add(this.scroller);
		this.container.config = this.config;

		if(this.container.config.renderMask) {
			this.renderMask();
		}	

		/* Creates or recreates the listbox */
		this.container.makeList = function() {
				this.makeList();
		}

		/* Selects an item by its index */
		this.container.selectItem = function(index) {
			if(!this.obj.config.selectable) return false;
			this.obj.selected = false;
			this.obj.selectedVal = false;
			this.obj.selectedText = false;
			
			for(var i in this.listObj.rects) {
				if(i==index) {
					this.obj.listObj.rects[i].setFillStyle(this.obj.config.listBackgroundSelected);
					this.obj.listObj.rects[i].setAlpha(this.obj.config.listBackgroundAlphaSelected);
					this.obj.listObj.texts[i].setTintFill(this.obj.config.textColorSelected);
					this.obj.selected = i;
					var item = this.getItemData(this.obj.items[i],i);
					this.obj.selectedVal = item.val;
					this.obj.selectedText = item.text;
				} else {
					this.obj.listObj.rects[i].setFillStyle(this.obj.config.listBackgroundAlpha);
					this.obj.listObj.rects[i].setAlpha(this.obj.config.listBackgroundAlpha);
					this.obj.listObj.texts[i].setTintFill(this.obj.config.textColor);
				}
			}
	
		}

		/* Adds an item to the listbox */
		this.container.addItem = function(item) {
			this.obj.items.push(item);
			this.obj.makeList();
		}

		/* Removes the item at a given index */
		this.container.removeItem = function(index) {
			this.obj.items.splice(index,1);
			this.obj.makeList();
		}

		/* Removes an item based on its val */
		this.container.removeItemVal = function(val) {
			for(var i in this.obj.items) {
				var item = this.getItemVal(this.obj.items[i],i);
				if(item.val == val) {
					this.obj.items.splice(i,1);
					this.obj.makeList();
					return true;;
				}
			}
			return false;
		}

		/* Returns the item of a given index */
		this.container.listItem = function (index) {
			return this.obj.getItemData(this.obj.items[index],index);
		}

		/* Returns the selected item */
		this.container.selectedItem = function() {
			if(!this.obj.config.selectable) return false;
			if(this.obj.selected === false) return false;
			return this.listItem(this.obj.selected);
		}

		this.container.width = this.config.width;
		this.container.height = this.config.height;

		return this.container;
	}

	//populates the list object
	makeList() {
		var scene = this.scene;
		this.listObj.removeAll(true);
		this.selected = false;
		this.selectedVal = false;
		this.selectedText = false;
		this.listObj.texts = [];
		this.listObj.rects = [];
		var listHeight = 0;
		for(var i in this.items) {
			var list_x = this.config.innerOffsetX+this.config.strokeWidth;
			var list_y = this.config.innerOffsetY+this.config.strokeWidth;
			var item = this.getItemData(this.items[i],i);

			var listText = new Phaser.GameObjects.BitmapText(scene,list_x,list_y,this.config.font,item.text);
			listText.setTintFill(this.config.textColor).setOrigin(0,0);
			listText.setY(listText.y+(listText.height+this.config.itemSpacing)*i);
			var listRect = new Phaser.GameObjects.Rectangle(scene,0,listText.y,this.config.width-this.config.scrollerWidth,listText.height+this.config.itemSpacing,this.config.listBackground).setAlpha(this.config.listBackgroundAlpha).setOrigin(0,0);
			if(this.config.selectable) {
				listRect
				.setInteractive()
				.setData("i",i)
				.setData("val",item.val)
				.setData("text",item.text)
				.setData("obj",this)
				.on("pointerup",function() {
					var i = this.getData("i");
					var obj = this.getData("obj");
					for(var z in obj.listObj.rects) {
						if(z==i) {
							obj.listObj.rects[z].setFillStyle(obj.config.listBackgroundSelected);
							obj.listObj.rects[z].setAlpha(obj.config.listBackgroundAlphaSelected);
							obj.listObj.texts[z].setTintFill(obj.config.textColorSelected);
						} else {
							obj.listObj.rects[z].setFillStyle(obj.config.listBackground);
							obj.listObj.rects[z].setAlpha(obj.config.listBackgroundAlpha);
							obj.listObj.texts[z].setTintFill(obj.config.textColor);
						}
					}
					obj.selected = i;
					obj.selectedVal = this.getData("val");
					obj.selectedText = this.getData("text");
				})
				.on('pointermove', function (pointer) {
					if(pointer.isDown) {
						var obj = this.getData("obj");
						obj.listObj.y += (pointer.velocity.y / obj.config.scrollSpeed);
						obj.listObj.y = Phaser.Math.Clamp(obj.listObj.y, obj.listObj.minY, obj.listObj.maxY);
						obj.scroller.slider.update(obj);
					}
				});
			}

			this.listObj.rects.push(listRect);
			listHeight+=listRect.height;
			this.listObj.add(this.listObj.rects[this.listObj.rects.length-1]);
			this.listObj.texts.push(listText);
			this.listObj.add(listText);
		}
		this.listObj.height = listHeight;
		this.listObj.width = this.config.width-this.config.scrollerWidth;
		this.listObj.minY = -(this.listObj.height-this.config.height)-this.config.strokeWidth;
		this.listObj.maxY = this.config.innerOffsetY;
		if(this.listObj.minY>this.listObj.maxY) this.listObj.minY = this.listObj.maxY;

		/*
		var rt = new Phaser.GameObjects.RenderTexture(scene,this.listObj.x,this.listObj.y,this.config.width-this.config.scrollerWidth,this.listObj.height);
		rt.draw(this.listObj,0,0);
		this.listObj = rt;*/


	}

	getItemData(item,i) {
		if(typeof item == "string") {
			var item_val = i;
			var item_text = item;
		} else if(typeof item=="object") {
			if(Array.isArray(item)) {
				var item_val = item[0];
				var item_text = item[1];
			} else {
				var item_val = item.val;
				var item_text = item.text;
			}
		}
		return {val:item_val,text:item_text}
	}

	renderMask() {
		var abs_x = this.config.x;
		var abs_y = this.config.y+this.config.strokeWidth+this.config.innerOffsetY;
	
		if(typeof this.config.parent!="undefined") {
			var ac = this.get_absolute_coordinates(this.config.parent);
			abs_x+=ac.x;
			abs_y+=ac.y;
		}
		if(typeof this.config.abs_x_offset !="undefined") {
			abs_x+=this.config.abs_x_offset;
		}
		if(typeof this.config.abs_y_offset !="undefined") {
			abs_y+=this.config.abs_y_offset;
		}

		this.abs_x = abs_x;
		this.abs_y = abs_y;

		//This is creating the mask that hides the text on visible in the control
		const shape = new Phaser.GameObjects.Graphics(this.scene,{x:0,y:0});
		shape.fillStyle(0xffffff);
		shape.beginPath();
		var maskWidth = this.listObj.width;
		var maskHeight = this.config.height-(this.config.strokeWidth*2,this.config.innerOffsetY*2);
		shape.fillRect(abs_x,abs_y,maskWidth,maskHeight)
		const mask = shape.createGeometryMask();
		this.listObj.setMask(mask);

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