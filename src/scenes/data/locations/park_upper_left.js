
/* 
 * The park in the upper-left is a non-clickable, non-interactable area. 
 * Its x and y is just a waypoint that the player dot passes through.
 * 
 * I've made it do a little stuff below, just as an example...
 * 
 */
module.exports = {
	"id": "park_upper_left",
	"x": 40, "y": 63,
	"x1": 40-30, "y1": 63-15,
	"x2": 40+25, "y2": 63+15,
	"image": "place_park",
	"speech": {
		"image": "speech_bubble_small",
	},
	"item_color": 0xffffff,
	"item_offset_y": 10,
	"item_spacing": 30,
	"welcomes": [
		"It's a beautiful day."
	]
}