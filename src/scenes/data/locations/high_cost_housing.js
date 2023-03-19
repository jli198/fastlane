
/* 
 * This is the high-cost housing option. It is very bare-bones. Like low_cost_housing,
 * its images and options vary depending on whether the player lives there. Otherwise
 * it does nothing special. In the original game, it would prevent the robbery mechanic
 * from stealing things, but since that mechanic is not implemented, it doesn't do that.
 * And in the original game, the appearance would change depending on if the player bought
 * certain items, but that isn't implemented either (yet). 
 */
module.exports = {
	"id": "high_cost_housing",
	"x": 29, "y": 45,
	"x1":  8, "y1":  9,
	"x2": 67, "y2": 44,
	"image": function(scene,location) { //this is one of the rare places where the image depends on the circumstances
		if(scene.player.home.location == location.id) {
			return "place_security";
		} else {
			return "place_security_unrented";
		}
	},
	"speech": { //a very simple speech bubble
		"image": "speech_bubble_small",
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
							scene.player.relaxion = 50;
						}
					} else {
						scene.show_message({
							"message": "No more time to relax."
						});
					}
				}
			}]
		}
	}
}