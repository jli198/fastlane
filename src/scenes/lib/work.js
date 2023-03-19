
//this code is what is run every time the "work" button is clicked
module.exports = function(scene,location) {
	console.log("work");
	var speech = location.speech;
	if(scene.settings.check_uniforms) {
		if(Object.keys(scene.player.outfits).indexOf(scene.player.clothes)<Object.keys(scene.player.outfits).indexOf(scene.player.job.uniform)) {
			scene.show_message({...speech,...{
				message: "You are not dressed appropriately for work."
			}});
			return;
		}
	}
	if(scene.player.time>0) {
		//check if dependability is too low, fire them 
		var min_dependability = scene.player.job.dependability-5;
		if(scene.player.dependability<min_dependability) {
			scene.player.job = {
				"location": "", 
				"name": "", 
				"wage": 0, 
				"uniform": "", 
				"experience": 0,
				"dependability": 0, 
			}
			scene.show_message({...speech,...{
				message: "Sorry, you've been fired for being too unreliable.",
				callback: function(scene,location) {
					scene.show_location(location.id,false);
				},
				args: location
			}});
			return;
		} else if(scene.player.dependability<=(min_dependability+5)) {
			scene.show_message({...speech,...{
				message: "Hey, you need to show up to work more reliably. This is a warning.",
			}});
		}

		//if we have a place set up for the item_image, we can add the work animation
		//this is an example of how to do a simple animation -- in this case, the 
		//animation is five images that play at different speeds
		if(typeof location.item_image_x!="undefined" && typeof location.item_image_y!="undefined") {
			if(scene.location_window.item_image) scene.location_window.item_image.destroy();
			var work_animation = {
				"key": "work",
				"frames": [
					{"key":"work_0","duration":1000},
					{"key":"work_1","duration":200},
					{"key":"work_2","duration":200},
					{"key":"work_3","duration":200},
					{"key":"work_4","duration":1000},
				]
			}
			scene.anims.create(work_animation);
			scene.location_window.work = scene.add.sprite(location.item_image_x, location.item_image_y, 'work_0').setOrigin(0)
				.setDepth(10)
				.play('work')
				.on(Phaser.Animations.Events.ANIMATION_COMPLETE,function() {
					this.destroy();
				})
			scene.location_window.add(scene.location_window.work);

		}

		//basic work is 6 hours, which is 8X wage
		if(scene.player.time>=6) {
			var earned =scene.player.job.wage*8;
			scene.subtract_time(6);
		} else { //prorated pay
			var earned = Math.round(scene.player.job.wage*(scene.player.time*8/6))
			scene.subtract_time(scene.player.time);
		}
		//check for back rent
		if(scene.settings.check_rent) {
			if(scene.player.home.rent_owed) {
				var garnish = Math.round(earned/2);
				if(scene.player.home.rent_owed<garnish) {
					garnish = scene.player.home.rent_owed;
				}
				scene.player.home.rent_owed-=garnish;
				earned-=(garnish+2); //plus a $2 service fee
				scene.show_message({...speech,...{
					message: "Your landlord garnished $"+garnish+" for owed rent."
				}});
			}
		}
		scene.player.money+=earned;
		var max_experience = 10+scene.player.job.experience+(scene.player.degrees.length*5); //each job has a max experience
		if(scene.player.experience<max_experience) scene.player.experience+=1;
		scene.player.dependability+=1; 
		scene.update_money();
	} else {
		console.log("NO TIME");
		scene.show_message({...speech,...{
			message: "There is no more time to work."
		}});
	}


}