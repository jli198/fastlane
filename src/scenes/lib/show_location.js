/*
 * The code that shows the screen for a given location. It is the code that processes all
 * location data.
 * The `id` argument is the location `id` (required!!!!)
 * The `take_time` argument is a boolean flag for whether we penalize the player for
 * visiting the screen. If they are visiting it from the map normally, they lose 
 * 2 hours of time. But there are many cases where we want to refresh the location
 * screen, so passing false to `take_time` will do so without taking any time.
 */
module.exports = function(scene,id,take_time = true) {
		console.log("show_location "+id);
		console.log(scene)


		if(take_time) scene.subtract_time(2); //entering a location always costs 2 hours

		//get location info
		var location = scene.get_location(id);
		
		if(scene.location_window) scene.location_window.destroy();

		//create the location image
		if(typeof location.image !="undefined") {
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

			if(typeof location.image=="function") {
				var location_image = location.image(scene,location);
			} else {
				var location_image = location.image;
			}
			scene.location_window.add(new Phaser.GameObjects.Image(scene,0,0,location_image).setOrigin(0));

			//add the mouth texture if one is specified
			if(typeof speech.mouth !="undefined") {
				scene.location_window.mouth = new Phaser.GameObjects.Image(scene,speech.mouth_x,speech.mouth_y,speech.mouth).setOrigin(0);
				scene.location_window.add(scene.location_window.mouth);
			}

			//player money display
			scene.show_money();

			//list of items
			if(location.items !="undefined") {
				var item_y = 28; //default y
				var item_x = 0;
				if(typeof location.item_offset_y !="undefined") item_y+=location.item_offset_y;
				if(typeof location.item_offset_x !="undefined") item_x+=location.item_offset_x;
				var item_width = (typeof location.item_width == "undefined")?106:location.item_width;
				
				if(typeof location.item_color!="undefined") { 
					var item_color = location.item_color;
				} else {
					var item_color = 0x000000;
				}
				if(typeof location.items=="function") {
					var items = location.items(scene,location);
				} else {
					var items = location.items;
				}
				var item_spacing = (typeof location.item_spacing == "undefined"?13:location.item_spacing);
				for(var i in items) {
					var item = items[i];
					if(typeof item.display=="undefined") item.display = true;
					if(typeof item.y!="undefined") item_y+= item.y;
					if(typeof item.x!="undefined") item_x = item.x;
					var show_item = true;
					if(typeof item.display=="function") {
						show_item = item.display(scene,item,location);
					} else {
						show_item = item.display;
					}
					if(show_item) {

						//TO DO: CONSOLIDATE THE OBJECT AND CLICKER SO THEY BOTH DO CHECKS, ARE CONSISTENT, ETC.
						//RIGHT NOW THE OBJECT CAN DO LESS THINGS THAN THE REGULAR ITEMS (E.G. CANNOT HAVE A 
						//MEANINGFUL PRICE CHECK.

						//if an arbitrary object is passed, use that instead of default text
						if(typeof item.object !="undefined") {
							var obj = item.object;
							obj.setX(item_x).setY(item_y)
							if(typeof item.clicker!="undefined") { //the clicker is what takes clicks
								item.clicker 
								.setData("item",item) //pass this item inside the function below								
								.setInteractive()
								.on("pointerup",function(e) {
									if(this.scene.player.modal) return false;
									var item = this.getData("item");
									var can_buy = true;
									if(typeof item.buy == "function") can_buy = item.buy(this.scene,item,location); 
									if(can_buy) {
										if(typeof item.use == "function") item.use(this.scene,item,location); 
									}
								})
							}
							scene.location_window.add(obj)
						} else {
							//otherwise assume it is text of some sort

							if(typeof item.price != "undefined") {
								//if it has a price, display a line of dots and the adjusted price
								var price = Math.round(item.price*scene.gamestate.economy);
								var item_text = new Phaser.GameObjects.BitmapText(scene, item_x,item_y,"small",item.name)
								var price_cost = new Phaser.GameObjects.BitmapText(scene, item_x,item_y,"small",String(" $"+price)).setVisible(false);
								var dot_width = item_width - (item_text.width + price_cost.width);
								price_cost.destroy();
								item_text.setText(item.name+String(".").repeat(dot_width/2)+" $"+price)
							} else {
								var item_text = new Phaser.GameObjects.BitmapText(scene, item_x,item_y,"small",item.name)
							}

							//add the text to the location_window
							scene.location_window.add(
								item_text
								.setTintFill(item_color)
								.setDropShadow(1,1,item_color,0.2)
								.setOrigin(item.align=="center"?0.5:0,0)
							)

							//add the clickable area to the location_window
							scene.location_window.add(
								new Phaser.GameObjects.Rectangle(scene,item_text.x,item_text.y+4,item_text.width,item_text.height-5)
								.setOrigin(item_text.originX,item_text.originY)
								.setData("item",item) //pass this item inside the function below
								.setInteractive()
								.on("pointerup",function(e) {
									if(this.scene.player.modal) return false;
									var item = this.getData("item");
									var can_buy = true;
									if(typeof item.price !="undefined") {
										var check_price = (typeof item.check_price == "undefined")?true:item.check_price;
										if(check_price) {
											if(this.scene.player.money <= item.price) {
												can_buy = false;
												this.scene.show_message({...speech,...{
													message: "You can't afford that right now.\n\n You only have $"+this.scene.player.money+".",
												}})
											} else {
												can_buy = true;
											}
										}
										//if they have set the buy function, check that
										if(can_buy && typeof item.buy =="function") {
											can_buy = item.buy(this.scene,item,location);
										}
										if(can_buy) {
											this.scene.player.money-=item.price;
											this.scene.player_money.setText(String(this.scene.player.money).padStart(7," "));
											if(typeof item.use == "function") item.use(this.scene,item,location); 
											if(typeof item.message !="undefined") {
												this.scene.show_message({...speech,...{
													message: item.message
												}})
											}
										}	
									} else {
										//check the buy function if set
										if(typeof item.buy =="function") {
											can_buy = item.buy(this.scene,item,location);
										} else {
											can_buy = true;
										}
										if(can_buy) {
											if(typeof item.use == "function") item.use(this.scene,item,location);
											if(typeof item.message !="undefined") {
												this.scene.show_message({...speech,...{
													message: item.message
												}});
											}
										}
									}
								})
							);
						}
						item_y+=item_spacing;
					}
				}
			}

			
			var button_left = 144;
			var button_spacing = 3;
			//DONE button
			var btn_done = scene.bottom_button("btn-done",button_left,function(scene) {
					if(scene.player.time <= 0.5) scene.end_week(); //not enough time to go anywhere
					scene.hide_money();
					scene.location_window.destroy();
			})
			scene.location_window.add(btn_done);
			button_left = btn_done.x;

			
			//WORK button
			if(scene.player.job.location==location.id) {
				var btn_work = scene.bottom_button("btn-work",button_left,function(scene) {
					if(scene.player.modal) return false;
					if(scene.settings.check_uniforms) {
						if(Object.keys(scene.player.outfits).indexOf(scene.player.clothes)<Object.keys(scene.player.outfits).indexOf(scene.player.job.uniform)) {
							scene.show_message({...speech,...{
								message: "You are not dressed appropriately for work."
							}});
							return;
						}
					}
					if(scene.player.time>0) {
						//basic work is 6 hours, which is 8X wage
						if(scene.player.time>=6) {
							var earned =scene.player.job.wage*8;
							scene.subtract_time(6);
						} else { //prorated pay
							var earned = Math.round(scene.player.job.wage*(scene.player.time*8/6))
							scene.subtract_time(scene.player.time);
						}
						//check for back rent
						if(scene.settings.check_rent) {
							if(scene.player.home.rent_owed) {
								var garnish = Math.round(earned/2);
								if(scene.player.home.rent_owed<garnish) {
									garnish = scene.player.home.rent_owed;
								}
								scene.player.home.rent_owed-=garnish;
								earned-=(garnish+2); //plus a service fee
								scene.show_message({...speech,...{
									message: "Your landlord garnished $"+garnish+" for owed rent."
								}});
							}
						}
						scene.player.money+=earned;
						scene.player.experience+=1;
						scene.player.dependability+=1;
						scene.player_money.setText(String(scene.player.money).padStart(7," "));
					} else {
						console.log("NO TIME");
						scene.show_message({...speech,...{
							message: "There is no more time to work."
						}});
					}
				})
				btn_work.x = button_left - btn_work.width-button_spacing;
				scene.location_window.add(btn_work);
				button_left = btn_work.x;				
			}

			//custom buttons
			if(typeof location.buttons !="undefined") {
				if(typeof location.buttons == "function") {
					var buttons = location.buttons(scene,location);
				} else {
					var buttons = location.buttons;
				}
				for(var b in buttons) {
					var btn = buttons[b];
					if(typeof btn.x == "undefined") btn.x = button_left;
					var btn_custom = scene.bottom_button(btn.image,btn.x,
						function(scene) {
							if(typeof btn.onclick == "function") {
								btn.onclick(scene,location);
							}
						}
					)
					btn_custom.x = button_left - btn_custom.width-button_spacing;
					scene.location_window.add(btn_custom);
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