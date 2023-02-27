
/* 
 * This is where random weekend events are stored. Right now, it just picks one at
 * random, and each is associated with a cost (which can be a function). 
 * You can put other code into the cost function, like changing player happiness, so long as
 * it returns a number. If the cost number is negative, the player gains the money.
 * In the original game, there are categories of weekends (cheap, medium, expensive) that can
 * happen at different weeks in the game. This does not implement this system (all random
 * weekends are random). One could imagine creating three different weekend event lists
 * and using the appropriate one in MainScene.js depending on the current week.
*/
module.exports = [
		{
			"text": "You sat around and played video games, because that's what your generation thinks socializing is.",
			"cost": function(scene) { return weekend_cost.cheap();}
		},
		{
			"text": "You went to a party. You hung out with the party dog, which was pretty great.",
			"cost": function(scene) { 
				scene.player.happiness+=1;
				return weekend_cost.cheap();
			}
		},
		{
			"text": "You stayed home and read a book. How'd you spend money? Nobody knows.",
			"cost": function(scene) { return weekend_cost.cheap();}
		},
		{
			"text": "You went for a walk and found $20 on the ground. Score!",
			"cost": -20
		}
	]

//an object that this module can use to set the price of a weekend dynamically
//note than any "global" objects in a module are only available to that module, not
//to the main program loop.
var weekend_cost = {
	"cheap": function() { return Phaser.Math.Between(5,20) },
	"medium": function() { return Phaser.Math.Between(15,55) },
	"expensive": function() { return Phaser.Math.Between(50,100) }
}
