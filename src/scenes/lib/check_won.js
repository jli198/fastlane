//checks whether the current player has won the game
module.exports = function(scene){
	
	var score = scene.player_score();

	if(
		((score.wealth>=scene.player.goals.wealth) &&
		(score.happiness>=scene.player.goals.happiness) &&
		(score.education>=scene.player.goals.education) &&
		(score.career>=scene.player.goals.career)) 
	) {
		scene.you_won(); //trigger winning sequence
		scene.settings.check_won = false; //never check again -- for multiplayer, this should be changed so only THIS player is not checked
		return true; //they won
	} else {
		return false; //they didn't win
	}
}