
/* This is an array of objects, each of which represents a location on the board.
 * This assumes that every location on the board is directly adjacent (to the right of)
 * the location listed before it (in a perfect loop). To keep the code from getting crazy,
 * the data for each of the locations is kept in an external file. Note that the ORDER of 
 * locations matters -- it is how the game knows how to move the pieces around the board.
 *
 * `id` is a short, unique key (never seen by player) that keeps track of each 
 * location. 
 * `x` and `y` are where the player icon goes when it goes to the location (e.g., the door, or a waypoint for places without doors)
 * `x1`, `y1`, `x2`, `y2` describe a box that is used to determine if the player clicks on the 
 *   location (the hitbox). If the location has no hitbox, it is assumed it cannot
 *   be entered by the player clicking on it (but still takes time for the player to
 *   pass through, an "empty square").
 *  	NOTE: If you want to visualize the hitbox, add `show_hitbox: true` and it will draw a line around it.
 * `image` is the image texture of the location's unique menu. If omitted, it won't try to
 *   have the location be something you can interact with.
 * `speech` is an object that controls how speech bubbles are displays. It contains 
 *  the following properties:
 * 		`image`: the image texture name of the speech bubble
 * 		`image_x`: the x position of the speech bubble image (upper left, relative to location image)
 * 		`image_y`: the y position of the speech bubble image (upper left, relative to location image)
 * 		`text_x`: the x position for the text object in the bubble (center, relative to speech bubble image)
 * 		`text_y`: the y position for the text object in the bubble (center, relative to speech bubble image)
 * 		`mouth`: an optional texture name for a moving mouth/jaw that goes over the location image
 * 		`mouth_x`: the x position for the mouth texture (upper left, relative to location image)
 * 		`mouth_y`: the y position for the mouth texture (upper left, relative to location image)
 * `welcomes` -- an array of possible strings that will greet the player when they enter a location the first time
 * 		in a given week. one will be chosen at random from the pack and spoken by the icon using the speech settings.
 * 		can also be a function that generates an array (will be passed the scene and location objects).
 * `show_welcome` -- an optional flag that determines whether a welcome message will be shown at this place. can be a simple
 * 		boolean true/false, but can also be a function (to which the scene and location objects are passed), allowing for
 *    dynamic determinations of whether a welcome should be shown.
 * `items` -- an array of item objects, which represent the things that can be clicked on at a location 
 * 			(other than the buttons at the bottom). note that this field can be a function that returns an array of item objects, too!
 * 			each item object can have the following properties. note that all functions are passed the scene, the item object, and the location object.
 * 				`name`: the name of the item. by default, this is what is displayed in a location.
 * 				`price`: the price of an item. optional. if an item has a price, it will be by default listed, and 
 * 							an attempt to interact with the item will by default have a price check.
 * 				`buy`: an optional function that will be run to see if the player can buy an item. note that
 * 							if this is included, a price check will NOT be run (so include one here if you care about price).
 * 							this is so you can do things like limit the player to a single instance of an item, for example.
 * 				`display`: an optional boolean that will determine if an item is displayed. can be a function.
 * 				`use`: the function that is run when an item is used or bought. optional but hard to imagine how you'd
 * 							avoid having one and have it be very useful. this is where items get put into inventory, stats get changed
 * 							or whatever the point clicking on the item is gets done.
 * 				`object`: by default, items are assumed to be lines of text that can be clicked on. passing any kind of Phaser.GameObject
 * 							as the item.object, however, will override that behavior. so you can have an item that is an image, or a container, or 
 * 							a custom text object, or whatever. [note that right now, the click function here will process `use` and `buy` but otherwise
 * 							does no other checks with objects. probably should be made consistent.]
 * 				`clicker`: the clicker is an object that determines what gets clicked on to trigger the item. this is
 * 							optional. if one is not provided, then a Rectangle object will be created with the dimensions of the 
 * 							text or object and used instead. 
 * 				`x`: the x coordinate of the given item. all subsequent items without an `x` set will inherit the setting of the last one before it.
 * 							so if you are trying to have a lot of items with the same x coordinate, you can just set it once, first. 
 * 				`y`: this is an ADDITIONAL y coordinate added to the item, on top of item_spacing. optional. this is meant to be
 * 							for situations where you need to increase or decrease the item spacing on a per-item basis.
 * 			*`display_name`: by default, an item's text will be its name, and if there is a price, some dots and the price. but
 * 							you can override this behavior by using a display_name, either as a String or a function that returns a String, and it will be used instead.
 * 				`message`: A message string that is displayed once the item is purchased.
 * 
 * `item_color` -- numerical color (e.g., 0xff0000 = red, 0xrrggbb in hex) for item text
 * `item_spacing` -- how much space (in pixels) is added to the y for each subsequent list item
 * `item_offset_x` -- how much initial offset on the x axis the items originally have (optional)
 * `item_offset_y` -- how much initial offset on the y axis the items originally have (optional)
 * `item_width`  -- how wide (in pixels) the item line should be at max (used to scale prices and dots) (optional)
 * 
 * `jobs` -- an array of job objects, each of which represent a possible job at that place.
 * 		the job objects have the following properties:
 * 			`name`: name of the position (e.g. "Clerk")
 * 			`wage`: the base wage (per hour) for the job (will be scaled by economy)
 * 			`experience`: the experience stat required for the job
 * 			`dependability`: the dependability stat required for the job
 * 			`degrees`: an array of degrees required for the job (e.g., "Academic")
 * 			`uniform`: a key to the uniform (checked against scence.player.clothes) needed to work at job (e.g. "dress")
 * `buttons` -- an array of bottom button objects that are added below a location. 
 *  		note that each location will always have a DONE button, and if the player works there, a WORK button.
 *			other buttons, like ENROLL and RELAX must be added manually. also note that the
 *			game will automatically disallow clicking bottom buttons if a modal message is 
 *			being displayed. 
 *		The bottom button object properties are:
 *			`image`: an image texture for the button
 *			`x`: the x-position of the button (y is set automatically) (top left). If omitted, will slot to the left of other buttons.
 *			`onclick`: the function to run if the button is clicked (will be passed the scene and location objects)
*/

	//each of these locations is stored in a separate file in the locations directory,
	//because otherwise it would a huge amount of code in one file.

	var path = "./locations/";
module.exports = [
	require(path+'low_cost_housing.js'),
	require(path+'pawn_shop.js'),
	require(path+'discount.js'),
	require(path+'fast_food.js'),
	require(path+'clothing.js'),
	require(path+'park_lower_right.js'),
	require(path+'appliances.js'),
	require(path+'university.js'),
	require(path+'clock.js'),
	require(path+'employment_office.js'),
	require(path+'factory.js'),
	require(path+'bank.js'),
	require(path+'market.js'),
	require(path+'park_upper_left.js'),
	require(path+'high_cost_housing.js'),
	require(path+'rent_office.js')
]