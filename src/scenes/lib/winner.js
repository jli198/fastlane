
/*
 * I got a little carried away with the "you won" screen. Way better than the original.
 */
module.exports = function(scene){
	console.log("WINNER");
	if(scene.location_window) scene.location_window.destroy();
	scene.winner = scene.add.container(68,44).setDepth(-1);
	scene.winner.width = 183;
	scene.winner.height = 112;

	scene.player_image.setVisible(false);

	var background = new Phaser.GameObjects.Rectangle(scene,0,0,scene.winner.width,scene.winner.height,scene.player.background_color).setDepth(-10).setOrigin(0,0);
	scene.winner.add(background);

	//texts
	var winner_text_lr = [];
	var winner_text_rl = [];
	var w_y = -4;
	for(var i = 0;i<3;i++) {
		var winner_text = new Phaser.GameObjects.BitmapText(scene,-scene.winner.width,w_y,"small","A WINNER IS YOU!",12*2,2).setOrigin(0,0).setTintFill(0xffffff);
		winner_text_lr.push(winner_text);
		scene.winner.add(winner_text);
		w_y+=18;
		var winner_text = new Phaser.GameObjects.BitmapText(scene,scene.winner.width,w_y,"small","A WINNER IS YOU!",12*2,2).setOrigin(0,0).setTintFill(0xffffff);
		winner_text_rl.push(winner_text);
		scene.winner.add(winner_text);
		w_y+=18;
	}
	scene.tweens.add({
		targets:winner_text_lr,
		x:scene.winner.width,
		repeat:-1,
		duration: 4000
	})
	scene.tweens.add({
		targets:winner_text_rl,
		x:-scene.winner.width,
		repeat:-1,
		duration: 4000
	})

	//stars
	var center_x = scene.winner.width/2-20;
	var center_y = scene.winner.height/2-5;
	var star_points = [];
	for(var i = 0; i<12;i++) {
		var cx = center_x*Math.sin(-Phaser.Math.DEG_TO_RAD*(360/12*i));
		var cy = center_y*Math.cos(-Phaser.Math.DEG_TO_RAD*(360/12*i));
		star_points.push([cx,cy])
	}
	var s = 0;
	var stars = [];
	for(var i in star_points) {
		stars.push(new Phaser.GameObjects.Image(scene,scene.winner.width/2+star_points[i][0],scene.winner.height/2+star_points[i][1],"star_"+s));
		scene.winner.add(stars[stars.length-1]);
		s++; if(s>2) s=0;
	}
	var star_tween = scene.tweens.add({
		targets: stars,
		x: scene.winner.width/2,
		y: scene.winner.height/2,
		yoyo: true,
		duration: 500,
		repeat: -1
	})

	//pedastal
	scene.winner.add(new Phaser.GameObjects.Image(scene,scene.winner.width/2,scene.winner.height-13,"winner").setOrigin(0.5,0).setDepth(10))

	//player
	var player_image = new Phaser.GameObjects.Image(scene,scene.winner.width/2,scene.winner.height/2,scene.player.image).setDepth(10).setOrigin(0.5,0.5);
	scene.winner.add(player_image);

	scene.player.modal = true;

	scene.time.addEvent({
		delay: 1000*10,
		callback: function() {
			var scene = this;
			var face = new Phaser.GameObjects.Image(scene,scene.winner.width-72,3,"nariman").setOrigin(0,0);
			var mouth = new Phaser.GameObjects.Image(scene,scene.winner.width-45,36,"nariman_jaw").setOrigin(0,0);
			scene.winner.mouth = mouth;
			scene.winner.add(face);
			scene.winner.add(mouth);
			scene.show_message({
				parent: scene.winner,
				"image": "speech_bubble_r_t",
				"image_x": 3,
				"image_y": 25,
				"text_x": 55,
				"text_y": 41,
				"mouth": "nariman_jaw",
				"mouth_x": 140,
				"mouth_y": 33,
				"mouth_repeat": 25,
				"message": "Congratulations, you achieved your goals! You are the true innovator! To the stars, through struggling!",
				"close_by_clicking": false,
				"display_time": 1000*15,
				"callback": function(scene) {
					scene.player_image.setVisible(true);
					scene.winner.destroy();
					scene.location_window = scene.add.container(183,112).setDepth(100);
					scene.location_window.x = 68;
					scene.location_window.y = 44;
					scene.player.modal = true;
					scene.show_message({
						image: "speech_bubble_small",
						message: "And so it goes.",
						close_by_clicking: false,
						callback: function(scene) {
							scene.location_window.destroy();
							scene.start_week();
						}
					});
	
				}
			})
		},
		callbackScope: scene
	})
}
