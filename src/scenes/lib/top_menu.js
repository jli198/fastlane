/*
 * Settings for the top menu and its items.
*/

module.exports = function(scene) {
	return { 
		scene: scene,
		background_hover: scene.supportsWebGL()?0x000000:0xc0c0c0,
		onshow(scene) {
			scene.pause();
		},
		onhide(scene) {
			scene.resume();
		},
		menu: [
			{
				"text": "?",
				"options": [
					{
						"text": "About",
						"onclick": function(scene) {
							scene.pause();
							var about_text =  "";
							about_text+="\"FASTLANE\" was created by Alex Wellerstein in Phaser/Node.js in 2023, but is derivative from Sierra Online's \"Jones in the Fast Lane\" (1991).";
							about_text+="\n\n";
							about_text+="All art assets taken from \"Jones\" are ©Sierra Online.";
							about_text+="\n\n";
							about_text+="All additional programming by Alex Wellerstein is licensed as CC-BY-NC.";
							about_text+="\n\n";
							about_text+="You are using FASTLANE version "+scene.settings.version+"."
							scene.add.existing(new scene.modalMessage({
								"scene": scene,
								"maxWidth": 300,
								"header": "ABOUT",
								"paddingX": 10,
								"text": about_text,
								"callback": function(scene) {
									scene.resume();
								}
							}))
						}
					}
				]
			},
			{
				"text": "Game",
				"options": [
					{
						"text": "Save Game",
						"onclick": function(scene) {
							require("./save_game.js")(scene);
						}
					},
					{
						"text": "Restore Game",
						"onclick": function(scene) {
							require("./restore_game.js")(scene);
						}
					},
					{
						"separator": true,
					},
					{
						"text": "Restart",
						"onclick": function(scene) {
							scene.pause();
							scene.add.existing(new scene.modalMessage({
								"scene": scene,
								"text": "Do you really want to restart the game?",
								"choices": [
									{
										"option": "Yes",
										"onclick": function(scene) {
												scene.gamestate = scene.new_gamestate;
												scene.player = require('../data/player.js');
												scene.week_no.setText("Week #"+scene.gamestate.week);
												require('./new_game.js')(scene);
										}
									},
									{
										"option": "No",
										"onclick": function(scene) {
											scene.resume();
										}
									}
								]
							}))
						}
					}
				]
			},
			{
				"text": "Status",
				"options": [
					{
						"text": "Inventory",
						"hotkey": {
							"key": "I",
							"ctrl": true
						},
						"onclick": function(scene) {
							var inv1 = [];
							var inv2 = [];	
							var inv = scene.player.inventory;						
							for(var i in inv) {
								var item = inv[i];
								if(!inv2.includes(item)) {
									var item_count = 0;
									for(var z in inv) {
										if(inv[z]==item) item_count++;
									}
									if(item_count>1) {
										inv1.push(item+" x "+item_count);
									} else {
										inv1.push(item);
									}
									inv2.push(item)
								}
							}
							inv1.sort();
							scene.pause();
							scene.add.existing(new scene.modalMessage({
								"scene": scene,
								"header": "PLAYER INVENTORY",
								"textObj": new scene.scrollList({
									scene: scene,
									x: 0,
									y: 0,
									selectable: false,
									font: "chunky",
									items: inv1,
									width: 150,
									height: 100,
									renderMask: false,
									abs_y_offset: 19 //needed to make the mask line up
								}),
								"ondisplay": function(scene,obj) {
									obj.text.obj.config.parent = obj.box;
									obj.text.obj.renderMask();
								},
								"maxWidth": 400,
								"choices": [
									{
										"option": "OK",
										"onclick": function(scene) {
											scene.resume();
										}
									}
								]
							}))
						}
					},
					{
						"text": "Statistics",
						"hotkey": {
							"key": "S",
							"ctrl": true
						},
						"onclick": function(scene) {						
							scene.pause();
							var statistics = [];
							statistics.push("@--- PLAYER "+(scene.gamestate.current_player+1)+" ---");
							if(scene.player.job.location=="") {
								statistics.push("Unemployed");
							} else {
								statistics.push("Works at "+scene.get_location(scene.player.job.location).name);
								statistics.push("As a "+scene.player.job.name);
								statistics.push("Hourly wage: $"+scene.player.job.wage);
							}
							statistics.push("Cash: $"+scene.player.money);
							statistics.push("Savings: $"+scene.player.bank_money);
							statistics.push("Rent owed: $"+scene.player.home.rent_owed);

							var stock_assets = 0; 
							if(typeof scene.player.stocks != "undefined") {
								for(var i in scene.gamestate.stocks) {
									var stock = scene.gamestate.stocks[i];
									for(var z in scene.player.stocks) {
										if(scene.player.stocks[z].name==stock.name) {
											var value = Math.min(Math.max(Math.round(stock.base*scene.gamestate.economy),stock.min),stock.max)
											var holding = scene.player.stocks[z].shares * value;
											stock_assets+=holding;
										}
									}
								}
							}	
							statistics.push("Investments value: $"+stock_assets);
							statistics.push("Net worth: $"+(scene.player.money+stock_assets+scene.player.bank_money));
							statistics.push(" ");
							statistics.push("@--- GOODS ---");

							var inv1 = [];
							var inv2 = [];	
							var inv = scene.player.inventory;						
							for(var i in inv) {
								var item = inv[i];
								if(!inv2.includes(item)) {
									var item_count = 0;
									for(var z in inv) {
										if(inv[z]==item) item_count++;
									}
									inv1.push("    "+item_count + " x " +item);
									inv2.push(item)
								}
							}
							inv1.sort();
							if(inv1.length==0) {
								statistics.push("@None");
							} else {
								statistics.push(...inv1);
							}

							statistics.push(" ");
							statistics.push("@--- EDUCATION ---");
							if(scene.player.degrees.length==0) {
								statistics.push("@None");
							} else {
								for(var i in scene.player.degrees) {
									statistics.push("  "+scene.player.degrees[i]);
								}
							}

							statistics.push(" ");
							statistics.push("@--- OTHER STATS ---");
							statistics.push("Happiness: "+scene.player.happiness);
							statistics.push("Dependability: "+scene.player.dependability);
							statistics.push("Experience: "+scene.player.experience);
							statistics.push("Relaxation: "+scene.player.relaxation);
							statistics.push("Time left in week: "+scene.player.time+" hr");
							statistics.push("Ate this week: "+(scene.player.ate?"Yes":"No"));
							statistics.push("Outfit: "+scene.player.clothes);
							statistics.push(" ");

							var stats = [];
							for(var i in statistics) {
								if(statistics[i].substr(0,1)=="@") {
									var st = statistics[i].substr(1,statistics[i].length);
									var rep = Math.round(38-st.length)/2; //this doesn't really center, because the font is not fixed width
									stats.push(String(" ").repeat(rep)+st);
								} else {
									stats.push("  "+statistics[i]);
								}
							}

							scene.pause();
							scene.add.existing(new scene.modalMessage({
								"scene": scene,
								"header": "STATISTICS",
								"textObj": new scene.scrollList({
									scene: scene,
									x: 0,
									y: 0,
									selectable: false,
									font: "chunky",
									items: stats,
									width: 240,
									height: 100,
									renderMask: false,
									abs_y_offset: 19 //needed to make the mask line up
								}),
								"ondisplay": function(scene,obj) {
									obj.text.obj.config.parent = obj.box;
									obj.text.obj.renderMask();
								},
								"maxWidth": 400,
								"choices": [
									{
										"option": "OK",
										"onclick": function(scene) {
											scene.resume();
										}
									}
								]
							}))
						}
					},
					{
						"text": "Goals",
						"hotkey": {
							"key": "G",
							"ctrl": true
						},
						"onclick": function(scene) {
							require("./goal_progress.js")(scene);							
						}
					}
				]
			}
		]
	};
}