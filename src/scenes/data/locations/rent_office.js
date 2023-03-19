
/* 
 * The rent office is where the player pays rent and can switch apartments.
 * The main trickiness of it is keeping track of when it should be open and dealing with 
 * requests for rent extensions. It is always open every 4th day of the month. But if a 
 * rent extension was grante the week before, it also is open. If the player owes back rent,
 * it also allows them to pay it off, if they have the money.
 */
module.exports = {
	"id": "rent_office",
	"name": "Rent Office",
	"x": 105, "y":  35,
	"x1": 68, "y1":  9,
	"x2":128, "y2": 44,
	"image": function(scene,location) {
		//check if this is a week where it ought to be open (every 4th week)
		//or if we have an active rent extension. note the use of the % (modulus) operator --
		//it turns the remainder of a division operation. so week % 4 returns 0 if the week is divisible by 4.
		if(scene.gamestate.week % 4 != 0 && !scene.player.home.rent_extension) {
			return "place_rent_closed"
		} else {
			return "place_rent"
		}
	},
	"item_image_x": 0,
	"item_image_y": 57,
	"speech": function(scene,location) {				
		if(scene.gamestate.week % 4 != 0 && !scene.player.home.rent_extension) {
			return false;
		} else {
			return location.speech_open;
		}
	},
	"speech_open": { //this has no intrinsic value, but can be used as alternative to location.speech below
		"image": "speech_bubble_r_t",
		"image_x": 7,
		"image_y": 22,
		"text_x": 55,
		"text_y": 41,
		"mouth": "nariman_jaw",
		"mouth_x": 142,
		"mouth_y": 33,
		"mouth_dx": 0,
		"mouth_dy": 1,
	},
	"welcomes": [
		"Thank goodness you don't have the option to buy a house in this game! I'd go bankrupt!",
	],
	"show_welcome": function(scene,location) { //whether we show the welcome depends on if it is open
		if(scene.gamestate.week % 4 != 0 && !scene.player.home.rent_extension) {
			return false;
		} else {
			return location.speech_open;
		}
	},
	"jobs": [
		{
			"name": "Groundskeeper",
			"wage": 7,
			"experience": 10,
			"dependability": 20,
			"degrees": [],
			"uniform": "casual"
		},
	],
	"item_color": 0x002912,
	"item_offset_x": 15,
	"item_offset_y": 27,
	"item_spacing": 10,
	"items": function(scene,location) {
		//if is closed, return empty
		if(scene.gamestate.week % 4 != 0 && !scene.player.home.rent_extension) {
			return [];
		}
		var items = [];
		items.push({
			"name": "Pay rent for 1 month.  $"+scene.player.home.rent,
			use: function(scene,item,location) {
				if(scene.player.home.rent_paid) {
					scene.show_message({...location.speech_open,...{
						message: "You are already paid up for this month. "
					}});
				} else {
					if(scene.player.money>=scene.player.home.rent) {
						scene.player.money-=scene.player.home.rent;
						scene.player.home.rent_paid = true;
						scene.update_money();
						scene.show_message({...location.speech_open,...{
							message: "We appreciate your business. And your money. Particularly, your money."
						}});
					}
				}
			}
		})
		items.push({
			name: "Ask for more time.",
			use: function(scene,item,location) {
				if(scene.player.home.rent_paid) {
					scene.show_message({...location.speech_open,...{
						message: "You are all paid up!"
					}});
				} else {
					//check first if they already asked for one this week
					if(typeof scene.player.turn_flags.rent_extension!="undefined") {
						if(scene.player.turn_flags.rent_extension) {
							scene.show_message({...location.speech_open,...{
								message: "You already have a rent extension this week."
							}});
						} else {
							scene.show_message({...location.speech_open,...{
								message: "Like I said, you have to pay this week."
							}});
						}
						return false;
					}
					//calculate chance they get an extension
					var approved = false; 
					switch(scene.player.home.rent_extensions) {
						case 0: approved = true; break; //100% on first ask
						case 1: if(Phaser.Math.Between(1,4)>1) approved = true; break; //75% on second
						case 2: if(Phaser.Math.Between(1,2)==1) approved = true; break; //50% on third
						default: 	if(Phaser.Math.Between(1,4)==1) approved = true; break; //25% on fourth and up
					}
					if(approved) {
						scene.player.home.rent_extensions++;
						scene.player.home.rent_extension = true;
						scene.player.turn_flags.rent_extension = true;
						scene.show_message({...location.speech_open,...{
							message: "Sure, you can pay next week."
						}});
					} else {
						scene.player.turn_flags.rent_extension = false;
						scene.show_message({...location.speech_open,...{
							message: "Sorry, you have to pay this week."
						}});
					}
				}
			}
		})
		items.push({
			"name": "Rent Low-Cost Apartment  $"+Math.round(325*scene.gamestate.economy),					
			"use": function(scene,item,location) {
				if(scene.player.home.location == "low_cost_housing") {
					scene.show_message({...location.speech_open,...{
						message: "You are already living there."
					}});
				} else {
					var price = Math.round(325*scene.gamestate.economy);
					scene.show_message({...location.speech_open,...{
						message: "To change apartments requires paying a month's rent ($"+price+"). OK?",
						text_y: 32,
						choices: [
							{ option:"Yes", 
							onclick: function(scene,location) {
								if(scene.player.money<price) {
									scene.show_message({...location.speech_open,...{
										message: "You don't have enough money to do this."
									}});
								} else {
									scene.player.money-=price;
									scene.update_money();
									scene.player.turn_flags.rent_paid = true;
									scene.player.home.location = "low_cost_housing";
									scene.player.home.rent = price;
									scene.show_location(location.id,false);
									scene.show_message({...location.speech_open,...{
										message: "Congratulations on your new place!",
									}});
								}
							},
						},
						{ option:"No" }
					],
					args: location
					}});
				}
			}
		})
		items.push({
			"name": "Rent Security Apartment  $"+Math.round(475*scene.gamestate.economy),
			"use": function(scene,item,location) {
				if(scene.player.home.location == "high_cost_housing") {
					scene.show_message({...location.speech_open,...{
						message: "You are already living there."
					}});
				} else {
					var price = Math.round(475*scene.gamestate.economy);
					scene.show_message({...location.speech_open,...{
						message: "To change apartments requires paying a month's rent ($"+price+"). OK?",
						text_y: 32,
						choices: [
							{ option:"Yes", 
							onclick: function(scene,location) {
								console.log(scene,location);
								if(scene.player.money<price) {
									scene.show_message({...location.speech_open,...{
										message: "You don't have enough money to do this."
									}});
								} else {
									scene.player.money-=price;
									scene.update_money();
									scene.player.turn_flags.rent_paid = true;
									scene.player.home.location = "high_cost_housing";
									scene.player.home.rent = price;
									scene.show_location(location.id,false);
									scene.show_message({...location.speech_open,...{
										message: "Congratulations on your new place!",
									}});
								}
							},
						},
						{ option:"No" }
					],
					args: location
					}});
				}
			}
		})
		if(scene.player.home.rent_owed) {
			items.push({
				"name": "Pay garnishment balance  $"+scene.player.home.rent_owed,
				"use": function(scene,item,location) {
					if(scene.player.money>=scene.player.home.rent_owed) {
						scene.player.home.rent_owed = 0;
						scene.player.money-=scene.player.home.rent_owed;
						scene.update_money();
						scene.show_location(location.id,false);
						scene.show_message({...location.speech_open,...{
							message: "Thanks for getting that settled."
						}});
					} else {
						scene.show_message({...location.speech_open,...{
							message: "Sorry, but you lack the funds to do this."
						}});
					}
				}
			})
		}
		return items;
	}
}