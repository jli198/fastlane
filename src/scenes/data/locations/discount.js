
/* 
 * Ackme is a store. Nothing too special here except some quirks to how Fresh Food works:
 * 		- You get a happiness bonus the first time you buy Fresh Food per week only (so it tracks
 * 			this in scene.player.turn_flags)
 *    - If you buy X weeks of food, it just adds X Fresh Food items to your inventory at once.
 * he Lottery Tickets or Newspaper systems are implemented.
 */
module.exports = {
	"id": "ACK_ME",
	"name": "ACK ME",
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
		"Welcome to ACK ME, where only smart people shop!",
    "You know I have to eat too?!",
	],
	"item_color": 0x0f4a37,
	"item_spacing": 13,
	"item_offset_y": -2,
	"jobs": [
		{
			"name": "Clerk",
			"wage": 16,
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
        "name": "Food for 1 Week",
        "x": 5,
        "price": 210,
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
        "price": 420,
        "use": function(scene,location) { 
          //Fresh Food x 2
          scene.player.inventory.push("Fresh Food");
          scene.player.inventory.push("Fresh Food");
          if(typeof scene.player.turn_flags.fresh_food == "undefined") {
            scene.player.happiness+=2; 
            scene.player.turn_flags.fresh_food = true;
          } 
        },
        "message": "At least you won't starve Les Mis style."
      },
      {
        "name": "Food for 4 Weeks",
        "price": 840,
        "x": 73,
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
        "message": "I recommend you get struck by lightning!"
      },
      {
        "name": "Newspaper",
        "price": 2,
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
            "STEFANS RANKED WORSE IN STATE!",
            "SHIZAMWIE BOMBS AT BOX OFFICE!",
            "PROFESSOR BUILDS A NUCLEAR REACTOR!",
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