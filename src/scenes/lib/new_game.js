
/*
 * This is just a selection for how many players they are. Then goes to select_players.js.
 */
module.exports = function(scene){
	console.log("NEWGAME");
	scene.player.modal = true;
	if(scene.player_dot) scene.player_dot.destroy();
	if(scene.player_image) scene.player_image.destroy();
	scene.week_no.setVisible(false);
	scene.hide_money();
	if(scene.location_window) scene.location_window.destroy();
	scene.location_window = scene.add.container(68,44).setDepth(-1); //puts this behind the board
	scene.location_window.add(new Phaser.GameObjects.Rectangle(scene,1,1,180,110,0xfbfaf5).setOrigin(0,0))

	var txt = new Phaser.GameObjects.BitmapText(scene,180/2,20,"chunky","How Many Players?")
	scene.location_window.add(txt);
	scene.centerX(txt);	

	var space_between_buttons = 15;
	var max_players = 4;
	var total_width = 182;
	var button_width = 25;
	var btn_left = (total_width-((space_between_buttons*(max_players-1))+(button_width*max_players)))/2
	for(var i = 0; i<max_players; i++) {
		var btn = new Phaser.GameObjects.Image(scene,btn_left,50,"corner_icon_player_"+(i+1)).setOrigin(0,0)
		.setData("players",i+1)
		.setData("x",btn_left)
		.setData("y",50)
		.setInteractive()
		.on("pointerdown",function() {
			this.setX(this.getData("x")+1);
			this.setY(this.getData("y")+1);
		})
		.on("pointerout",function() {
			this.setX(this.getData("x"));
			this.setY(this.getData("y"));
		})
		.on("pointerover",function(pointer) {
			if(pointer.isDown) {
				this.setX(this.getData("x")+1);
				this.setY(this.getData("y")+1);	
			}
		})
		.on("pointerup",function() {
			this.setX(this.getData("x"));
			this.setY(this.getData("y"));
			var players = this.getData("players");
			require('./select_players.js')(scene,players)
		})
		scene.location_window.add(btn);
		btn_left+=button_width+space_between_buttons;
	}

}