//calculates goal scores for a given player
module.exports = function(scene,player){
	if(typeof player =="undefined") player = scene.player;
	console.log(scene.gamestate,player);

	var stock_assets = 0; 
	if(typeof player.stocks != "undefined") {
		for(var i in scene.gamestate.stocks) {
			var stock = scene.gamestate.stocks[i];
			for(var z in player.stocks) {
				if(player.stocks[z].name==stock.name) {
					var value = Math.min(Math.max(Math.round(stock.base*scene.gamestate.economy),stock.min),stock.max)
					var holding = player.stocks[z].shares * value;
					stock_assets+=holding;
				}
			}
		}
	}
	
	var wealth = (player.money+player.bank_money+stock_assets)/100; 
	var happiness = player.happiness;
	var education = 1+(9*player.degrees.length);
	var career = 1.25 * player.dependability;
	
	if(player.job.name=="") career = 0;

	return {
		"wealth": wealth,
		"happiness": happiness,
		"education": education,
		"career": career
	}

}