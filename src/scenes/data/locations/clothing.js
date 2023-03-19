
/* 
 * The clothing store sells clothes, and is a place the player can work.
 * 
 * The only tricky thing here is that the player's outfit needs to be changed,
 * which also changes the image that is used for the player in the game. So you can
 * see below that it does this by destroying the existing player image and then
 * creating it anew. 
 * 
 */
module.exports = {
	"id": "clothing",
	"name": "ROI Clothing",
	"x": 277, "y": 115,
	"x1":252, "y1": 83,
	"x2":312, "y2": 119,
	"image": "place_clothing",
	"item_image_x": 0,
	"item_image_y": 57,
	"speech": {
		"image": "speech_bubble_r_t",
		"image_x": 14,
		"image_y": 26,
		"text_x": 55,
		"text_y": 41,
		"mouth": "nariman_jaw",
		"mouth_x": 142,
		"mouth_y": 33,
	},
	"jobs": [
		{
			"name": "Salesperson",
			"wage": 8,
			"experience": 30,
			"dependability": 30,
			"degrees": [],
			"uniform": "dress"
		}
	],
	"welcomes": [
		"Welcome to ROI Clothing, where you'll look like a million bucks!",
	],
	"item_color": 0x000100,
	"item_spacing": 15,
	"item_offset_y": 30,
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