
/* 
 * The fast food restaurant (and only restaurant in the original game).
 * 
 * It is not that remarkable as a location, and as such is probably a good place to start when 
 * thinking about how the locations objects work. It has several possible welcome messages, 
 * and it has several possible jobs the player can have.
 *
 * When the player buys food, it sets various properties, like the "ate" flag and sometimes
 * the happiness flag. You could imagine having other flags, like health or something like that,
 * which might be affected if you ate a week's worth of french fries.
 * 
 */
module.exports = {
			"id": "fast_food",
			"name": "Nariman Burgers",
			"x": 288, "y":  75,
			"x1":252, "y1": 45,
			"x2":312, "y2": 82,
			"image": "place_burgers",
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
			"welcomes": [
				"Welcome to Nariman Burgers, where our burgers definitely seem like real burgers!",
				"Welcome to Nariman Burgers, Home of the Innovation Burger!",
				"Welcome to Nariman Burgers! We're inspired by burgers, powered by money!",
				"Welcome to Nariman Burgers! Please ignore the protesters out front! They hate freedom!",
			],
			"item_color": 0x652327,
			"item_hover": 0xb00036,
			"item_spacing": 13,
			"jobs": [
				{
					"name": "Cook",
					"wage": 5,
					"experience": 0,
					"dependability": 10,
					"degrees": [],
					"uniform": "casual"
				}
			],
			"items": [
				{
					"name": "Hamburgers",
					"image": "item_burger",
					"x": 5,
					"price": 79,
					"use": function(scene) {
						scene.player.ate = true;
					},
					"message": "It's technically edible! No refunds!"
				},
				{
					"name": "Cheeseburgers",
					"image": "item_cheeseburger",
					"price": 89,
					"use": function(scene) {
						scene.player.ate = true;
						scene.player.happiness+=1;
					},
					"message": "In Paris, they call it a Royale With Cheese!"
				},
				{
					"name": "100% Chicken",
					"image": "item_chicken",
					"price": 124,
					"x": 73,
					"use": function(scene,item) {
						scene.player.ate = true;
						scene.player.happiness+=2;
					},
					"message": "Scientifically indistinguishable from chicken!"
				},
				{
					"name": "Fries",
					"image": "item_fries",
					"price": 65,
					"use": function(scene,item) {
						scene.player.ate = true;
					},
					"message": "Ah, the bare minimum, our specialty!"
				},
				{
					"name": "Shakes",
					"image": "item_shake",
					"price": 102,
					"use": function(scene,item) {
						scene.player.happiness+=2;
					},
					"message": "Great for your health, I'm sure!"
				},
				{ 
					"name": "Degree",
					"price": 250000,
					"use": function(scene,item) {
						scene.player.happiness-=100;
					},
					"message": "You're either a cheater, or a fool!" //who would have $250,000? either someone who is changing their money in the code, or who played this way too much
				}
			]
		}