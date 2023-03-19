/*
 * Allows the selection of which players they are playing. 
 * Will need to also allow the setting of goals.
 * When done, runs scene.start_game(), which puts the first player on the board.
 */


module.exports = function(scene,max_players,current_player,already_selected = []){
	scene.player.modal = true;
	if(typeof current_player == "undefined") {
		scene.gamestate.players = [];
		current_player = 1;
	}
	if(scene.location_window) scene.location_window.destroy();
	scene.location_window = scene.add.container(68,44).setDepth(10); 
	scene.location_window.add(new Phaser.GameObjects.Image(scene,0,0,"select_character").setOrigin(0,0))
	scene.location_window.add(new Phaser.GameObjects.Image(scene,42,1,"corner_icon_player_small_"+current_player).setOrigin(0,0));
	var window_width = 178;
	var player_data = require("../data/players.js");
	var player_width = (window_width/player_data.length);
	var p_left = 1;
	scene.location_window.buttons = [];
	for(var i = 0; i<player_data.length; i++) {
		scene.location_window.add(new Phaser.GameObjects.Rectangle(scene,p_left,14,player_width,97,player_data[i].background_color).setOrigin(0,0));
		scene.location_window.add(new Phaser.GameObjects.Rectangle(scene,p_left+player_width,14,1,97,0x000000).setOrigin(0,0));
		var player_image = new Phaser.GameObjects.Image(scene,p_left+player_width/2,97/2+14,player_data[i].image);
		scene.center(player_image);
		scene.location_window.add(player_image);
		var player_icon = new Phaser.GameObjects.Image(scene,p_left+player_width-15,100,player_data[i].icon).setOrigin(0,0);
		scene.location_window.add(player_icon);
		if(!already_selected.includes(i)) {
			var btn_select = scene.bottom_button("btn-select",p_left+player_width/2,function(scene,data) {
				data.already_selected.push(data.selected);	
				//copy player data to players
				var new_player = require('../data/player.js');
				var player = {...new_player}; //this seems necessary to avoid editing a reference
				var player_data = [...require("../data/players.js")];
				//get basic template from player.js, specifics from players.js
				for(var z in Object.keys(player_data[data.selected])) {
					var key = Object.keys(player_data[data.selected])[z];
					var val = player_data[data.selected][key];
					if(typeof player[key]=="object") { //if we don't do this, it just makes a reference
						if(Array.isArray(val)) { //which breaks everything
							player[key] = [...val];
						} else {
							player[key] = {...val};
						}
					} else {
						player[key] = val;
					}
				}
				//ditto -- making sure all copies are deep copies
				for(var z in Object.keys(player)) {
					if(typeof player[Object.keys(player)[z]]=="object") {
						if(Array.isArray(player[Object.keys(player)[z]])) {
							player[Object.keys(player)[z]] = [...player[Object.keys(player)[z]]];
						} else {
							player[Object.keys(player)[z]] = {...player[Object.keys(player)[z]]};
						}
					}
				}

				scene.location_window.destroy();
				scene.location_window = scene.add.container(68,44).setDepth(10); 
				scene.location_window.add(new Phaser.GameObjects.Image(scene,0,0,"goals").setOrigin(0,0))
				scene.location_window.add(new Phaser.GameObjects.Image(scene,0,0,"corner_icon_player_"+(+data.current_player)).setOrigin(0,0));
				scene.location_window.add(new Phaser.GameObjects.Image(scene,158,0,"corner_icon_player_"+(+data.current_player)).setOrigin(0,0));
				
				//stars for each goal
				scene.location_window.stars = [];
				var star_x = [39,75,111,146];
				scene.location_window.goals = {"wealth":50,"happiness":50,"education":50,"career":50};
				for(var i = 0; i<Object.keys(scene.location_window.goals).length; i++) {
					var star = new Phaser.GameObjects.Image(scene,star_x[i],60,"goal_star")
						.setOrigin(0.5,0)
						.setInteractive()
						.setData("goal",Object.keys(scene.location_window.goals)[i]);
					scene.centerX(star);
					scene.location_window.add(star);
					scene.location_window.stars.push(star);
					scene.input.setDraggable(star);
				}
				scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
						var dy = (dragY-gameObject.y);
						//in the original, the stars only move by 10s
						//so we get the new y, round it to ten, then convert that
						//back to pixels for a new y
						gameObject.y += (dy);
						gameObject.y = Phaser.Math.Clamp(gameObject.y, 40, 80);
						var new_goal = Math.round(scene.lerp(77,10,39,100,gameObject.y));
						new_goal = Phaser.Math.RoundTo(new_goal,1);
						var new_y = scene.lerp(77,10,39,100,new_goal);
						gameObject.y = new_y; 

						scene.location_window.goals[gameObject.getData("goal")] = new_goal;
						var goal_points = 0
						for(var i in Object.keys(scene.location_window.goals)) {
							goal_points+=scene.location_window.goals[Object.keys(scene.location_window.goals)[i]];
						}	
						scene.location_window.points.setText("Goal Points = "+goal_points);
				})

				var points = new Phaser.GameObjects.BitmapText(scene,182/2,32,"chunky","Goal Points = 200");
				scene.center(points);
				scene.location_window.add(points);
				scene.location_window.points = points;
				var btn_play = scene.bottom_button("btn-play",137,function(scene,data) {
					//now need to push the goals to the player variable
					data.player.goals = scene.location_window.goals;
					scene.gamestate.players.push({...data.player}); //push to list of players
					scene.input.off("drag"); //turn off the drag listener
					if(data.current_player<data.max_players) {
						require('./select_players.js')(scene,data.max_players,data.current_player+1,data.already_selected)
					} else {
						//start game
						scene.player = scene.gamestate.players[scene.gamestate.current_player];
						scene.gamestate.new_game = false;
						scene.start_turn();
					}
					
				},{player:player,max_players:data.max_players,current_player:data.current_player,already_selected:data.already_selected},true)
				scene.location_window.add(btn_play);
				
				//select goals goes here!!!	
				

			},{"selected":i,"max_players":max_players,"current_player":current_player,"already_selected":already_selected},true)
			scene.centerX(btn_select);
			scene.location_window.add(btn_select);
			scene.location_window.buttons.push(btn_select);
		} else {
			player_image.setAlpha(0.2);
			player_icon.setAlpha(0.2);
		}

		p_left+=player_width+1;
	}
	
}