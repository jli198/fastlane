//Saves the game
module.exports = function(scene,confirm = true){
	var restored_gamestate = localStorage.getItem("fastlane_gamestate");
	var restored_player = localStorage.getItem("fastlane_player");
	if(restored_gamestate!=null || restored_player != null) {
		if(confirm) {
			scene.pause();
			scene.add.existing(new scene.modalMessage({
				"scene": scene,
				"text": "There can only be one saved game at a time. Overwrite existing?",
				"choices": [
					{
						"option": "Yes",
						"onclick": function(scene) {
							localStorage.setItem("fastlane_gamestate", JSON.stringify(scene.gamestate));
							localStorage.setItem("fastlane_player", JSON.stringify(scene.player));
							scene.add.existing(new scene.modalMessage({
								"scene": scene,
								"text": "The current game has been saved.",
								"callback": function(scene) {
									scene.resume();
								}
							}));
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
			scene.pause();
			localStorage.setItem("fastlane_gamestate", JSON.stringify(scene.gamestate));
			localStorage.setItem("fastlane_player", JSON.stringify(scene.player));
			scene.add.existing(new scene.modalMessage({
				"scene": scene,
				"text": "The current game has been saved.",
				"callback": function(scene) {
					scene.resume();
				}
			}))
		}
	} else {
		localStorage.setItem("fastlane_gamestate", JSON.stringify(scene.gamestate));
		localStorage.setItem("fastlane_player", JSON.stringify(scene.player));
	}
}
