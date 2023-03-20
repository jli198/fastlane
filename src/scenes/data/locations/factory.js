
/* 
 * The Health Center is where to go if a player gets sick (Doctor’s Office) to be checked up. This will cost a fee.
 */
module.exports = {
	"id": "Health_Center",
	"name": "Health Center",
	"x":  49, "y": 181,
	"x1":  8, "y1": 156,
	"x2": 67, "y2": 193,
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
	]
}