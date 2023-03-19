/* 

low_cost_housing is a place the player can live.

Slightly tricky things:
	- Its functionality is totally tied to whether the player lives there or not (if 
		scene.player.home.location is set to its id). This includes:
			- Its image
			- Its speech characteristics
			- Its buttons (RELAX)
	- So the image, speech, and buttons properties are all functions. The items property is also
		a function because it sets up a silly little easter egg (the poster talks in some circumstances).

*/
module.exports = {
	"id": "low_cost_housing", 
	"x": 144, "y":  35,
	"x1":131, "y1":  9,
	"x2":190, "y2": 44,
	"image": function(scene,location) { //this is one of the rare places where the image depends on the circumstances
		if(scene.player.home.location == location.id) {
			return "place_low_cost_apt";
		} else {
			return "place_low_cost_apt_unrented";
		}
	},
	"speech": function(scene,location ) { //because the image doesn't always have a face, we need to make the speech settings contingent on circumstances
		if(scene.player.home.location == location.id) {
			return location.speech_open
		} else {
			return false;
		}
	},
	"speech_open": { //this has no intrinsic value, but can be used as alternative to location.speech
		"image": "speech_bubble_r_t",
		"image_x": 19,
		"image_y": 45,
		"text_x": 55,
		"text_y": 41,
		"mouth": "nariman_jaw_2",
		"mouth_x": 158,
		"mouth_y": 57,
		"mouth_dx": 0,
	},
	"items": function(scene,location) {
		//very dumb easter egg
		var hitbox = new Phaser.GameObjects.Rectangle(scene,162,53,24,28)
			.setInteractive()
			.on("pointerup",function() {
				if(Phaser.Math.Between(0,30)==30) {
					scene.show_message({...location.speech_open,...{
						message: "You should like, try to relax, man.",
						fade_in: true,
						fade_delay: 800,
						font: "chunky",
						close_by_clicking: false,
					}});
				}
			})
		scene.location_window.add(hitbox);
		return []; //no actual items for this screen -- we are just using this to set up the hitbox
	},
	"buttons": function(scene,location) {
		//only make relax button if we live here
		if(scene.player.home.location == location.id) {
			return [
			{	//RELAX button
				"image": "btn-relax",
				"onclick": function(scene,location) {
					if(scene.player.time>0) {
						scene.subtract_time(6);
						if(typeof scene.player.turn_flags.relaxed == "undefined") {
							scene.player.happiness+=2;
							scene.player.turn_flags.relaxed = true;	
						}
						scene.player.relaxation+=3;
						if(scene.player.relaxation>=50) {
							//a very silly "Easter Egg"
							scene.player.relaxion = 50;
								scene.show_message({...location.speech_open,...{
									message: "You are pretty cooked, my man.",
									fade_in: true,
									fade_delay: 800,
									font: "chunky",
									close_by_clicking: false,
								}});
						}
					} else {
						//example of using a simple non-prepackaged speech bubble
						scene.show_message({
							"image": "speech_bubble_small",
							"message": "No more time to relax."
						});
					}
				}
			}]
		}
	}
}