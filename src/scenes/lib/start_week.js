
/*
 * Code that gets triggered whenever a player starts a new week. This also means processing
 * the "weekend" events and messages.
 * 
 * BUG: not loading any windows unless player has been sent home. unclear why.
 * 
 */
module.exports = function(scene) {

	console.log("START WEEK");

	//check if they have won
	if(scene.settings.check_won) {
		var player_won = require('./check_won.js')(scene);
		if(player_won) {
			return false; //halts further weekend events... should also let other players keep playing? unclear
		}
	}

	//basic updates
	scene.week_no.setText("Week #"+scene.gamestate.week);
	scene.player.visited = []; //reset each week
	scene.player.time = scene.player.hours_per_week;
	scene.update_clock();

	if(scene.player.relaxation>10) scene.player.relaxation-=10;	
	if(scene.settings.do_economy) {
		scene.gamestate.economy+=Phaser.Math.FloatBetween(-0.02,0.02); //make the economy fluctuate at most 2% per week. this is not how it works in real game
	}

	//"Oh What a Weekend" event	
	if(scene.settings.do_weekend) {
		console.log("weekend");

		//process event tickets. might be nice to put these into weekends.js somehow?
		if(scene.inventory_has_item("Baseball Tickets")) {
			while(scene.inventory_has_item("Baseball Tickets")) {
				scene.inventory_remove_item("Baseball Tickets");
			}
			var weekend = {
				"text": "You went to a baseball game. You had a really great time waiting in line for the bathroom after waiting in line for expensive hot dogs.",
				"cost": function() { return Phaser.Math.Between(15,55) }
			}
		} else if(scene.inventory_has_item("Theatre Tickets")) {
			while(scene.inventory_has_item("Theatre Tickets")) {
				scene.inventory_remove_item("Theatre Tickets");
			}
			var weekend = {
				"text": "You went to a show. You had a really great time waiting in line for the bathroom at intermission.",
				"cost": function() { return Phaser.Math.Between(15,55) }
			}
		} else if(scene.inventory_has_item("Concert Tickets")) {
			while(scene.inventory_has_item("Concert Tickets")) {
				scene.inventory_remove_item("Concert Tickets");
			}
			var weekend = {
				"text": "You went to a rock concert. You had a really great time waiting in line for the bathroom while developing tinnitus.",
				"cost": function() { return Phaser.Math.Between(15,55) }
			}
		} 

		//if we haven't set a weekend event, pick one at random
		if(typeof weekend == "undefined") {
			var weekend = scene.weekends[Phaser.Math.Between(0,scene.weekends.length-1)];
		}		

		scene.location_window = scene.add.container(183,112).setDepth(10);
		scene.location_window.x = 68;
		scene.location_window.y = 44;
		scene.location_window.add(new Phaser.GameObjects.Image(scene,0,0,"weekend").setOrigin(0));	
		scene.location_window.add(new Phaser.GameObjects.BitmapText(scene,180/2,35,"large",weekend.text,undefined,1).setMaxWidth(170).setOrigin(0.5,0));
		var weekend_cost = 0;
		if(typeof weekend.cost == "function") {
			weekend_cost = weekend.cost(scene);
		} else {
			weekend_cost = weekend.cost;
		}
		if(weekend_cost>0) {
			var cost_text = "You spent $"+weekend_cost;
		} else if (weekend.cost<0) {
			var cost_text = "You got $"+(+weekend_cost*-1);
		} else {
			var cost_text = "";
		}
		scene.location_window.add(new Phaser.GameObjects.BitmapText(scene,180/2,97,"chunky",cost_text,undefined,1).setOrigin(0.5,0));
		scene.player.money-=weekend_cost;
		var button_left = 144;
		var btn_done = scene.bottom_button("btn-done",button_left,function(scene) {
			scene.hide_money();
			if(scene.player.time <= 0) scene.end_week();
			scene.location_window.destroy();
		})
		scene.location_window.add(btn_done);
	}

	//create an object to carry all of the weekend messages, so they aren't all released at once
	var message_queue = [];

	//check if rent is due
	if(scene.settings.check_rent) {
		if(scene.gamestate.week % 4 == 0) { //check if week is perfectly divisible by 4
			scene.player.home.rent_paid = false;
			scene.player.home.rent_extension = false;
			message_queue.push({
				image: "message_rent",
				message: "$"+scene.player.home.rent,
				text_y: 68,	
				font: "chunky"
			})
		} else {
			if(scene.player.turn_flags.rent_extension) {
				scene.player.home.rent_extension = true;
			} else {
				scene.player.home.rent_extension = false;
			}
			if(!scene.player.home.rent_paid && !scene.player.home.rent_extension) {
				scene.player.home.rent_paid = false;
				scene.player.home.rent_owed+=scene.player.home.rent;
			} 
		}
	}

	//check if clothes are worn or changed
	if(scene.settings.check_clothes) {
		if(scene.player.clothes_wear>0) scene.player.clothes_wear--;
		if(scene.player.clothes_wear==1) { //last day
			//warning message
			message_queue.push({
				image: "message_clothes",
			})
		}
		if(scene.player.clothes_wear==0) { //uh oh
			scene.player.clothes = Object.keys(scene.player.outfits)[0]; //set to least formal
			scene.player.image = scene.player.outfits[scene.player.clothes];
			scene.player_image.destroy();
			scene.player_image = scene.add.image(scene.width/2,scene.height/2,scene.player.image).setDepth(1);
			scene.center(scene.player_image);
			scene.player.clothes_wear = -1; //set it to -1 so it doesn't keep triggering
		}		
	}

	//check if the food has spoiled
	var spoiled = false;
	if(scene.inventory_has_item("Fresh Food")) {
		if(!scene.inventory_has_item("Refrigerator")) {
			while(scene.inventory_has_item("Fresh Food")) {
				scene.inventory_remove_item("Fresh Food");
				scene.player.happiness--;
			}
			message_queue.push({
				image: "message_all_spoiled",
			});
			spoiled = true;
		} else {
			var foods = 0;
			var capacity = 0;
			for(var i in scene.player.inventory) {
				if(scene.player.inventory[i]=="Fresh Food") foods++;
			}
			if(scene.inventory_has_item("Refrigerator")) capacity = 6;
			if(scene.inventory_has_item("Freezer")) capacity = 12;
			if(foods>capacity) {
				for(var i = 0; i<(foods-capacity); i++) {
					scene.inventory_remove_item("Fresh Food");
					scene.player.happiness--;
				}
				message_queue.push({
					image: "message_some_spoiled",
				});
				spoiled = true;
			}
		}
	}

	//check if they ate, and if not, if they have food in storage
	if(scene.settings.check_food) {
		if(scene.player.ate == false) {
			if(scene.inventory_has_item("Fresh Food")) {
				scene.player.ate = true;
				scene.player.starving = false;
				scene.inventory_remove_item("Fresh Food");
			} else {
				//starving
				scene.player.starving = true;
				scene.subtract_time(20);
				scene.player.happiness-=2;
				//warning message
				message_queue.push({
					image: "message_starvation",
				});
			}
		} else {
			//reset for new week
			scene.player.ate = false;
			scene.player.starving = false;
		}
	}

	//check if doctor visit 
	var doctor_visit = false;
	if(scene.settings.do_doctor) {
		if(scene.player.money>0) {
			if(scene.player.relaxation == 10) {
				if(Phaser.Math.Between(0,100)<=20) doctor_visit = true;
			}
			if(scene.player.starving) {
				if(Phaser.Math.Between(0,100)<=25) doctor_visit = true;
			}
			if(spoiled) {
				if(Phaser.Math.Between(0,100)<=50) doctor_visit = true;
			}
		}
	}
	if(doctor_visit) {
		scene.subtract_time(10);
		scene.player.happiness-=4;
		if(scene.player.happiness<0) scene.player.happiness = 0;
		//cost of doctor is random based on how much money the player has
		var doctor_cost = 0;
		if(scene.player.money>=500) {
			doctor_cost = Phaser.Math.Between(30,200);
		} else if(scene.player.money>=50) {
			doctor_cost = Phaser.Math.Between(30,50);
		} else if(scene.player.money>=31) {
			doctor_cost = Phaser.Math.Between(30,scene.player.money);
		} else {
			doctor_cost = scene.player.money;
		} 
		scene.player.money-=doctor_cost;
		message_queue.push({
			image: "message_doctor",
			message: "$"+doctor_cost,
			text_y: 64,
			font: "chunky"
		});
	}

	//make sure they haven't gone into the negative on any stats
	if(scene.player.money<0) scene.player.money = 0;
	if(scene.player.happiness<0) scene.player.happiness = 0;

	//display player money (not done in original game, but should be)
	scene.show_money();

	//show time
	scene.update_clock();

	//these turn_flags are reset each week
	scene.player.turn_flags = {}; 
	scene.gamestate.turn_flags = {}; //note that for multiplayer this would have to be called after all players had gone

	console.log(message_queue);
	//show all messages in queue -- recursive
	if(message_queue.length) {
		var next_message = {
			display_time: 4000,
			drop_in: true,
			fade_out: true,
			depth: -10,
			callback: function(scene) {
				message_queue.splice(0,1);
				if(message_queue.length) {
					scene.show_message({...next_message,...message_queue[0]})
				}
				scene.player.modal = false;
			}
		}
		scene.show_message({...next_message,...message_queue[0]})
	} else {
		scene.player.modal = false;
	}
}