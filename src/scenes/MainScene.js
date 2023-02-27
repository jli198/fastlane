/*
 *	For our FastLane simulator, we have just one main scene that runs everything.
 *  It can look like a lot! The main thing to look at is create(), which sets
 *  everything up. After that, it is just a state machine that responds to things
 *  the player does. 
 * 
 *  The trickiest thing here is that the word "this" USUALLY refers to the scene
 *  itself, which is handy for setting globals, including functions. However if
 *  you are inside a subroutine, e.g. the code that gets called if something
 *  gets clicked on, then "this" usually refers to the object hosting the subroutine,
 *  and you need to use this.scene to access the scene object. For Tweens, the 
 *  scene is at this.parent.scene!
 * 
 */

//everything in this scene exists inside this class
export default class MainScene extends Phaser.Scene {
	//the scene constructor -- basically just tells phaser the name of the scene
	constructor () {
			super("MainScene");
	}

	//init runs first -- for very basic stuff
	init() {
		console.log('MainScene');

		//basic game info -- i.e., stuff that would be common to all players if multiplayer
		this.gamestate = {
			week: 1, //what week is it
			economy: 1, //multiplier that affects prices	
			turn_flags: {}, //flags that are wiped clean each turn -- works for all players if multiplayer
		}

		//some basic settings -- not every variable is represented here,
		//but these are ones that feel like they ought to be tweakable
		this.settings = {
			hours_per_week: 60, //hours per week -- note that this doesn't set initial hours
			speech_display: 3000, //how long a speech bubble is displayed before automatically closing itself -- set to 'false' to never have it triggered
			minimum_wage: 1, //wages for a given job can never go below this

			//things useful for debugging
			show_hitboxes: false, //debugging tool shows all hitboxes on locations
			show_welcome: false, //turns off welcome messages 
			open_start_location: false, //if true, the starting location will automatically be shown

			//subsystems you can easily turn on or off as desired
			check_won: true, //checks each week to see if they have met their goals
			check_rent: true, //checks if rent is due, etc.
			check_clothes: true, //checks if clothes are worn
			check_uniforms: true, //checks if clothes are appropriate for working
			check_food: true, //checks if ate, starvation, etc.

		}
	}

	//preload is run after init, before create
	preload() {

		//load the objects kept in external data files
		this.locations = require('./data/locations.js'); //load the object from locations.js
		this.player = require('./data/player.js'); //this is loaded from player.js
		this.weekends = require('./data/weekends.js'); //this is loaded from weekends.js

		//this is where the size of the game window is stored -- putting it somewhere convenient
		this.width = this.sys.game.scale.baseSize.width;
		this.height = this.sys.game.scale.baseSize.height;
	}

	//set up the scene elements
	create () {

		//create the board game background
		this.background = this.add.image(0, 0, 'board').setOrigin(0).setDepth(0);
		//this is debugging code to show pixel position if clicked -- useful for creating hitboxes
		/*.setInteractive()
		.on('pointerup',function(pointer) {
			console.log(Math.round(pointer.x),Math.round(pointer.y))
		})*/

		//create the background color rectangle
		this.background_color = this.add.rectangle(0,0,this.width,this.height,0xffffff).setOrigin(0,0).setDepth(-10);



		//create and initialize the timer at bottom of screen
		this.timer = this.add.graphics();
		this.update_clock();

		//this info sits on top of the timer
		this.clock_dots = this.add.image(159,173, "clock-dots");
		this.clock_rim = this.add.image(159,173,"clock-rim");
		this.week_no = this.add.bitmapText(this.width/2,179,"small","Week #"+String(this.gamestate.week).padStart(2," ")).setOrigin(0.5,0);
		this.week_no.setInteractive().on("pointerup",function() {
			//for debugging purposes, clicking on the week # will let you see the player stats
			//in the browser console
			console.log(this.scene.player);
		})

		//now we create hitboxes for each location, and set up the click events for them.
		//note that we only make hitboxes if there is at least an "x1" property,
		//so we can have "unclickable" areas that still cost time to travel through and don't look weird.
		for(var i in this.locations) {
			var loc = this.locations[i];
			if(typeof this.locations[i].x1 !="undefined") {
				this.locations[i].hitbox = this.add.rectangle(this.locations[i].x1,this.locations[i].y1,this.locations[i].x2-this.locations[i].x1,this.locations[i].y2-this.locations[i].y1,0,0).setOrigin(0)
					.setInteractive()
					.setData("id",this.locations[i].id) //this keeps track for each hitbox which location it corresponds to
					.on('pointerup',function(pointer) {
						if(this.scene.player.modal) return false; //this shows up a lot in click code -- "modal" means "ignore player clicks"
						var clicked_location = this.getData("id"); //look up the location they clicked on
						if(this.scene.player.location != clicked_location) { //if they are not there already
							this.scene.set_destination(clicked_location); //move to the location
						} else { //if they are clicking on the same place they are...
							if(this.scene.location_window) { //if they haven't left the screen at all, don't penalize them, just reload the screen
								this.scene.show_location(this.scene.player.location,false);
							} else { //otherwise, it takes time to go back into a location
								this.scene.show_location(this.scene.player.location);
							}
						}
					})
				//debugging function to show hitboxes; if enabled in settings, will draw a stroke around hitbox
				if((typeof this.locations[i].show_hitbox !="undefined")&&(this.locations[i].show_hitbox)||(this.settings.show_hitboxes==true)) {
					this.locations[i].hitbox.setStrokeStyle(1,0xff0000);
					this.locations[i].hitbox.setFillStyle(0xff0000,0.1);
				}
			}
		}
		
		//set up player graphic info
		//if this was multiplayer, we'd need to set up all player dots
		var loc = this.get_location(this.player.location);
		this.player_dot = this.add.image(loc.x,loc.y,this.player.icon);
		this.player_image = this.add.image(this.width/2,this.height/2,this.player.image).setDepth(1);
		this.background_color.setFillStyle(this.player.background_color);

		//if debug flag is set, launch the current location (don't penalize)
		if(this.settings.open_start_location) {
			this.show_location(this.player.location,false);
		}
	}

