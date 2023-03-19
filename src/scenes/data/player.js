/* 
 * This is the default player settings, which initializes the game and sets up
 * its variables. You can change these for debugging purposes.
 */

module.exports = { 
		"image": "attila_casual", //current player image texture
		"outfits": { //outfits -- need to be in order of least to most formal
			"naked": "attila_naked",
			"casual": "attila_casual",
			"dress": "attila_dress",
			"business": "attila_business"
		},
		"background_color": 0xdac6e2, //background color for player image
		"icon": "dot-red", //player icon on board texture
		"location": "low_cost_housing", //where they are right now, or where they start
		"home": { //info about their home
			"location": "low_cost_housing", //where they live
			"rent": 325, //rent per month
			"rent_extension": false, //do they have a 1 week rent extension
			"rent_extensions": 0, //total # of rent extensions requested
			"rent_owed": 0, //how much back rent they owe
			"rent_paid": true, //is rent paid this month 
		},
		"job": { //info about their job
			"location":  "", //id of where the work -- blank if unemployed
			"name": "", //job title
			"wage": 1, //pay per hour
			"uniform": "", //uniform requirement
			"dependability": 0, //dependability requirement			
			"experience": 0, //used to calculate max experience attained
		},
		"money": 200, //money in hand
		"bank_money": 0, //money in bank
		"stocks": [],
		"ate": false, //did they eat yet this week
		"starving": false, //did they not eat last week
		"clothes": "casual", //type of clothes worn
		"clothes_wear": 9, //weeks until breaks
		"inventory": [], //holds any items purchased
		"happiness": 0, //happiness meter
		"degrees": [], //list of degrees obtained
		"visited": [], //list of places visited this week
		"enrolled": [], //list of degrees enrolled, and progress
		"dependability": 20, //working increases dependability, not working decreased it
		"experience": 10, //increases with working
		"relaxation": 10, //how relaxed the player is
		"goals": { //goals to win the game
			"wealth": 50,
			"happiness": 50,
			"education": 50,
			"career": 50
		},
		"turn_flags": {}, //this is cleared every turn
		"travel_path": [], //list of ids they are traveling to
		"time": 60, //how many hours left in the week for player
		"hours_per_week": 60, //how many hours the player has per week maximum (time gets reset to this every week)
		"modal": false, //whether we ignore clicks to travel, buttons, etc.
	}
