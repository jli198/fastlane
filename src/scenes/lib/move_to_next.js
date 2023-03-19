//moves the player to the next destination in their travel_path
module.exports = function(scene){

	//make sure player image is showing 
	scene.player_image.setVisible(true);
	//if the image isn't walking, make it walk (just a crude flipping of X axis)
	if(!scene.player_walk_tween) {
		scene.player_walk_tween = scene.tweens.add({
			targets: scene.player_image,
			flipX: true,
			x: scene.player_image.x,
			yoyo: true,
			duration: 150,
			repeat: -1
		})
	}
	//get the next location
	scene.next_location = scene.locations[scene.player.travel_path[0]];

	//stop any existing movement of the dot
	if(scene.player_dot_tween) {
		scene.player_dot_tween.stop();
	}

	//see if we actually need to move
	if(scene.player_dot.x==scene.next_location.x && scene.player_dot.y==scene.next_location.y) {
		scene.player.travel_path = [];
		scene.next_location = false;
		scene.player_walk_tween.stop();
		scene.player_walk_tween = undefined;
		scene.show_location(scene.player.location);
		return;
	}

	//start a movement tween (this is really crude -- a real game would have waypoints set
	scene.subtract_time(0.25); //each square set to 30 minutes travel -- 15 on arrival, 15 when starting
	scene.player_dot_tween = scene.tweens.add({
		targets: scene.player_dot,
		x: scene.next_location.x,
		y: scene.next_location.y,
		duration: 350/scene.settings.movement_speed, 
		onComplete: function() {
			var scene = this.parent.scene; //get the scene object
			scene.subtract_time(0.25); //each square set to 30 minutes travel -- 15 on arrival, 15 when starting
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