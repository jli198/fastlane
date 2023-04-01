
/* 
 * The park in the lower-right is a non-clickable, non-interactable area. 
 * Its x and y is just a waypoint that the player dot passes through.
 */
 module.exports = {
	"id": "Church Square Park",
	"x": 299, "y": 136,
  "x1": 299+30, "y1": 136-15,
  "x2": 299+45, "y1": 136+15,
  "image": "place_park",
  "speech": {
    "image": "speech_bubble_small"
  },
  "item_color": 0xffffff,
	"item_offset_y": 10,
	"item_spacing": 30,
	"welcomes": [
		"Mmmm I smell the religion!"
	]
}

