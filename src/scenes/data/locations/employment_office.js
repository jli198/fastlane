
/* 
 * The employment office lists all possible jobs (which are defined in each individual
 * location object's `jobs` property) and lets the player apply for them.
 * What it first does is create a list of items based on every PLACE that has jobs. It does
 * this by just cycling over the locations and seeing if the `jobs` property has any members
 * in it. Then it makes it so that if the player clicks on that place name, it creates a new
 * menu OVER the existing one, that lists all of the jobs. If they click on the specific job,
 * then it "applies" for the job (checks if their stats are right, as well as a random chance
 * that there are no positions open that week). This new menu also replaces the original DONE
 * button and makes it basically a "back" button (which works by just resetting the location
 * screen). 
 */
module.exports = {
	"id": "employment_office",
	"x":  97, "y": 183,
	"x1": 69, "y1": 156,
	"x2":128, "y2": 193,
	"image": "place_employment",
	"speech": {
		"image": "speech_bubble_r_t",
		"image_x": 5,
		"image_y": 26,
		"text_x": 55,
		"text_y": 41,
		"mouth": "nariman_jaw",
		"mouth_x": 143,
		"mouth_y": 49,
	},
	"welcomes": [
		"Time to see what all that education has got you!",
	],
	"item_color": 0x012d01,
	"item_offset_y": -3,
	"item_spacing": 9,
	"item_align": "center",
	"item_offset_x": 57,
	"items": function(scene) {
		var employers = [];
		for(var i in scene.locations) {
			if(typeof scene.locations[i].jobs !="undefined") {
				employers.push({
					"name": scene.locations[i].name,
					"id": scene.locations[i].id,
					"use": function(scene,item,location) {
						/* this code is executed when the player clicks on the name of a place 
						 * that offers jobs. it basically creates a window on top of the existing window,
						 * and populates it with a list of jobs and wages. each of those jobs and wages then
						 * gets an event attached to it that allows the player to apply to the job when they
						 * click on it. it's kind of complicated but it gives you a sense of how much flexibility
						 * this system has.
						 * 
						 * In retrospect, this is a dumb way to do it. Would be better to set up a 
						 * dynamic location object. A lot less work, anyway. Like this code below
						 * is handling the mouseovers and all that. Totally unnecessary. 
						 * 
						 */
						var job_listing = new Phaser.GameObjects.Container(scene,1,14);
						var job_background = new Phaser.GameObjects.Rectangle(scene,0,0,181,97,0xdfcca1).setOrigin(0,0).setInteractive();
						job_listing.add(job_background);
						var jy = 6;
						var txt = new Phaser.GameObjects.BitmapText(scene,91,jy,"small",item.name+" Jobs Available:").setOrigin(0).setDropShadow(1,1,0x000000,0.1);
						txt.setX(txt.x-Math.round(txt.width/2));
						job_listing.add(txt);
						var job_location = scene.get_location(item.id);
						var jobs = job_location.jobs;
						jy+=10;
						for(var i in jobs) {
							var job_name = new Phaser.GameObjects.BitmapText(scene,0,0,"small",jobs[i].name).setOrigin(0).setDropShadow(1,1,0x000000,0.1);
							var wage = Math.max(Math.round(jobs[i].wage*scene.gamestate.economy),scene.settings.minimum_wage);
							var job_pay = new Phaser.GameObjects.BitmapText(scene,0,0,"small","$"+wage+" Hr.").setOrigin(0).setDropShadow(1,1,0x000000,0.1);
							var job_available = new Phaser.GameObjects.Container(scene,24,jy);
							job_pay.x = 130-job_pay.width;
							job_available.add(job_name);
							job_available.add(job_pay);
							job_clicker = new Phaser.GameObjects.Rectangle(scene,0,3,job_pay.x+job_pay.width,8).setOrigin(0,0)
								.setData("location",item.id)
								.setData("job",i)
								.setInteractive()
								.on("pointerover",function() {
									//quick and dirty hover for all BitmapTexts in same container as this
									for(var i in this.parentContainer.list) {
										if(typeof this.parentContainer.list[i].setTintFill == "function") {
											this.parentContainer.list[i].setTintFill(0xffffff);
										}
									}
								})
								.on("pointerout",function() {
									//quick and dirty hover for all BitmapTexts in same container as this
									for(var i in this.parentContainer.list) {
										if(typeof this.parentContainer.list[i].setTintFill == "function") {
											this.parentContainer.list[i].setTintFill(0x000000);
										}
									}
								})
								.on("pointerup",function() {
									/* this is the "apply for a job" code that gets executed when they click
									 * on any particular job. it checks if there is enough time left to apply, then
									 * checks if the player meets the requirements for the job. if they do, it changes
									 * their job; if not, it tells them why.
									 */
									if(scene.player.time<4) {
										scene.show_location(location.id,false);	//reload original screen	
										scene.show_message({...location.speech,...{
											message: "Sorry. We're closing. You'll have to come back next week."
										}})
										return false;
									}
									scene.subtract_time(4);
									var job_location = this.scene.get_location(this.getData("location"));
									var job = job_location.jobs[this.getData("job")];												
									var got_job = true;
									var lacks_education = false;
									var lacks_dependability = false;
									var lacks_experience = false;
									var no_openings = false;
									if(job.degrees.length) {
										for(var i in job.degrees) {
											if(!scene.player.degrees.includes(job.degrees[i])) {
												got_job = false;
												lacks_education = true;
											}
										}
									}
									if((scene.player.dependability<job.dependability)&&job.dependability>10) {
										got_job = false;
										lacks_dependability = true;
									} 
									if(scene.player.experience<job.experience) {
										got_job = false;
										lacks_experience = true;
									}

									//this detects if this job has randomly tripped the "no openings" issue this week
									//only happens if player otherwise would have gotten job. makes it standard for the job
									//all week for all players. 
									if(got_job) {
										if(typeof scene.gamestate.turn_flags.no_openings == "undefined") {
											scene.gamestate.turn_flags.no_openings = [];
										}
										if(scene.gamestate.turn_flags.no_openings.includes(job_location.id+"_"+job.name)) {
											got_job = false;
											no_openings = true;
										}
										if(Phaser.Math.Between(1,10)==1) { //10% chance
											got_job = false;
											no_openings = true;
											scene.gamestate.turn_flags.no_openings.push(job_location.id+"_"+job.name);
										}
									}
									if(!got_job) {
										var msg = "Sorry. You didn't get the job, because:\n";
										var reasons = "";
										if(lacks_education) reasons+="Missing education.\n";
										if(lacks_experience) reasons+="Lacking experience.\n";
										if(lacks_dependability) reasons+="Lacking dependability.\n";
										if(no_openings) reasons+="No openings.\n";
										if(scene.player.job.location == job_location.id && scene.player.job.name == job.name) {
											msg = "Sorry. Your promotion request was denied. Reasons: \n";
										} 
										scene.player.happiness-=1;
										scene.show_location(location.id,false);	//reload original screen													
										scene.show_message({...location.speech,...{
											message: msg+reasons
										}})
									} else {
										//get the economy-adjusted wage (make sure it is at least minimum wage)
										var wage = Math.max(Math.round(job.wage*scene.gamestate.economy),scene.settings.minimum_wage);
										var msg = "Congratulations. You got the job.";
										if(scene.player.dependability==0) scene.player.dependability = 10;
										scene.player.happiness+=3;
										scene.player.experience+=2;
										if(scene.player.job.location == job_location.id && scene.player.job.name == job.name) {
											if(scene.player.job.wage>wage) {
												msg = "Congratulations. Your employer was happy to pay you less for the same job you were already doing.";
												scene.player.happiness-=3;
											} else if(scene.player.job.wage<wage) {
												msg = "Congratulations. Your employer gave you a raise.";
											} else {
												msg = "You just applied for the same job at the same wage.\n\n You've wasted your time.";
												scene.player.happiness-=3;
											}
										} else if(scene.player.job.location == job_location.id) {
											if(scene.player.job.wage>wage) {
												msg = "Congratulations. Your employer was willing to demote you.";
												scene.player.happiness-=3;
											} else if(scene.player.job.wage<wage) {
												msg = "Congratulations. Your employer promoted you.";
											} 
										}
										//set the player job
										scene.player.job = {
											"location": job_location.id,
											"name": job.name,
											"wage": wage,
											"uniform": job.uniform,
											"experience": job.experience,
											"dependability": job.dependability
										}
										scene.show_location(location.id,false);	//reload original screen	
										scene.show_message({...location.speech,...{
											message: msg
										}})
									}
								})
							job_clicker.setY(job_clicker.y-Math.round(job_clicker.height/2));
							job_available.add(job_clicker);
							job_listing.add(job_available);
							jy+=10;
						}
						scene.location_window.add(job_listing);

						//remove existing "done" button and replace with a new one that goes back a screen
						var btn_x = scene.location_window.buttons.done.x; //get its position first
						console.log(scene.location_window.buttons);
						scene.location_window.buttons.done.destroy(); //destroy it
						scene.location_window.add(scene.bottom_button("btn-done",btn_x,function(scene) {
							scene.show_location(location.id,false);
						},location))

						//also get rid of the "work" button if it exists
						if(typeof scene.location_window.buttons.work!="undefined") {
							scene.location_window.buttons.work.destroy(); //destroy it
						}
					}
				})
			}
		}
		return employers;	
	},
}