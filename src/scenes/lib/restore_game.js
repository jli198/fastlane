
// Restores the saved game
module.exports = function(scene,confirm = true) {
	console.log("RESTORE GAME");
	var restored_gamestate = localStorage.getItem("fastlane_gamestate");
	var restored_player = localStorage.getItem("fastlane_player");
	if(restored_gamestate==null || restored_player == null) {
		scene.pause();
		scene.add.existing(new scene.modalMessage({
			"scene": scene,
			"text": "No saved game to restore.",
			"callback": function(scene) {
				scene.resume();
			}
		}))
	} else {
		if(confirm) {

			scene.pause();
			scene.add.existing(new scene.modalMessage({
				"scene": scene,
				"text": "Restore saved game? This will overwrite settings of current game.",
				"choices": [
					{
						"option": "Yes",
						"onclick": function(scene) {
							scene.resume();
							var restored_gamestate = localStorage.getItem("fastlane_gamestate");
							var restored_player = localStorage.getItem("fastlane_player");
							try {
								var new_gamestate = JSON.parse(restored_gamestate);
								var new_player = JSON.parse(restored_player);
							} catch (err) {
								scene.add.existing(new scene.modalMessage({
									"scene": scene,
									"text": "There was an error parsing the game state.",
									"callback": function(scene) {
										scene.resume();
									}
								}))
								return;
							}
							scene.gamestate = new_gamestate;
							scene.player = new_player;
							scene.start_turn(true);
						}
					},
					{
						"option": "No",
						"onclick": function(scene) {
							scene.resume();
						}
					}
				]
			}))
		} else {
			var restored_gamestate = localStorage.getItem("fastlane_gamestate");
			var restored_player = localStorage.getItem("fastlane_player");
			try {
				var new_gamestate = JSON.parse(restored_gamestate);
				var new_player = JSON.parse(restored_player);
			} catch (err) {
				scene.pause();
				scene.add.existing(new scene.modalMessage({
					"scene": scene,
					"text": "There was an error parsing the saved game.",
					"callback": function(scene) {
						scene.resume();
					}
				}))
				return;
			}
			scene.gamestate = new_gamestate;
			scene.player = new_player;
			var loc = scene.get_location(scene.player.location);
			if(scene.player_dot) scene.player_dot.destroy();
			scene.player_dot = scene.add.image(loc.x,loc.y,scene.player.icon);
			if(scene.player_image) scene.player_image.destroy();
			scene.player_image = scene.add.image(scene.width/2,scene.height/2,scene.player.image).setDepth(1);
			scene.background_color.setFillStyle(scene.player.background_color);
			scene.update_clock();
			scene.update_money();
			scene.week_no.setText("Week #"+scene.gamestate.week);
			scene.player.modal = false;
			if(scene.location_window) scene.location_window.destroy();
		}
	}
}