	//show the screen for a given location
	show_location(id,take_time = true) {
		require('./lib/show_location.js')(this,id,take_time);
	}

	//shows text inside of an image texture
	//will disappear on its own if settings.message_time is set, or if display_time is set in options. 
	//can process an array of choices 
	//if the parent object has a "mouth" property, will move a mouth texture a bit.
	show_message(options) {
		require('./lib/show_message.js')(this,options)
	}

	//code that processes the end of the week
	end_week() {
		console.log("END WEEK "+this.gamestate.week);
		//stop all animations
		if(this.player_dot_tween) this.player_dot_tween.stop()
		this.player.modal = false;

		//send them home if they aren't there
		if(this.player.location != this.player.home.location) {
			this.player.location = this.player.home.location;
			this.player.modal = true;
			this.player.travel_path = [];
			var loc = this.get_location(this.player.location);
			this.tweens.add({
				targets: this.player_dot,
				x: loc.x,
				y: loc.y,
				duration: 300,
				onCompleteParams: {scene: this},
				onComplete: function() {
					var scene = this.parent.scene; //get the scene object
					if(scene.player_walk_tween) {
						scene.player_walk_tween.stop();
						scene.player_walk_tween = undefined;
					}
					scene.start_week();
				}
			})
		} else {
			this.start_week();
		}
	}

