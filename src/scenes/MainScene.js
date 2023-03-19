import ScrollText from './lib/ui/ScrollText.js'; //this is an external UI control (a textbox with a scrollbar)
import ScrollList from './lib/ui/ScrollList.js'; //this is an external UI control (a listbox with a scrollbar)
import TopMenu from './lib/ui/TopMenu.js'; //experimental UI control for top menu
import ModalMessage from './lib/ui/ModalMessage.js'; //UI control for displaying simple modal messages

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
		//some basic settings -- not every variable is represented here,
		//but these are ones that feel like they ought to be tweakable
		this.settings = {
			speech_display: 3000, //how long a speech bubble is displayed before automatically closing itself -- set to 'false' to never have it triggered
			minimum_wage: 1, //wages for a given job can never go below this

			//things useful for debugging
			show_hitboxes: false, //debugging tool shows all hitboxes on locations
			show_welcome: true, //turns on/off welcome messages at locations
			open_start_location: false, //if true, the starting location will automatically be shown
			movement_speed: 1, //multiplier for the movement speed of the dot. e.g. change to 2 or 3 or 10 to speed it up.
			auto_restore: false, //if true, instead of starting with a new game, it will automatically restore the saved game -- for debugging only!!!

			//subsystems you can easily turn on or off as desired
			check_won: true, //checks each week to see if they have met their goals
			check_rent: true, //checks if rent is due, etc.
			check_clothes: true, //checks if clothes are worn
			check_uniforms: true, //checks if clothes are appropriate for working
			check_food: true, //checks if ate, starvation, etc.
			do_economy: true, //whether economy changes
			do_weekend: true, //do we do random weekend events
			do_doctor: true, //do we do the doctor event

			version: "1.0", //version of this game engine
		}

		//basic game info -- i.e., stuff that would be common to all players if multiplayer
		this.gamestate = {
			new_game: false, //is this a new game or not (if so, will ask to select player, etc.)
			week: 1, //what week is it
			economy: 1, //multiplier that affects prices	
			turn_flags: {}, //flags that are wiped clean each turn -- works for all players if multiplayer
			stocks: [ //the different stocks and their base price info
				{"name": "T-BILLS", "base": 100,"min":100,"max": 100 },
				{"name": "GOLD",  "base": 413, "min": 206, "max": 1032 },
				{"name": "SILVER", "base": 14, "min": 7, "max": 35 },
				{"name": "PORK BELLIES", "base": 20, "min": 10, "max": 50 },
				{"name": "BLUE CHIP", "base": 49, "min": 24, "max": 122 },
				{"name": "PENNY STOCKS", "base": 7, "min": 3, "max": 17 }
			],
			current_player: 0, //current player 
			players: [], //holds player info
			version: this.settings.version, //version of game engine
		}
		this.new_gamestate = {...this.gamestate}; //save for restarting
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

		//create and initialize the clock timer at bottom of screen
		this.timer = this.add.graphics();
		this.update_clock();
		//this info sits on top of the timer -- dots for the clock, its rim, and the week #
		this.clock_dots = this.add.image(159,173, "clock-dots");//.setOrigin(0)
		//this.clock_dots.setX(this.clock_dots.x-Math.round(this.clock_dots.width/2));
		//this.clock_dots.setY(this.clock_dots.y-Math.round(this.clock_dots.height/2));
		this.center(this.clock_dots);

		this.clock_rim = this.add.image(159,173,"clock-rim");
		//this.clock_rim.setX(this.clock_rim.x-Math.round(this.clock_rim.width/2));
		//this.clock_rim.setY(this.clock_rim.y-Math.round(this.clock_rim.height/2));
		this.center(this.clock_rim);
		
		this.week_no = this.add.bitmapText(this.width/2,183,"small","Week #"+String(this.gamestate.week).padStart(2," ")).setOrigin(0);
		this.centerX(this.week_no);

		//clicking on the clock or the week # brings up the menu
		this.clock_rim.setInteractive().on("pointerup",function() {
			if(this.scene.player.modal) return false;
			this.scene.game_menu();
		})
		this.week_no.setInteractive().on("pointerup",function() {
			if(this.scene.player.modal) return false;
			this.scene.game_menu();
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
						this.scene.set_destination(clicked_location); //move to the location
						/*if(this.scene.player.location != clicked_location) { //if they are not there already
							this.scene.set_destination(clicked_location); //move to the location
						} else { //if they are clicking on the same place they are...
							if(this.scene.location_window) { //if they haven't left the screen at all, don't penalize them, just reload the screen
								this.scene.show_location(this.scene.player.location,false);
							} else { //otherwise, it takes time to go back into a location
								this.scene.show_location(this.scene.player.location);
							}
						}*/
					})
				//debugging function to show hitboxes; if enabled in settings, will draw a stroke around hitbox
				if((typeof this.locations[i].show_hitbox !="undefined")&&(this.locations[i].show_hitbox)||(this.settings.show_hitboxes==true)) {
					this.locations[i].hitbox.setStrokeStyle(1,0xff0000);
					this.locations[i].hitbox.setFillStyle(0xff0000,0.1);
				}
			}
		}

		//create top menu
		if(typeof this.menu == "undefined") {
			var menu_config = require('./lib/top_menu.js')(this);
			this.menu = new TopMenu(this,menu_config);
		}

		if(this.settings.auto_restore) {
			require("./lib/restore_game.js")(this,false);
		}

		if(this.gamestate.new_game) {
			require('./lib/new_game.js')(this);
			return;
		} else {
			this.gamestate.players = [{...this.player}]
		}

		//starts the game
		if(!this.settings.auto_restore) {
			this.start_turn();
		}

		//if debug flag is set, launch the current location (don't penalize the player with the normal time penalty)
		if(this.settings.open_start_location) {
			this.show_location(this.player.location,false);
		}

	}

	start_turn(restore = false) {
		//basic turn setup
		if(this.location_window) this.location_window.destroy();
		this.week_no.setVisible(true);
		var loc = this.get_location(this.player.location);
		if(this.player_dot) this.player_dot.destroy();
		if(this.player_image) this.player_image.destroy();
		if(typeof this.player_numbers != "undefined") {
			if(this.player_numbers.length>0) {
				for(var i in this.player_numbers) {
					this.player_numbers[i].destroy(0);
				}
			}
		}
		this.player_numbers = [];
		this.player_numbers.push(this.add.image(68,44,"corner_icon_player_"+(this.gamestate.current_player+1)).setOrigin(0,0).setDepth(-5));
		this.player_numbers.push(this.add.image(68,132,"corner_icon_player_"+(this.gamestate.current_player+1)).setOrigin(0,0).setDepth(-5));
		this.player_numbers.push(this.add.image(226,44,"corner_icon_player_"+(this.gamestate.current_player+1)).setOrigin(0,0).setDepth(-5));
		this.player_numbers.push(this.add.image(226,132,"corner_icon_player_"+(this.gamestate.current_player+1)).setOrigin(0,0).setDepth(-5));
		this.player_dot = this.add.image(loc.x,loc.y,this.player.icon);
		this.player_image = this.add.image(this.width/2,this.height/2,this.player.image).setDepth(1);
		this.center(this.player_image);
		this.background_color.setFillStyle(this.player.background_color);
		this.player.modal = false;
		this.update_clock();
		if(!restore) {
			if(this.gamestate.week>1) this.start_week();
		}
	}

	//show the screen for a given location
	show_location(id,take_time = true,location_object) {
		require('./lib/show_location.js')(this,id,take_time,location_object);
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
			require('./lib/end_week.js')(this)
	}

	//code that starts a new week
	start_week() {
		require('./lib/start_week.js')(this)
	}

	//function to subtract some amount of time (hours) and update the clock
	subtract_time(hours) {
		//console.log("subtract_time",hours);
		this.player.time-=hours;
		if(this.player.time<0) this.player.time = 0;
		this.update_clock();
	}

	//function that is run whenever they click the 'work' button
	work(location) {
		require('./lib/work.js')(this,location)
	}

	//function to update the clock timer appearance
	update_clock() {
		//console.log("update_clock", this.player.time);
		var angle = ((this.player.hours_per_week-this.player.time)/this.player.hours_per_week)*360;
		this.timer.clear();
		this.timer.fillStyle(0xec1730,1);
		this.timer.slice(159,173,8.5,-90*Phaser.Math.DEG_TO_RAD,(angle-90)*Phaser.Math.DEG_TO_RAD);
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
			this.player_money = this.add.bitmapText(this.calculator.x+21,this.calculator.y+5,'lcd',String(this.player.money).padStart(7," ")).setOrigin(0)
		}
	}

	//code that tells the game the player has set a new destination
	set_destination(id) {
		require('./lib/set_destination.js')(this,id)
	}
		
	//moves player to the next destination on their path
	move_to_next() {
		require('./lib/move_to_next.js')(this)
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
	
	//adds buttons to bottom of location_window
	bottom_button(img,x,onclick,location,ignore_modal) {
		return require('./lib/bottom_button.js')(this,img,x,onclick,location,ignore_modal)
	}

	//a game menu -- uses same framework as the location system
	game_menu = function() {
		require('./lib/game_menu.js')(this)
	}

	//show the screen for a given location
	player_score(player) {
		return require('./lib/player_score.js')(this,player);
	}
	
	//ridiculous screen shown on winning the game
	you_won = function() {
		require('./lib/winner.js')(this)
	}

	//checks a player's inventory -- right now this is very simple,
	//but in the future, if we want a more complicated inventory system,
	//this will make it a lot easier to adapt.
	inventory_has_item(item,player) {
		var player = (typeof player=="undefined")?this.player:player;
		if(player.inventory.includes(item)) {
			return true;
		} else {
			return false;
		}
	}
	
	//removes an item from the player inventory
	inventory_remove_item(item,player) {
		var player = (typeof player=="undefined")?this.player:player;
		player.inventory.splice(player.inventory.indexOf(item),1);
	}

	//adds an item to the player inventory
	inventory_add_item(item, player) {
		var player = (typeof player=="undefined")?this.player:player;
		player.inventory.push(item);
	}

	//Phaser can run in two modes -- WebGL and Canvas.
	//There are some advanced graphics functions here that
	//work differently in one or the other, so this is a useful function.
	//You should not need to use this.
	supportsWebGL = function() {
		if(typeof this.renderer.currentContext!=="undefined") {
			return false;
		} else {
			return true;
		}
	}

	//pauses all tweens
	//note that this won't stop new tweens from being created and run
	pause = function() {
		console.log("pause");
		var tweens = this.tweens.getAllTweens();
		for(var i in tweens) {
			tweens[i].pause();
		}
	}
	//resumes paused tweens
	resume = function() {
		console.log("resume");
		var tweens = this.tweens.getAllTweens();
		for(var i in tweens) {
			tweens[i].resume();
		}
	}

	//these centering functions ought to eliminate blurring in Canvas mode
	center = function(obj,width,height) {
		this.centerX(obj,width);
		this.centerY(obj,height);
	}
	
	centerX = function(obj,width) {
		var w = typeof width=="undefined"?obj.width:width;
		obj.setOrigin(0,obj.displayOriginY);
		obj.setX(obj.x-Math.round(w)/2);
	}

	centerY = function(obj,height) {
		var h = typeof height=="undefined"?obj.height:height;
		obj.setOrigin(obj.displayOriginX,0);
		obj.setY(obj.y-Math.round(h)/2);
	}

	/* These exports these custom UI elements as part of the scene object. */
	scrollText = ScrollText;
	scrollList = ScrollList; 
	modalMessage = ModalMessage;

	//simple linear interpolation; returns x3 
	lerp = function(x1,y1,x2,y2,y3) {
		return ((y2-y3) * x1 + (y3-y1) * x2)/(y2-y1);
	}
	

}
