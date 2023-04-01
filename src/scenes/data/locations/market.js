
/* 
 * The discount store (Z-mart) is a shop, whose main unique quality is that it 
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
module.exports = 
{
	"id": "Washington_Street",
	"name": "Washington Street",
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
		"I'm just here to admire our new towers!",
		"I enjoy Hoboken too!",
	],
	"jobs": [
		{
			"name": "Janitor",
			"wage": 14,
			"experience": 10,
			"dependability": 10,
			"degrees": [],
			"uniform": "casual"
		},
    {
      "name": "Barista",
      "wage": 18,
      "experience": 15,
      "dependability": 15,
      "degrees": [],
      "uniform": "causal"
    },
    {
      "name": "Retail Associate",
      "wage": 20,
      "experience": 15,
      "dependability": 15,
      "degrees": [],
      "uniform": "causal"
    },
	],
	"item_color": 0x454a60,
	"item_spacing": 13,
  "item_offset_y": -2,
	"items": [
		{
      "name": "Concert Tickets",
      "x": 5,
      "y": 0,
      "price": 95,
      "message": "Hey, this was cheaper than Ticketmaster!",
      "use": function(scene,item) {
        if(typeof scene.player.turn_flags.ticket_bought !="undefined") {
          scene.player.turn_flags.ticket_bought = true;
          scene.player.happiness+=2
        }
        scene.inventory_add_item(item.name);
      }
    },
    {
      "name": "Broadway Tickets",
      "price": 105,
      "message": "You better not be seeing Hamilton.",
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
      "x": 73,
      "price": 70,
      "message": "Of all sports, why did you choose baseball?",
      "use": function(scene,item) {
        if(typeof scene.player.turn_flags.ticket_bought !="undefined") {
          scene.player.turn_flags.ticket_bought = true;
          scene.player.happiness+=2
        }
        scene.inventory_add_item(item.name);
      }
    },	
    {
      "name": "Knick Knacks",
      "price": 7,
      "message": "Why would you even buy that?",
      "use": function(scene,item) {
        scene.player.happiness-=1;
      }
    },	
    {
      "name": "Drinks at the Pubs",
      "price": 30,
      "message": "I'll join you at that one!",
      "use": function(scene,item) {
        scene.player.happiness+=2;
      }
    },	
    {
      "name": "Chique Clothes",
      "price": 90,
      "message": "Classic Hoboken attire.",
      "use": function(scene,item) {
        scene.player.clothes = "casual"; 
				scene.player.image = scene.player.outfits[scene.player.clothes];
				scene.player_image.destroy();
				scene.player_image = scene.add.image(scene.width/2,scene.height/2,scene.player.image).setDepth(1);
				scene.center(scene.player_image);
				scene.player.clothes_wear = 11;
        scene.player.happiness+=2;
      }
    },
	]
}