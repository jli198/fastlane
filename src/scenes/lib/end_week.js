
/*
 * Code that gets triggered whenever the game determines it is in the end of the week.
 * Basically just sends the player home, and then triggers start_week().
 * If this was multiplayer you might have something here to check if it is the next player's turn
 * and switch the player.
 */
module.exports = function(scene){
	console.log("END WEEK "+scene.gamestate.week);
	//stop the dot animation
	if(scene.player_dot_tween) scene.player_dot_tween.stop()
	scene.player.modal = false;

	//do we send them home?
	var sendHome = true;
	if(scene.player.location == scene.player.home.location) {
		//we need to check if its actually there; if it gets stuck
		//partially to a destination, it creates problems
		var loc = scene.get_location(scene.player.home.location);
		if(loc.x == scene.player_dot.x && loc.y == scene.player_dot.y) {
			sendHome = false;
		}
	}

	if(sendHome) {
		scene.player.location = scene.player.home.location;
		scene.player.modal = true;
		scene.player.travel_path = [];
		var loc = scene.get_location(scene.player.location);
		scene.tweens.add({
			targets: scene.player_dot,
			x: loc.x,
			y: loc.y,
			duration: 300,
			onCompleteParams: {scene: scene},
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
		//even if they are home, make sure they aren't walking
		if(scene.player_walk_tween) {
			scene.player_walk_tween.stop();
			scene.player_walk_tween = undefined;
		}
		scene.start_week();
	}
}