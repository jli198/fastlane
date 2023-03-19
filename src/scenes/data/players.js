/*
 * This is where data for players that can be selected as part of the New Game  
 * location can be chosen. These settings will be copied over to the 
 * scene.players variable, which will be used to generate the scene.player
 * variable for each actual player. So one can put any information here and it
 * will overwrite the default scene.player template when it is created.
 * Which is a longwinded way of pointing out that this doesn't have to just
 * be icons and colors -- you could have different players start with different
 * amounts of money, inventories, locations, hours per week, whatever, which could 
 * make for interesting gameplay changes. Note also that each player has an "id" that 
 * is unique to them, so you could check scene.player.id if you wanted certain events to
 * be triggered only for specific player characters.
 * 
 */

module.exports = [
	{
		"id": "attila", //id of this player
		"image": "attila_casual", //current player image texture
		"outfits": { //outfits -- need to be in order of least to most formal
			"naked": "attila_naked",
			"casual": "attila_casual",
			"dress": "attila_dress",
			"business": "attila_business"
		},
		"background_color": 0xdac6e2, //background color for player image
		"icon": "dot-red", //player icon on board texture
		"location": "low_cost_housing", //where they start
		"money": 200, //money in hand
		"clothes": "casual"
	},
	{
		"id": "attila_middle", //id of this player
		"image": "attila_dress", //current player image texture
		"outfits": { //outfits -- need to be in order of least to most formal
			"naked": "attila_naked",
			"casual": "attila_casual",
			"dress": "attila_dress",
			"business": "attila_business"
		},
		"background_color": 0xc9daf8, //background color for player image
		"icon": "dot-blue", //player icon on board texture
		"location": "low_cost_housing", //where they start
		"money": 600, //money in hand
		"clothes": "dress"
	},
	{
		"id": "attila_rich", //id of this player
		"image": "attila_business", //current player image texture
		"outfits": { //outfits -- need to be in order of least to most formal
			"naked": "attila_naked",
			"casual": "attila_casual",
			"dress": "attila_dress",
			"business": "attila_business"
		},
		"background_color": 0xb5f9e4, //background color for player image
		"icon": "dot-green", //player icon on board texture
		"location": "high_cost_housing", //where they start
		"money": 5000, //money in hand
		"clothes": "business",
		"home": { //info about their home
			"location": "high_cost_housing", //where they live
			"rent": 475, //rent per month
			"rent_extension": false, //do they have a 1 week rent extension
			"rent_extensions": 0, //total # of rent extensions requested
			"rent_owed": 0, //how much back rent they owe
			"rent_paid": true, //is rent paid this month 
		},

	},
	{
		"id": "attila_poor", //id of this player
		"image": "attila_naked", //current player image texture
		"outfits": { //outfits -- need to be in order of least to most formal
			"naked": "attila_naked",
			"casual": "attila_casual",
			"dress": "attila_dress",
			"business": "attila_business"
		},
		"background_color": 0xfaf3ab, //background color for player image
		"icon": "dot-yellow", //player icon on board texture
		"location": "low_cost_housing", //where they start
		"money": 50,
		"clothes": "naked"
	},
]