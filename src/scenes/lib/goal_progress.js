//shows goal progress
module.exports = function(scene){

	if(scene.location_window) scene.location_window.destroy();

	scene.location_window = scene.add.container(68,44).setDepth(10); 
	scene.location_window.add(new Phaser.GameObjects.Image(scene,0,0,"goals_winning").setOrigin(0,0))

	var between_bars = 25;
	var bar_top = 35;
	var bar_width = 15;
	var window_width = 182;
	var bars_width = (bar_width*scene.gamestate.players.length)+(between_bars*scene.gamestate.players.length-1);
	var bar_left = ((window_width-bars_width)/2)+bar_width;

	for(var i in scene.gamestate.players) {

		if(i == scene.gamestate.current_player) {
			var player = {...scene.player};
		} else {
			var player = {...scene.gamestate.players[i]};
		}

		var score = scene.player_score(player);
		var goal_percent = 
			(score.wealth/player.goals.wealth
			+score.happiness/player.goals.happiness
			+score.education/player.goals.education
			+score.career/player.goals.career)
			/
			Object.keys(player.goals).length;

		var bar_center = bar_left+bar_width/2;
		var bar_back = new Phaser.GameObjects.Image(scene,bar_center,bar_top,"goal_winning_indicator").setOrigin(0.5,0);
		scene.centerX(bar_back);
		scene.location_window.add(bar_back);
		//max is 50
		var bar_progress_height = Math.round(goal_percent*100)/2;
		var bar_progress = new Phaser.GameObjects.Rectangle(scene,bar_center+1,86-bar_progress_height,7,bar_progress_height,0xed1830).setOrigin(0.5,0);
		scene.centerX(bar_progress);
		scene.location_window.add(bar_progress);

		var progress_text = new Phaser.GameObjects.BitmapText(scene,bar_center+3,bar_top-10,"small",Math.round(goal_percent*100)+"%").setOrigin(0.5,0);
		scene.centerX(progress_text);
		scene.location_window.add(progress_text);
		var player_icon_border = new Phaser.GameObjects.Rectangle(scene,bar_center+1,92-1,15,14,0x000000).setOrigin(0.5,0);
		scene.centerX(player_icon_border);
		scene.location_window.add(player_icon_border);
		var player_icon = new Phaser.GameObjects.Image(scene,bar_center,92,"corner_icon_player_small_"+(+i+1)).setOrigin(0.5,0);
		scene.centerX(player_icon);
		player_icon
			.setInteractive()
			.setData("current_player",i)
			.setData("player",player)
			.setData("x",player_icon.x)
			.setData("y",player_icon.y)
			.setData("rect",player_icon_border)
			.setData("scene",scene)
			.on("pointerdown",function(pointer) {
				this.setX(this.getData("x")+1);
				this.setY(this.getData("y")+1);
				this.getData("rect").setX(this.getData("x")+1)
				this.getData("rect").setY(this.getData("y"))
			})
			.on("pointerup",function(pointer) {
				this.setX(this.getData("x"));
				this.setY(this.getData("y"));
				this.getData("rect").setX(this.getData("x"))
				this.getData("rect").setY(this.getData("y")-1)
				var scene = this.getData("scene");
				scene.location_window.goal_window = new Phaser.GameObjects.Container(scene,0,0);
				scene.location_window.add(scene.location_window.goal_window);
				scene.location_window.goal_window.add(new Phaser.GameObjects.Image(scene,0,0,"goals_2").setOrigin(0,0).setInteractive());
				var current_player = this.getData("current_player");
				var player = this.getData("player");
				scene.location_window.goal_window.add(new Phaser.GameObjects.Image(scene,0,0,"corner_icon_player_"+(+current_player+1)).setOrigin(0,0));
				scene.location_window.goal_window.add(new Phaser.GameObjects.Image(scene,158,0,"corner_icon_player_"+(+current_player+1)).setOrigin(0,0));
				var score = scene.player_score(player);
				
				var star_x = [39,75,111,146];
				var goals = ["wealth","happiness","education","career"];
				for(var i = 0; i<goals.length; i++) {
					var g = goals[i];
					if(score[g]>=player.goals[g]) {
						var goal_y = scene.lerp(77,10,39,100,player.goals[g]);
						var star = new Phaser.GameObjects.Image(scene,star_x[i]+1,goal_y-4,"goal_star_gold").setOrigin(0.5,0)
						scene.centerX(star);
						scene.location_window.goal_window.add(star);
					} else {
						var goal_y = scene.lerp(77,10,39,100,player.goals[g]);
						var star = new Phaser.GameObjects.Image(scene,star_x[i],goal_y,"goal_star").setOrigin(0.5,0)
						scene.centerX(star);
						scene.location_window.goal_window	.add(star);
						var goal_square_y = scene.lerp(77,10,39,100,score[g]);
						var goal_square = new Phaser.GameObjects.Rectangle(scene,star_x[i],goal_square_y+3,2,3,0xffffff).setOrigin(0.5,0);
						scene.centerX(goal_square);
						scene.location_window.goal_window.add(goal_square);
					}
				}
				scene.location_window.btn_done.setVisible(false);
				var btn_done = scene.bottom_button("btn-done",144,function(scene) {
					scene.location_window.btn_done.setVisible(true);
					scene.location_window.goal_window.destroy();
				})
				scene.location_window.goal_window.add(btn_done);						
				
			})
			.on("pointerover",function(pointer) {
				if(pointer.isDown) {
					this.setX(this.getData("x")+1);
					this.setY(this.getData("y")+1);
					this.getData("rect").setX(this.getData("x")+1)
					this.getData("rect").setY(this.getData("y"))
					}
			})
			.on("pointerout",function(pointer) {
				this.setX(this.getData("x"));
				this.setY(this.getData("y"));
				this.getData("rect").setX(this.getData("x"))
				this.getData("rect").setY(this.getData("y")-1)
			})
		scene.location_window.add(player_icon);

		bar_left+=bar_width+between_bars;
	}
	var btn_done = scene.bottom_button("btn-done",144,function(scene) {
		scene.location_window.destroy();
	})
	scene.location_window.btn_done = btn_done;
	scene.location_window.add(scene.location_window.btn_done);
}