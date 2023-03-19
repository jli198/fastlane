
/* 
 * Pawn Shop is where you can pawn items, redeem pawned items, buy
 * items that have spent too much time in pawn.
 * Mostly interesting because it uses a listbox control. Also uses a lot of 
 * sublocations (each screen is a unique, dynamic sublocation -- which is a
 * smarter approach than trying to cover up the window with a rectangle, etc.).
 * 
*/
module.exports = {
	"id": "pawn_shop",
	"x": 221, "y":  35,
	"x1":192, "y1":  9,
	"x2":250, "y2": 44,
	"image": "place_pawn_shop",
	"speech": {
		"image": "speech_bubble_l_t",
		"image_x": 50,
		"image_y": 24,
		"text_x": 71,
		"text_y": 41,
	},
	"item_offset_y": 5,
	"item_font": "chunky",
	"item_color": 0x181818,
	"items_x": 125,
	"item_spacing": 20,
	"items": function(scene,location) {
		var items = [];
		//first thing is to check all items in pawn to see if they are now for sale
		if((typeof scene.gamestate.pawn_inventory != "undefined")&&(scene.gamestate.pawn_inventory.length>0)) {
			var new_inv = [];
			for(var i in scene.gamestate.pawn_inventory) {
				var item = scene.gamestate.pawn_inventory[i];
				var weeks = scene.gamestate.week - item.week;
				console.log(item,weeks);
				if(weeks>=3) {
					if(typeof scene.gamestate.pawn_forsale == "undefined") scene.gamestate.pawn_forsale = [];
					scene.gamestate.pawn_forsale.push(item);
				} else {
					new_inv.push(item);
				}
			}
			scene.gamestate.pawn_inventory = new_inv;
		}

		items.push({
			"align": "center",
			"name": "Pawn items",
			"use":function(scene,item,location) {
				if(scene.player.inventory.length==0) {
					scene.show_message({...location.speech,...{
						message: "You don't have anything to pawn."
					}})
					return false;
				}
				if(typeof scene.gamestate.pawn_inventory == "undefined") scene.gamestate.pawn_inventory = [];
				if(scene.gamestate.pawn_inventory.length>=6) {
					scene.show_message({...location.speech,...{
						message: "Sorry, I've got all the items I can store for now."
					}})	
					return false;
				}
				//create a new location window
				scene.show_location("",false,{
					speech: location.speech,
					image: location.image,
					"item_offset_y": 5,
					"item_color": 0x181818,
					"items_x": 75,
					"item_spacing": 12,
					"items": function(scene,location) {
						var txt = new Phaser.GameObjects.BitmapText(scene,125,25,"small","Pawnable Items",undefined,1).setTintFill(0x284a39).setDropShadow(1,1,0x000000,0.1).setOrigin(0.5,0);
						scene.centerX(txt);
						scene.location_window.add(txt);

						//to populate the list of pawnable items, we need to get the
						//item list from the appliance store. note that right now
						//there is no distinction between appliance and discount items
						//with the same name. 
						var appliances = require("./appliances.js").items;
						var pawnable = [];
						for(var i in appliances) {
							if(appliances[i].pawnable) pawnable.push(appliances[i].name);
						}
						var list = [];
						for(var i in scene.player.inventory) {
							if(pawnable.includes(scene.player.inventory[i])) {
								list.push(scene.player.inventory[i]);
							}
						}

						scene.location_window.scrollList = new scene.scrollList({
							scene: scene,
							x: 71.5,
							y: 34,
							items: list,
							width: 107.5,
							height: 68,
							parent: scene.location_window
						})
						scene.location_window.add(scene.location_window.scrollList);

						return [];
					},
					//override normal done function behavior (returns to main pawn shop screen)
					done: function(scene,location) {
						scene.show_location("pawn_shop",false);
					},
					//add pawn button
					buttons: [
						{
							"image": "btn-pawn",
							"onclick": function(scene,location) {
								var sel_item = scene.location_window.scrollList.selectedItem();
								if(sel_item===false) return false;
								
								//check if we have one of these already
								for(var i in scene.gamestate.pawn_inventory) {
									var item = scene.gamestate.pawn_inventory[i];
									if(item.name==sel_item.text) {
										scene.show_message({...location.speech,...{
											message: "Sorry, I've already got one of those."
										}})	
										return false;
									}
								}
								//get price
								var appliances = require("./appliances.js").items;
								var price = false;
								for(var i in appliances) {
									if(appliances[i].name==sel_item.text) {
										price = appliances[i].price;
									}
								}
								if(price===false) return false;
								var offer = Math.round(price*scene.gamestate.economy*0.40);
								scene.show_message({...location.speech,...{
									message: "I'll give you $"+offer+" for your "+sel_item.text+".\nHow about it?",
									text_y: 32,
									choices: [
										{
											"option": "Yes",
											"onclick": function(scene,data) {
												//give player money and move item into pawn_inventory
												scene.player.money+=offer;
												scene.update_money();
												scene.inventory_remove_item(data.item);
												scene.gamestate.pawn_inventory.push({name:data.item,week:scene.gamestate.week,player:scene.gamestate.current_player,price:price});
												scene.location_window.scrollList.removeItem(data.i);
										}	
									},
										{"option": "No"}
									]
								},
								args: {item:sel_item.text,offer:offer,i:sel_item.val,price:price}
								})	
							}	
						}
					]
				})		
			}
		})
		items.push({
			"align": "center",
			"name": "Redeem items",
			"use":function(scene,item,location) {
				if((typeof scene.gamestate.pawn_inventory == "undefined")||(scene.gamestate.pawn_inventory.length==0)) {
					scene.show_message({...location.speech,...{
						message: "No redeemable items."
					}})
				} else {
					var redeemables = [];
					for(var i in scene.gamestate.pawn_inventory) {
						if(scene.gamestate.pawn_inventory[i].player==scene.gamestate.current_player) {
							redeemables.push({i:i,"item":scene.gamestate.pawn_inventory[i]})
						}
					}
					if(redeemables.length==0) {
						scene.show_message({...location.speech,...{
							message: "No redeemable items."
						}})	
						return false;
					}
					//create a sublocation
					scene.show_location("",false,{
						speech: location.speech,
						image: location.image,
						"item_offset_y": 5,
						"item_color": 0x181818,
						"items_x": 72,
						"item_spacing": 12,
						"items": function(scene,location) {
							var txt = new Phaser.GameObjects.BitmapText(scene,125,25,"small","Redeemable Items",undefined,1).setTintFill(0x284a39).setDropShadow(1,1,0x000000,0.1).setOrigin(0.5,0);
							scene.centerX(txt);
							scene.location_window.add(txt);
							var items = [];
							for(var i in redeemables) {
								var price = Math.round(redeemables[i].item.price/2);
								items.push({
									name: redeemables[i].item.name,
									use_economy: false,
									price: price,
									"buy": function(scene,item) {
										if(item.name=="Refrigerator") {
											if(scene.inventory_has_item("Refrigerator")) {
												scene.show_message({...location.speech,...{
													message: "You already have one of these, you don't need two!"
												}});
												return false;								
											}
										}
										if(item.name=="Freezer") {
											if(scene.inventory_has_item("Freezer")) {
												scene.show_message({...location.speech,...{
													message: "You already have one of these, you don't need two!"
												}});
												return false;								
											}
										}
										return true;
									},
									"use": function(scene,item,location) {
										scene.inventory_add_item(item.name);
										var new_inv = [];
										for(var i in scene.gamestate.pawn_inventory) {
											var p = scene.gamestate.pawn_inventory[i];
											console.log(p);
											if(!(p.name==item.name && p.player==scene.gamestate.current_player)) {
												new_inv.push(p);
											}
										}
										scene.gamestate.pawn_inventory = new_inv;
										scene.show_message({...location.speech,...{
											message: "What was once yours, is now yours... again!",
											callback: function(scene) {
												//return to main screen
												scene.show_location("pawn_shop",false);
											},
										}});
									}
								})
							}
							return items;
						},
						done: function(scene,location) {
							//override normal done button behavior
							scene.show_location("pawn_shop",false);
						}
					})				
				}
			}
		})
		items.push({
			"align": "center",
			"name": "Buy items",
			"use":function(scene,item,location) {
				if(typeof scene.gamestate.pawn_forsale=="undefined"||scene.gamestate.pawn_forsale.length==0) {
					scene.show_message({...location.speech,...{
						message: "No pawned items for sale."
					}})
				} else {
					//create a sublocation
					scene.show_location("",false,{
						speech: location.speech,
						image: location.image,
						"item_offset_y": 5,
						"item_color": 0x181818,
						"items_x": 72,
						"item_spacing": 12,
						"items": function(scene,location) {
							var item_count = 0;
							var txt = new Phaser.GameObjects.BitmapText(scene,125,25,"small","Buy Unclaimed Items",undefined,1).setTintFill(0x284a39).setDropShadow(1,1,0x000000,0.1).setOrigin(0.5,0);
							scene.centerX(txt);
							scene.location_window.add(txt);
							var items = [];
							for(var i in scene.gamestate.pawn_forsale) {
								if(item_count<6) {
									item_count++;
									var forsale = scene.gamestate.pawn_forsale[i];
									var price = Math.round(forsale.price/2);
									items.push({
										name: forsale.name,
										use_economy: true,
										price: price,
										buy: function(scene,item) {
											console.log(item);
											if(item.name=="Refrigerator") {
												if(scene.inventory_has_item("Refrigerator")) {
													scene.show_message({...location.speech,...{
														message: "You already have one of these, you don't need two!"
													}});
													return false;								
												}
											}
											if(item.name=="Freezer") {
												if(scene.inventory_has_item("Freezer")) {
													scene.show_message({...location.speech,...{
														message: "You already have one of these, you don't need two!"
													}});
													return false;								
												}
											}
											return true;
										},
										use: function(scene,item,location) {
											scene.inventory_add_item(item.name);
											var new_inv = [];
											for(var i in scene.gamestate.pawn_forsale) {
												if(item.name != scene.gamestate.pawn_forsale[i].name) {
													new_inv.push(scene.gamestate.pawn_forsale[i]);
												}
											}
											scene.gamestate.pawn_forsale = new_inv;
											scene.show_message({...location.speech,...{
												message: "One man's trash is another man's, uh... "+item.name+"?",
												callback: function(scene) {
													//return to main screen
													scene.show_location("pawn_shop",false);
												},
											}})
										}
									})
								}
							}
							return items;
						},
						done: function(scene,location) {
							//override normal done button behavior
							scene.show_location("pawn_shop",false);
						}
					})
				}
			}
		})
		return items;
	}
}