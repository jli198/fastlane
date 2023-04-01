
/* 
 * The Health Center is where to go if a player gets sick (Doctor’s Office) to be checked up. This will cost a fee.
 */
module.exports = {
	"id": "Health_Center",
	"name": "Health Center",
	"x":  49, "y": 181,
	"x1":  8, "y1": 156,
	"x2": 67, "y2": 193, 
  "image": "place_factory",
  "item_image_x": 0,
  "item_image_y": 57,
	"show_hitbox": false, 
	"jobs": [
		{
			"name": "Janitor",
			"wage": 7,
			"experience": 10,
			"dependability": 20,
			"degrees": [],
			"uniform": "casual"
		},
	],

  "item_color": 0x000100,
	"item_spacing": 15,
	"item_offset_y": 10,
  "item_offset_x": 57,
  "items": [
		{
			"name": "Doctor's Visit\n",
			"price": 75,
			"x": 97,
			"message": "Thank Lorde you have health insurance!",
			"use": function(scene,item) { 
				scene.player.happiness+=2;
			}
		},
	]
}