
/* 
 * The market is a store. Nothing too special here except some quirks to how Fresh Food works:
 * 		- You get a happiness bonus the first time you buy Fresh Food per week only (so it tracks
 * 			this in scene.player.turn_flags)
 *    - If you buy X weeks of food, it just adds X Fresh Food items to your inventory at once.
 * Neither the Lottery Tickets or Newspaper systems are implemented.
 */
module.exports = 
{
	"id": "market",
	"name": "Duck's Market",
	"x":  45, "y": 105,
	"x1": 8, "y1": 83,
	"x2": 67, "y2": 119,
	"image": "place_market",
	"item_image_x": 0,
	"item_image_y": 57,
	"speech": {
		"image": "speech_bubble_r_t",
		"image_x": 9,
		"image_y": 22,
		"text_x": 55,
		"text_y": 41,
		"mouth": "nariman_jaw",
		"mouth_x": 142,
		"mouth_y": 33,		
	},
	"welcomes": [
		"I hope you enjoy self-checkout!",
		"I hope you didn't forget to bring your own bags!",
	],
	"jobs": [
		{
			"name": "Janitor",
			"wage": 6,
			"experience": 10,
			"dependability": 10,
			"degrees": [],
			"uniform": "casual"
		},
	],
	"item_color": 0x454a60,
	"item_offset_y": -2,
	"item_spacing": 15,
	"items": [
		{
			"name": "Food for 1 Week",
			"x": 5,
			"price": 55,
			"use": function(scene,location) { 
				scene.player.inventory.push("Fresh Food");
				if(typeof scene.player.turn_flags.fresh_food == "undefined") {
					scene.player.happiness+=1;
					scene.player.turn_flags.fresh_food = true;
				} 
			},
			"message": "Better than fries!"
		},
		{
			"name": "Food for 2 Weeks",
			"price": 100,
			"use": function(scene,location) { 
				//Fresh Food x 2
				scene.player.inventory.push("Fresh Food");
				scene.player.inventory.push("Fresh Food");
				if(typeof scene.player.turn_flags.fresh_food == "undefined") {
					scene.player.happiness+=2; 
					scene.player.turn_flags.fresh_food = true;
				} 
			},
			"message": "Better than two orders of fries!"
		},
		{
			"name": "Food for 4 Weeks",
			"price": 190,
			"x": 73,
			"y": 4,
			"use": function(scene,location) { 
				//Fresh Food x 4
				scene.player.inventory.push("Fresh Food");
				scene.player.inventory.push("Fresh Food");
				scene.player.inventory.push("Fresh Food");
				scene.player.inventory.push("Fresh Food");
				if(typeof scene.player.turn_flags.fresh_food == "undefined") {
					scene.player.happiness+=4; 
					scene.player.turn_flags.fresh_food = true;
				} 
			},
			"message": "Can I interest you in buying in bulk?"
		},
		{
			"name": "10 Lottery Tickets",
			"price": 10,
			"use": function(scene,location) { 
				scene.player.inventory.push("Lottery Tickets");
				scene.player.happiness+=2; 
			},
			"message": "These are even less likely to win than in real life!"
		},
		{
			"x": 73,
			"name": "Newspaper",
			"price": 1,
			"buy": function(scene,item,location) {
				if(scene.player.time>=1) {
					return true;
				} else {
					scene.show_message({...location.speech,...{
						message: "Sorry, we're closing now."
					}});
					return false;
				}
			},
			"use": function(scene,location) {
				scene.subtract_time(1);
				//just a silly example of how this could work
				var headlines = [
					"THERE'S NO NEWS,\nAND THAT'S GOOD NEWS!",
					"MAN BITES DOG!",
					"PROFESSOR SPENDS ALL HIS TIME MAKING GAME!",
				]
				var headline = headlines[Phaser.Math.Between(0,headlines.length-1)];
				scene.show_message({
					message: headline,
					font: "large",
					text_width: 170,
					text_y: 42,
					text_x: 90,
					image: "message_newspaper",
					image_x: 0,
					image_y: 0,
				});
			}
		},
	]
}