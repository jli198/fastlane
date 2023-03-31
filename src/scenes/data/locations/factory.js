
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
			"name": "Business Suit",
			"price": 295,
			"x": 73,
			"message": "Damn, it feels good to be an innovator!",
			"use": function(scene,item) { 
				scene.player.clothes = "business"; 
				scene.player.image = scene.player.outfits[scene.player.clothes];
				scene.player_image.destroy();
				scene.player_image = scene.add.image(scene.width/2,scene.height/2,scene.player.image).setDepth(1);
				scene.center(scene.player_image);
				scene.player.happiness+=2;
				scene.player.clothes_wear = 13;
			}
		},
		{
			"name": "Dress Clothes",
			"price": 125,
			"message": "You look like someone with some money and style!",
			"use": function(scene,item) { 
				scene.player.clothes = "dress";
				scene.player.image = scene.player.outfits[scene.player.clothes];
				scene.player_image.destroy();
				scene.player_image = scene.add.image(scene.width/2,scene.height/2,scene.player.image).setDepth(1);
				scene.center(scene.player_image);
				scene.player.happiness+=1;
				scene.player.clothes_wear = 13;
			}
		},
		{
			"name": "Casual Clothes",
			"price": 73,
			"message": "New clothes can't hurt!",
			"use": function(scene,item) { 
				scene.player.clothes = "casual"; 
				scene.player.image = scene.player.outfits[scene.player.clothes];
				scene.player_image.destroy();
				scene.player_image = scene.add.image(scene.width/2,scene.height/2,scene.player.image).setDepth(1);
				scene.center(scene.player_image);
				scene.player.clothes_wear = 11;
			}
		},
	]
}