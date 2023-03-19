/*
 * The code that shows the screen for a given location. It is the code that processes all
 * location data.
 * The `id` argument is the location `id` (required!!!!)
 * The `take_time` argument is a boolean flag for whether we penalize the player for
 * visiting the screen. If they are visiting it from the map normally, they lose 
 * 2 hours of time. But there are many cases where we want to refresh the location
 * screen, so passing false to `take_time` will do so without taking any time.
 * `location_object` is a full location object -- if used, it will not get the info using
 * 	scene.get_location(), but just use that object. 
 */
module.exports = function(scene,id,take_time = true,location_object) {
		console.log("show_location "+id);

		if(take_time) scene.subtract_time(2); //entering a location costs 2 hours unless take_time is false

		//get location info
		if(typeof location_object=="undefined") {
			var location = scene.get_location(id);
		} else {
			var location = location_object;
		}
		
		//destroy existing window if it exists for some reason
		if(scene.location_window) scene.location_window.destroy();

		//create the location container (location_window)
			//scene.location_window is a Container that holds everything displayed about a location
			scene.location_window = scene.add.container(68,44).setDepth(10);

			if(typeof location.speech == "undefined") {
				var speech = false;
			} else {
				if(typeof location.speech == "function") {
					var speech = location.speech(scene,location);
				} else {
					var speech = location.speech;
				}
			}
			//create the location background image -- technically this is optional!
			if(typeof location.image !="undefined") {
				if(typeof location.image=="function") {
					var location_image = location.image(scene,location);
				} else {
					var location_image = location.image;
				}
				scene.location_window.add(new Phaser.GameObjects.Image(scene,0,0,location_image).setOrigin(0));
			}

			//add the mouth texture if one is specified
			if(typeof speech.mouth !="undefined") {
				scene.location_window.mouth = new Phaser.GameObjects.Image(scene,speech.mouth_x,speech.mouth_y,speech.mouth).setOrigin(0);
				scene.location_window.add(scene.location_window.mouth);
			}

			//player money display
			var show_money = true;
			if(typeof location.show_money!="undefined") {
				if(typeof location.show_money=="function") {
					show_money = location.show_money(scene,location);
				} else {
					show_money = location.show_money;
				}
			}
			if(show_money) scene.show_money();

			//get item-wide properties/set defaults

			//spacing between items
			var item_spacing = (typeof location.item_spacing == "undefined"?13:location.item_spacing);


			//offsets
			var item_offset_x =(typeof location.item_offset_x=="undefined")?0:location.item_offset_x;
			var item_offset_y =(typeof location.item_offset_y=="undefined")?0:location.item_offset_y;

			//default starting positions
			var item_x = (typeof location.items_x=="undefined")?0:location.items_x; 
			var item_y = (typeof location.items_y=="undefined")?32:location.items_y; 

			//defaults for all items -- can be overrided individually
			var global_item_color = (typeof location.item_color=="undefined")?0x000000:location.item_color;
			var global_item_font = (typeof location.item_font == "undefined")?"small":location.item_font;
			var global_item_hover = (typeof location.item_hover=="undefined")?0xFFFFFF:location.item_hover;
			var global_item_width = (typeof location.item_width == "undefined")?106:location.item_width; //used for line width calculations (like dots)
			var global_item_align = (typeof location.item_align == "undefined")?false:location.item_align; //currently supports being "center" or `false`
			
			//drop shadow properties (false for none) -- should be an array of drop shadow properties
			//(x,y,color,alpha). defaults are 1,1,item_color,0.2. if the item_color index is undefined, will use current item_color 
			var global_drop_shadow = (typeof location.drop_shadow=="undefined")?[1,1,undefined,0.2]:location.drop_shadow;

			//create list of items
			if(typeof location.items !="undefined") {
				item_x+=item_offset_x;
				item_y+=item_offset_y;
				
				if(typeof location.items=="function") {
					var items = location.items(scene,location);
				} else {
					var items = location.items;
				}
				for(var i in items) {
					var item = items[i];
					if(typeof item.display=="undefined") item.display = true;
					if(typeof item.y!="undefined") item_y+= item.y;
					if(typeof item.x!="undefined") item_x = item.x;
					item._item_y = item_y;
					item._item_x = item_x;
					var show_item = true;
					if(typeof item.display=="function") {
						show_item = item.display(scene,item,location);
					} else {
						show_item = item.display;
					}
					//if we show the tiem
					if(show_item) {
						var item_hover = (typeof item.hover =="undefined")?global_item_hover:item.hover;
						//if an arbitrary object is passed, use that instead of creating one out of text
						if(typeof item.object !="undefined") {
							var obj = item.object;
							obj.setX(item_x).setY(item_y)
							scene.location_window.add(obj)
						} else {
							//otherwise create a text object
							var item_font = (typeof item.font == "undefined")?global_item_font:item.font;
							var item_color = (typeof item.color == "undefined")?global_item_color:item.color;
							if(typeof item.price != "undefined") {
								//if it has a price, display a line of dots and the adjusted price
								//the price_cost thing is just to calculate the size of the full line
								var use_economy = (typeof item.use_economy == "undefined")?true:item.use_economy;
								var price = Math.round(item.price*(use_economy?scene.gamestate.economy:1));
								if(typeof item.text=="undefined") {
									var item_text = item.name;
								} else {
									if(typeof item.text=="function") {
										var item_text = item.text(scene,item,location);
									} else {
										var item_text = item.text;
									}
								}
								var obj = new Phaser.GameObjects.BitmapText(scene, item_x,item_y,item_font,item_text)
								var price_cost = new Phaser.GameObjects.BitmapText(scene, item_x,item_y,item_font,String(" $"+price)).setVisible(false);
								var item_width = typeof(item.item_width=="undefined")?global_item_width:item.item_width;
								var dot_width = item_width - (obj.width + price_cost.width);
								price_cost.destroy();
								obj.setText(item.name+String(".").repeat(dot_width/2)+" $"+price)
							} else {
								if(typeof item.text=="undefined") {
									var item_text = item.name;
								} else {
									if(typeof item.text=="function") {
										var item_text = item.text(scene,item,location);
									} else {
										var item_text = item.text;
									}
								}
								var obj = new Phaser.GameObjects.BitmapText(scene, item_x,item_y,item_font,item_text).setOrigin(0);
							}
							//formatting of text
							var item_align = (typeof item.align=="undefined")?global_item_align:item.align;
							obj.setTintFill(item_color);
							if(item_align=="center") {
								//this works much better for pixel art, esp. CANVAS renderer than using setOrigin(0.5,0);
								obj.x = obj.x-Math.round(obj.width/2);
							}
							var drop_shadow = (typeof item.drop_shadow=="undefined")?global_drop_shadow:item.drop_shadow;
							if(drop_shadow!==false) {
								obj.setDropShadow(drop_shadow[0],drop_shadow[1],(typeof drop_shadow[2]=="undefined")?item_color:drop_shadow[2],drop_shadow[3])
							}

						}

						//add the item object to the location_window
						scene.location_window.add(obj)

						//if an item is set as the hitbox, the hitbox will use its geometry
						//if not, it will try to match the default text geometry just created
						if(typeof item.hitbox=="undefined") { 
							var hit_coords = {
								"x": obj.x,
								"y": obj.y,
								"width": obj.width,
								"height": obj.height,
								"originX": obj.originX,
								"originY": obj.originY,					
							}
						} else {
							if(typeof item.hitbox=="function") {
								var hit_coords = item.hitbox(scene,item,location);	
							} else {
								var hit_coords = {
									"x": item.hitbox.x,
									"y": item.hitbox.y,
									"width": item.hitbox.width,
									"height": item.hitbox.height,
									"originX": (typeof item.hitbox.originX=="undefined")?0.5:item.hitbox.originX,
									"originY": (typeof item.hitbox.originY=="undefined")?0.5:item.hitbox.originY
								}
							}
						}
						var hitbox = new Phaser.GameObjects.Rectangle(scene,hit_coords.x,hit_coords.y,hit_coords.width,hit_coords.height)
						.setOrigin(hit_coords.originX,hit_coords.originY)

						if(scene.settings.show_hitboxes) { //debugging
							hitbox.setStrokeStyle(1,0x00ff00).setFillStyle(0x00ff00,0.25);
						}
						//set up the hit event
						hitbox
						.setInteractive()
						.setData("item",item)
						.setData("scene",scene)
						.setData("obj",obj)
						.setData("location",location)
						.on("pointerover",function(e) {
							var obj = this.getData("obj");
							var scene = this.getData("scene");
							var item = this.getData("item");
							var location = this.getData("location");
							if(typeof item_hover !="undefined") {
								if(typeof item_hover == "function") {
									item_hover(true,obj,scene,item,location);
								} else {
									if(typeof obj.setTintFill == "function") {
										obj.setTintFill(item_hover);
									}
								}
							}
						})
						.on("pointerout",function(e) {
							var obj = this.getData("obj");
							var scene = this.getData("scene");
							var item = this.getData("item");
							var location = this.getData("location");
							if(typeof item_hover !="undefined") {
								if(typeof item_hover == "function") {
									item_hover(false,obj,scene,item,location);
								} else {
									if(typeof obj.setTintFill == "function") {
										obj.setTintFill(item_color);
									}
								}
							}
						})
						.on("pointerup",function(e) {
							var item = this.getData("item");
							var scene = this.getData("scene");
							var location = this.getData("location");
							if(scene.player.modal) return false;
							var can_buy = true;
							if(typeof item.price !="undefined") {
								var check_price = (typeof item.check_price == "undefined")?true:item.check_price;
								if(check_price) {
									if(this.scene.player.money <= item.price) {
										can_buy = false;
										scene.show_message({...speech,...{
											message: "You can't afford that right now.\n\n You only have $"+this.scene.player.money+".",
										}})
									} else {
										can_buy = true;
									}
								}
								//if they have set the buy function, check that
								if(can_buy && typeof item.buy =="function") {
									can_buy = item.buy(scene,item,location);
								}
								if(can_buy) {
									scene.player.money-=item.price;
									scene.player_money.setText(String(scene.player.money).padStart(7," "));
									if(typeof item.use == "function") item.use(scene,item,location); 
									if(typeof item.image != "undefined") {
										if(typeof location.item_image_x !="undefined"&&typeof location.item_image_y!=="undefined") {
											if(scene.location_window.item_image) scene.location_window.item_image.destroy();
											scene.location_window.item_image = new Phaser.GameObjects.Image(scene,location.item_image_x,location.item_image_y,item.image).setOrigin(0,0)
											scene.location_window.add(scene.location_window.item_image);
										}
									}
									if(typeof item.message !="undefined") {
										scene.show_message({...speech,...{
											message: item.message
										}})
									}
								}	
							} else {
								//check the buy function if set
								if(typeof item.buy =="function") {
									can_buy = item.buy(scene,item,location);
								} else {
									can_buy = true;
								}
								if(can_buy) {
									if(typeof item.use == "function") item.use(scene,item,location);
									if(typeof item.image != "undefined") {
										if(typeof location.item_image_x !="undefined"&&typeof location.item_image_y!=="undefined") {
											scene.location_window.add(new Phaser.GameObjects.Image(scene,location.item_image_x,location.item_image_y,item.image).setOrigin(0,0));
										}
									}
									if(typeof item.message !="undefined") {
										scene.show_message({...speech,...{
											message: item.message
										}});
									}
								}
							}
						})				
						//add the hitbox to the location_window
						scene.location_window.add(hitbox)
						item_y+=item_spacing;
					}
				}
			}

			//now add buttons to the bottom of the screen
			var button_left = 144;
			var button_spacing = 3;
			scene.location_window.buttons = {}; //create an array for buttons

			//DONE button always exists, dismisses scene
			scene.location_window.buttons.done = scene.bottom_button("btn-done",button_left,function(scene) {
				if(typeof location.done == "function") {
					location.done(scene,location);
				} else {
					if(scene.player.time <= 0.5) scene.end_week(); //not enough time to go anywhere
					scene.hide_money();
					if(typeof location.on_close == "function") {
						location.on_close(scene);
					} 
					scene.location_window.destroy();
				}
			},location).setDepth(1000)
			scene.location_window.add(scene.location_window.buttons.done);
			button_left = scene.location_window.buttons.done.x;

			//WORK button exists if they work there
			if(scene.player.job.location==location.id) {
				var btn_work = scene.bottom_button("btn-work",button_left,function(scene) {
					if(scene.player.modal) return false;
					scene.work(location); //runs the work function
				}).setDepth(1000)
				btn_work.x = button_left - btn_work.width-button_spacing;
				scene.location_window.buttons.work = btn_work;
				scene.location_window.add(scene.location_window.buttons.work);
				button_left = btn_work.x;
			}

			//now add any custom buttons
			if(typeof location.buttons !="undefined") {
				if(typeof location.buttons == "function") {
					var buttons = location.buttons(scene,location);
				} else {
					var buttons = location.buttons;
				}
				for(var b in buttons) {
					var btn = buttons[b];
					if(typeof btn.name == "undefined") btn.name = "button_"+b;
					if(typeof btn.x == "undefined") btn.x = button_left;
					var btn_custom = scene.bottom_button(btn.image,btn.x,
						function(scene) {
							if(typeof btn.onclick == "function") {
								btn.onclick(scene,location);
							}
						}
					).setDepth(1000)
					btn_custom.x = button_left - btn_custom.width-button_spacing;
					scene.location_window.buttons[btn.name] = btn_custom;
					scene.location_window.add(scene.location_window.buttons[btn.name] );
					button_left = btn_custom.x;				
				}
			}
			
			//welcome message
			if(scene.settings.show_welcome) {
				if(!scene.player.visited.includes(location.id)) {
					scene.player.visited.push(location.id);
					if(typeof speech !="undefined") {
						if(typeof location.welcomes !="undefined") {
							var show_welcome = true;
							if(typeof location.show_welcome !="undefined") {
								if(typeof location.show_welcome == "function") {
									show_welcome = location.show_welcome(scene,location);
								} else {
									show_welcome = location.show_welcome;
								}
							}
							if(show_welcome) {
								if(typeof location.welcomes == "function") {
									var welcomes = location.welcomes(scene,location);
								} else {
									var welcomes = location.welcomes;
								}
								var msg = welcomes[Phaser.Math.Between(0,welcomes.length-1)];
								if(msg) {
									scene.show_message({...speech,...{
										message: msg,
									}});
								}
							}
						}
					}
				}
			}
		}