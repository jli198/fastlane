

//code that tells the game the player has set a new destination. it calculates the new route
//and then starts or restarts the movement animations.
module.exports = function(scene,id){
	console.log("set_destination",id);

	if(scene.location_window) scene.location_window.destroy();
	scene.hide_money();

	//even if we are already there, we might need to move there
	if(scene.player.location==id) {
		var id2 = scene.get_location_i(id);
		scene.player.travel_path = [id2];
		scene.move_to_next();
		return false;
	}

	//calculate the route to target -- checks both directions, uses shortest
	var id1 = scene.get_location_i(scene.player.location);
	var id2 = scene.get_location_i(id);
	var direction_1 = [];
	var xx = +id1;
	while(xx!=id2) {
		direction_1.push(xx);
		xx++;
		if(xx>=scene.locations.length) xx=0;
	}
	direction_1.push(+id2);
	var direction_2 = [];
	var xx = +id1;
	while(xx!=id2) {
		direction_2.push(xx);
		xx--;
		if(xx<0) xx = scene.locations.length-1;
	}
	direction_2.push(+id2);

	if(direction_1.length>direction_2.length) {
		var direction = direction_2;
	} else {
		var direction = direction_1;
	}	
	scene.player.travel_path = direction.slice(1,direction.length); //remove first item (where they already are)

	//now start the actual movement animations
	scene.move_to_next();
}