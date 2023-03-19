
/* 
 * The appliance store sells appliances.
 * These get added to scene.player.inventory. The only complicated part is
 * that for some of them (like the Refrigerator and Freezer), it refuses to allow
 * the player to buy more than one. To do this, it uses the buy() function, which is
 * run BEFORE the player is allowed to buy something. If it returns `false`, then the
 * transaction does not go through. If it returns `true`, then the transaction does.
 * The buy() function does not override the default price checking behavior unless
 * the item has `check_price` set to false.
*/
module.exports = {
	"id": "appliances",
	"name": "Student City Appliance",
	"x": 276, "y": 183,
	"x1":252, "y1": 156,
	"x2":312, "y2": 193,
	"image": "place_appliances",
	"item_image_x": 0,
	"item_image_y": 0,
	"speech": {
		"image": "speech_bubble_r_b",
		"image_x": 9,
		"image_y": 24,
		"text_x": 55,
		"text_y": 41,
		"mouth_x": 142,
		"mouth_y": 90,
		"mouth": "nariman_jaw"
	},
	"jobs": [
		{
			"name": "Salesperson",
			"wage": 7,
			"experience": 30,
			"dependability": 30,
			"degrees": [],
			"uniform": "dress"
		}
	],
	"welcomes": [
		"Welcome to Student City! Time to spend!",
	],
	"item_color": 0x144b64,
	"item_offset_y": -3,
	"item_spacing": 9,
	"items": [
		{
			"name": "Refrigerator",
			"price": 876,
			"x": 73,
			"pawnable": true,
			"message": "Hey, that's pretty cool!\n\n...Get it?",
			"buy": function(scene,item,location) { 
				if(scene.inventory_has_item(item.name)) {
					scene.show_message({...location.speech,...{
						message: "You already have one of these, you don't need two!"
					}});
					return false;
				} else {
					return true;
				} 
			},
			"use": function(scene,item) { scene.inventory_add_item(item.name); }
		},				
		{
			"name": "Freezer",
			"price": 513,
			"pawnable": true,
			"message": "Hey, that's REALLY cool!\n\n...Uh, get it?",
			"buy": function(scene,item,location) { 
				if(scene.inventory_has_item(item.name)) {
					scene.show_message({...location.speech,...{
						message: "You already have one of these, you don't need two!"
					}});
					return false;
				} else {
					return true;
				} 
			},
			"use": function(scene,item) { scene.inventory_add_item(item.name); }
		},
		{
			"name": "Stove",
			"price": 513,
			"pawnable": true,
			"message": "Don't burn your house down!",
			"use": function(scene,item) { scene.inventory_add_item(item.name); }
		},
		{
			"name": "Color TV",
			"price": 513,
			"x": 5,
			"y": 1,
			"pawnable": true,
			"message": "Isn't it impressive that 'color' is an important adjective here?",
			"use": function(scene,item) { scene.inventory_add_item(item.name); }
		},
		{
			"name": "VCR",
			"price": 333,
			"pawnable": true,
			"message": "If I made a Betamax joke, would you even get it?",
			"use": function(scene,item) { scene.inventory_add_item(item.name); }
		},
		{
			"name": "Stereo",
			"price": 412,
			"pawnable": true,
			"message": "Featuring innovative cassette technology!",
			"use": function(scene,item) { scene.inventory_add_item(item.name); }
		},
		{
			"name": "Microwave",
			"price": 330,
			"pawnable": true,
			"message": "The cooking instrument of champions!",
			"use": function(scene,item) { scene.inventory_add_item(item.name); }
		},
		{
			"name": "Hot Tub",
			"price": 1255,
			"pawnable": true,
			"message": "Are you sure your lease will allow this?",
			"use": function(scene,item) { scene.inventory_add_item(item.name); }
		},
		{
			"name": "Computer",
			"price": 1599,
			"pawnable": true,
			"message": "Someday you'll be able to surf the Internet, I imagine!",
			"use": function(scene,item) { scene.inventory_add_item(item.name); }
		},
	]
}