	//code that starts a new week
	start_week() {
		console.log("START WEEK");
		//if this was multiplayer, would make sure other player had their turn
		this.player.time = this.settings.hours_per_week; //reset time
		this.update_clock();
		this.player.modal = true; 

		//check if they have won
		if(this.settings.check_won) {
			var wealth = (this.player.money+this.player.bank_money)/100; //should also be +investment values if implemented
			var happiness = this.player.happiness;
			var education = 1+(9*this.player.degrees.length);
			var career = 1.25 * this.player.dependability;

			if(
				((wealth>=this.player.goals.wealth) &&
				(happiness>=this.player.goals.happiness) &&
				(education>=this.player.goals.education) &&
				(career>=this.player.goals.career))
			) {
				this.you_won(); //trigger winning sequence
				this.settings.check_won = false; //never check again
				return false; //halt weekend processing
			}
		}

		//basic updates
		this.gamestate.week++; //advance week
		this.week_no.setText("Week #"+this.gamestate.week);
		this.player.visited = []; //reset each week
		if(this.player.relaxation>10) this.player.relaxation-=10;
		this.gamestate.economy+=Phaser.Math.FloatBetween(-0.02,0.02); //make the economy fluctuate at most 2% per week

		//"Oh What a Weekend" event	
		//if(this.location_window) this.location_window.destroy();
		this.location_window = this.add.container(183,112).setDepth(10);
		this.location_window.x = 68;
		this.location_window.y = 44;
		this.location_window.add(new Phaser.GameObjects.Image(this,0,0,"weekend").setOrigin(0));

		//process event tickets
		if(this.player.inventory.includes("Baseball Tickets")) {
			while(this.player.inventory.includes("Baseball Tickets")) {
				this.player.inventory.splice(this.player.inventory.indexOf("Baseball Tickets"),1);
			}
			var weekend = {
				"text": "You went to a baseball game. You had a really great time waiting in line for the bathroom after waiting in line for expensive hot dogs.",
				"cost": function() { return Phaser.Math.Between(15,55) }
			}
		} else if(this.player.inventory.includes("Theatre Tickets")) {
			while(this.player.inventory.includes("Theatre Tickets")) {
				this.player.inventory.splice(this.player.inventory.indexOf("Theatre Tickets"),1);
			}
			var weekend = {
				"text": "You went to a show. You had a really great time waiting in line for the bathroom at intermission.",
				"cost": function() { return Phaser.Math.Between(15,55) }
			}
		} else if(this.player.inventory.includes("Concert Tickets")) {
			while(this.player.inventory.includes("Concert Tickets")) {
				this.player.inventory.splice(this.player.inventory.indexOf("Concert Tickets"),1);
			}
			var weekend = {
				"text": "You went to a rock concert. You had a really great time waiting in line for the bathroom while developing tinnitus.",
				"cost": function() { return Phaser.Math.Between(15,55) }
			}
		} 

		//if we haven't set a weekend event, pick one at random
		if(typeof weekend == "undefined") {
			var weekend = this.weekends[Phaser.Math.Between(0,this.weekends.length-1)];
		}

		//process weekend
		this.location_window.add(new Phaser.GameObjects.BitmapText(this,180/2,35,"large",weekend.text,undefined,1).setMaxWidth(170).setOrigin(0.5,0));
		var weekend_cost = 0;
		if(typeof weekend.cost == "function") {
			weekend_cost = weekend.cost(this);
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
		this.location_window.add(new Phaser.GameObjects.BitmapText(this,180/2,97,"chunky",cost_text,undefined,1).setOrigin(0.5,0));
		this.player.money-=weekend_cost;

		//create an object to carry all of the weekend messages, so they aren't all released at once
		var message_queue = [];

		//check if rent is due
		if(this.settings.check_rent) {
			if(this.gamestate.week % 4 == 0) { //check if week is perfectly divisible by 4
				this.player.home.rent_paid = false;
				this.player.home.rent_extension = false;
				message_queue.push({
					image: "message_rent",
					message: "$"+this.player.home.rent,
					text_y: 68,	
					font: "chunky"
				})
			} else {
				if(this.player.turn_flags.rent_extension) {
					this.player.home.rent_extension = true;
				} else {
					this.player.home.rent_extension = false;
				}
				if(!this.player.home.rent_paid && !this.player.home.rent_extension) {
					this.player.home.rent_paid = true;
					this.player.home.rent_owed+=this.player.home.rent;
				} 
			}
		}

		//check if clothes are worn or changed
		if(this.settings.check_clothes) {
			if(this.player.clothes_wear>0) this.player.clothes_wear--;
			if(this.player.clothes_wear==1) { //last day
				//warning message
				message_queue.push({
					image: "message_clothes",
				})
			}
			if(this.player.clothes_wear==0) { //uh oh
				this.player.clothes = Object.keys(this.player.outfits)[0]; //set to least formal
				this.player.image = this.player.outfits[this.player.clothes];
				this.player_image.destroy();
				this.player_image = this.add.image(this.width/2,this.height/2,this.player.image).setDepth(1);
				this.player.clothes_wear = -1; //set it to -1 so it doesn't keep triggering
			}		
		}

		//check if the food has spoiled
		var spoiled = false;
		if(this.player.inventory.includes("Fresh Food")) {
			if(!this.player.inventory.includes("Refrigerator")) {
				while(this.player.inventory.includes("Fresh Food")) {
					this.player.inventory.splice(this.player.inventory.indexOf("Fresh Food"),1);
					this.player.happiness--;
				}
				message_queue.push({
					image: "message_all_spoiled",
				});
				spoiled = true;
			} else {
				var foods = 0;
				var capacity = 0;
				for(var i in this.player.inventory) {
					if(this.player.inventory[i]=="Fresh Food") foods++;
				}
				if(this.player.inventory.includes("Refrigerator")) capacity = 6;
				if(this.player.inventory.includes("Freezer")) capacity = 12;
				if(foods>capacity) {
					for(var i = 0; i<(foods-capacity); i++) {
						this.player.inventory.splice(this.player.inventory.indexOf("Fresh Food"),1);
						this.player.happiness--;
					}
					message_queue.push({
						image: "message_some_spoiled",
					});
					spoiled = true;
				}
			}
		}

		//check if they ate, and if not, if they have food in storage
		if(this.settings.check_food) {
			if(this.player.ate == false) {
				if(this.player.inventory.includes("Fresh Food")) {
					this.player.ate = true;
					this.player.starving = false;
					this.player.inventory.splice(this.player.inventory.indexOf("Fresh Food"),1);
				} else {
					//starving
					this.player.starving = true;
					this.subtract_time(20);
					this.player.happiness-=2;
					//warning message
					message_queue.push({
						image: "message_starvation",
					});
				}
			} else {
				//reset for new week
				this.player.ate = false;
				this.player.starving = false;
			}
		}

		//check if doctor visit 
		var doctor_visit = false;
		if(this.settings.check_doctor) {
			if(this.player.money>0) {
				if(this.player.relaxation == 10) {
					if(Phaser.Math.Between(0,100)<=20) doctor_visit = true;
				}
				if(this.player.starving) {
					if(Phaser.Math.Between(0,100)<=25) doctor_visit = true;
				}
				if(spoiled) {
					if(Phaser.Math.Between(0,100)<=50) doctor_visit = true;
				}
			}
		}
		if(doctor_visit) {
			this.subtract_time(10);
			this.player.happiness-=4;
			if(this.player.happiness<0) this.player.happiness = 0;
			//cost of doctor is random based on how much money the player has
			var doctor_cost = 0;
			if(this.player.money>=500) {
				doctor_cost = Phaser.Math.Between(30,200);
			} else if(this.player.money>=50) {
				doctor_cost = Phaser.Math.Between(30,50);
			} else if(this.player.money>=31) {
				doctor_cost = Phaser.Math.Between(30,this.player.money);
			} else {
				doctor_cost = this.player.money;
			} 
			this.player.money-=doctor_cost;
			message_queue.push({
				image: "message_doctor",
				message: "$"+doctor_cost,
				text_y: 64,
				font: "chunky"
			});
		}

		//make sure they haven't gone into the negative on any stats
		if(this.player.money<0) this.player.money = 0;
		if(this.player.happiness<0) this.player.happiness = 0;

		//display player money (not done in original game, but should be)
		this.show_money();

		//these turn_flags are reset each week
		this.player.turn_flags = {}; 
		this.gamestate.turn_flags = {}; //note that for multiplayer this would have to be called after all players had gone

		//create the DONE button 
		var button_left = 144;
		var btn_done = this.bottom_button("btn-done",button_left,function(scene) {
			scene.hide_money();
			if(scene.player.time <= 0) scene.end_week();
			scene.location_window.destroy();
		})
		this.location_window.add(btn_done);

		//show all messages in queue -- recursive
		if(message_queue.length) {
			var next_message = {
				display_time: 4000,
				fade_in: true,
				callback: function(scene) {
					message_queue.splice(0,1);
					if(message_queue.length) {
						scene.show_message({...next_message,...message_queue[0]})
					}
					scene.player.modal = false;
				}
			}
			this.show_message({...next_message,...message_queue[0]})
		} else {
			this.player.modal = false;
		}
	}

	//function to subtract some amount of time (hours) and update the clock
	subtract_time(hours) {
		console.log("subtract_time",hours);
		this.player.time-=hours;
		if(this.player.time<0) this.player.time = 0;
		this.update_clock();
	}
	
	//function to update the clock timer
	update_clock() {
		console.log("update_clock", this.player.time);
		var angle = ((this.settings.hours_per_week-this.player.time)/this.settings.hours_per_week)*360;
		this.timer.clear();
		this.timer.fillStyle(0xec1730,1);
		this.timer.slice(159,173,8.5,-90*deg2rad,(angle-90)*deg2rad);
		this.timer.fillPath();
	}

	//shows the calculator, updates the money display
	show_money() {
		this.hide_money();
		this.calculator = this.add.image(254,161,"calculator").setOrigin(0)
		this.update_money();
	}

	//removes the calculator
	hide_money() {
		if(typeof this.calculator != "undefined") {
			this.calculator.destroy();
			this.player_money.destroy();
		}
	}

	//function to update the money display
	update_money() {
		if(typeof this.player_money!="undefined") this.player_money.destroy();
		if(typeof this.calculator!="undefined") {
			this.player_money = this.add.bitmapText(this.calculator.x+21,this.calculator.y+2,'lcd',String(this.player.money).padStart(7," ")).setOrigin(0)
		}
	}

	//code that tells the game the player has set a new destination
	set_destination(id) {
		console.log("set_destination",id);

		if(this.location_window) this.location_window.destroy();
		this.hide_money();

		//calculate the route to target -- checks both directions, uses shortest
		var id1 = this.get_location_i(this.player.location);
		var id2 = this.get_location_i(id);
		var direction_1 = [];
		var xx = +id1;
		while(xx!=id2) {
			direction_1.push(xx);
			xx++;
			if(xx>=this.locations.length) xx=0;
		}
		direction_1.push(+id2);
		var direction_2 = [];
		var xx = +id1;
		while(xx!=id2) {
			direction_2.push(xx);
			xx--;
			if(xx<0) xx = this.locations.length-1;
		}
		direction_2.push(+id2);

		if(direction_1.length>direction_2.length) {
			var direction = direction_2;
		} else {
			var direction = direction_1;
		}	
		this.player.travel_path = direction.slice(1,direction.length); //remove first item (where they already are)

		//now start the actual movement animations
		this.move_to_next();
	}

	//moves the player to the next destination in their travel_path
	move_to_next() {
		//make sure player image is showing 
		this.player_image.setVisible(true);
		//if the image isn't walking, make it walk (just a crude flipping of X axis)
		if(!this.player_walk_tween) {
			this.player_walk_tween = this.tweens.add({
				targets: this.player_image,
				flipX: true,
				x: this.player_image.x,
				yoyo: true,
				duration: 150,
				repeat: -1
			})
		}
		//get the next location
		this.next_location = this.locations[this.player.travel_path[0]];

		//stop any existing movement of the dot
		if(this.player_dot_tween) {
			this.player_dot_tween.stop();
		}

		//start a movement tween (this is really crude -- a real game would have waypoints set
		this.player_dot_tween = this.tweens.add({
			targets: this.player_dot,
			x: this.next_location.x,
			y: this.next_location.y,
			duration: 350, 
			onComplete: function() {
				var scene = this.parent.scene; //get the scene object
				scene.subtract_time(0.5); //each square set to 30 minutes travel
				if(scene.player.time == 0) {
					scene.end_week();
				} else {					
					//set current location, remove from travel path
					scene.player.location = scene.next_location.id;
					scene.player.travel_path = scene.player.travel_path.slice(1,scene.player.travel_path.length);
					//if we've arrived, trigger arrival
					if(scene.player.travel_path.length == 0) {
						scene.next_location = false;
						scene.player_walk_tween.stop();
						scene.player_walk_tween = undefined;
						scene.show_location(scene.player.location);
					} else {
						//if we still have places to go, start moving again
						scene.move_to_next();
					}
				}
			}
		})			
	}			

	//gets the index of a location from its id
	get_location_i(id) {
		for(var i in this.locations) {
			if(this.locations[i].id==id) return i;
		}
		return false;
	}

	//gets the info about a location from its id
	get_location(id) {
		for(var i in this.locations) {
			if(this.locations[i].id==id) return this.locations[i];
		}
		return false;
	}
	
	//adds buttons to bottom
	bottom_button(img,x,onclick,location = undefined) {

		var y = 109;
		var btn = new Phaser.GameObjects.Image(this,x,y,img)
		.setOrigin(0)
		.setDepth(100)
		.setInteractive()
		.setData("beingclicked",false)
		.on("pointerdown",function(e) {
			if(this.scene.player.modal) return false;
			this.setX(this.getData("x")+1).setY(this.getData("y")+1);
			this.setData("beingclicked",true);
		})
		.on("pointerout",function(e) { 
			if(this.scene.player.modal) return false;
			if(this.getData("beingclicked")) {
				this.setX(this.getData("x")).setY(this.getData("y"));
			}
		})
		.on("pointerover",function(e) { 
			if(typeof this.getData("x") == "undefined") {
				this.setData("x",this.x);
				this.setData("y",this.y);
			}
			if(this.scene.player.modal) return false;
			if(e.buttons==1) {
				this.setData("beingclicked",true);
			} else {
				this.setData("beingclicked",false);
			}
			if(this.getData("beingclicked")) {
				this.setX(this.getData("x")+1).setY(this.getData("y")+1);
			} 
		})
		.on("pointerup",function(e) {
			if(this.scene.player.modal) return false;
			if(this.getData("beingclicked")) {
				this.setX(this.getData("x")).setY(this.getData("y"));
				this.setData("beingclicked",false);
				if(typeof onclick=="function") onclick(this.scene,location);
			} 
		})
		return btn;
	}

	//ridiculous screen shown on winning the game
	you_won = function() {
		require('./lib/winner.js')(this)
	}
}

/* misc. variables, functions, globals, etc. */
var deg2rad = (Math.PI / 180); //multiply radians by this to convert them to degrees