
/* The discount store (Z-mart) is a shop, whose main unique quality is that it 
 * has a large inventory of potential items to sell each week, from which it 
 * select 6 the first time the player visited it. It then stores those objects
 * in scene.player.turn_flags.zmart_items, so that they are persistent for that week.
 * 
 * In the original game, certain objects could break and require a repair bill, and
 * the discount items were more likely to do this than ones bought from Socket City.
 * I didn't implement the repair system, so none of the items below are any different
 * than the Socket City ones except for their price. Obviously that could be changed if
 * one wanted to implement the other system.
*/
module.exports = {
	"id": "discount",
	"name": "S-Mart Discount",
	"x": 282, "y":  35,
	"x1":252, "y1":  9,
	"x2":312, "y2": 44,
	"image": "place_zmart",
	"item_image_x": 0,
	"item_image_y": 57,
	"speech": {
		"image": "speech_bubble_r_t",
		"image_x": 14,
		"image_y": 24,
		"text_x": 55,
		"text_y": 41,
		"mouth": "nariman_jaw",
		"mouth_x": 142,
		"mouth_y": 33,		
	},
	"welcomes": [
		"Welcome to S-Mart, where only the s-mart people s-hop!",
	],
	"item_color": 0x0f4a37,
	"item_spacing": 13,
	"item_offset_y": -2,
	"jobs": [
		{
			"name": "Clerk",
			"wage": 5,
			"experience": 10,
			"dependability": 10,
			"degrees": [],
			"uniform": "casual"
		}
	],
	"items": function(scene,location) {
		//this is the array of all possible items that could be sold each week.
		//note that these are standard item objects, more or less. 
		var z_items = [
			{
				"name": "Refrigerator",
				"price": 650,
				"message": "Hey, that's pretty cool!\n\n...Get it, man?",
				"buy": function(scene,item,location) { 
					if(scene.inventory_has_item(item.name)) {
						scene.show_message({...location.speech,...{
							message: "You already have one of these, you don't need two!"
						}});
						return false;
					} else if(scene.player.money>=item.price) {
						return true;
					} else {
						return false;
					}
				},
				"use": function(scene,item) { scene.inventory_add_item(item.name); }
			},				
			{
				"name": "Stove",
				"price": 490,
				"message": "Don't burn your house down, man!",
				"use": function(scene,item) { scene.inventory_add_item(item.name); }
			},
			{
				"name": "Color TV",
				"price": 349,
				"message": "Isn't it impressive that 'color' is an important adjective here, man?",
				"use": function(scene,item) { scene.inventory_add_item(item.name); }
			},
			{
				"name": "VCR",
				"price": 250,
				"message": "If I made a Betamax joke, would you even get it, man?",
				"use": function(scene,item) { scene.inventory_add_item(item.name); }
			},
			{
				"name": "Stereo",
				"price": 450,
				"message": "Featuring innovative cassette technology, man!",
				"use": function(scene,item) { scene.inventory_add_item(item.name); }
			},
			{
				"name": "Microwave",
				"price": 220,
				"message": "The cooking instrument of champions, man!",
				"use": function(scene,item) { scene.inventory_add_item(item.name); }
			},
			{
				"name": "Dress Clothes",
				"price": 90,
				"message": "You look like someone with some money and style, man!",
				"use": function(scene,item) { 
					scene.player.clothes = "dress";
					scene.player.image = scene.player.outfits[scene.player.clothes];
					scene.player_image.destroy();
					scene.player_image = scene.add.image(scene.width/2,scene.height/2,scene.player.image).setDepth(1);
					scene.player.happiness+=1;
					scene.player.clothes_wear = 13;
				}
			},
			{
				"name": "Casual Clothes",
				"price": 35,
				"message": "New clothes can't hurt, man!",
				"use": function(scene,item) { 
					scene.player.clothes = "casual"; 
					scene.player.image = scene.player.outfits[scene.player.clothes];
					scene.player_image.destroy();
					scene.player_image = scene.add.image(scene.width/2,scene.height/2,scene.player.image).setDepth(1);
					scene.player.clothes_wear = 11;
				}
			},
			{
				"name": "Concert Tickets",
				"price": 40,
				"message": "Enjoy the show, man!",
				"use": function(scene,item) {
					if(typeof scene.player.turn_flags.ticket_bought !="undefined") {
						scene.player.turn_flags.ticket_bought = true;
						scene.player.happiness+=2
					}
					scene.inventory_add_item(item.name);
				}
			},
			{
				"name": "Theatre Tickets",
				"price": 30,
				"message": "Enjoy the show, man!",
				"use": function(scene,item) {
					if(typeof scene.player.turn_flags.ticket_bought !="undefined") {
						scene.player.turn_flags.ticket_bought = true;
						scene.player.happiness+=2
					}
					scene.inventory_add_item(item.name);
				}
			},
			{
				"name": "Baseball Tickets",
				"price": 45,
				"message": "Enjoy the game, man!",
				"use": function(scene,item) {
					if(typeof scene.player.turn_flags.ticket_bought !="undefined") {
						scene.player.turn_flags.ticket_bought = true;
						scene.player.happiness+=2
					}
					scene.inventory_add_item(item.name);
				}
			},	
			{
				"name": "Dog Food",
				"price": 18,
				"message": "Didn't know you had a dog, man!",
				"use": function(scene,item) {
					scene.player.happiness-=1;
				}
			},	
			{
				"name": "8-Track Player",
				"price": 75,
				"message": "This was out of date even when the original game was made, man!",
				"use": function(scene,item) {
					scene.player.happiness-=1;
				}
			},	
			{
				"name": "Works of Capote",
				"price": 100,
				"message": "Sad that the game penalizes you for this, man! 'In Cold Blood' is a great book, man!",
				"use": function(scene,item) {
					scene.player.happiness-=2;
				}
			},	
		]

		//if we haven't created the item list for this week, create it
		if(typeof scene.player.turn_flags.zmart_items == "undefined") {
			//simple way to shuffle an array of items
			var shuffled = z_items
				.map(value => ({ value, sort: Math.random() }))
				.sort((a, b) => a.sort - b.sort)
				.map(({ value }) => value)
			//pick the first 6 and store them
			scene.player.turn_flags.zmart_items = [];
			for(var i = 0; i<6; i++) {
				//depending on the order, we set the x and y flags to make them
				//display in the right place
				if(i<2) {
					var z = {x: 6}
				} else if(i==2) {
					var z = {x: 74,y:2}
				} else {
					var z = {x: 74}
				}
				scene.player.turn_flags.zmart_items.push({...z,...shuffled[i]});
			}
		}
		return scene.player.turn_flags.zmart_items;
	}
}