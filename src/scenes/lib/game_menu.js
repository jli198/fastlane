
/*
 * This is a sort of simple little game menu, using the location syntax.
 * It allows saving and restoring of the gamestate data into the browser localstorage.
 * It also does a data dump of all of the gamestate data which it displays in a little
 * scroll window. Maybe useful for debugging...
 *
 * Because of the way this works, the ScrollText import has to be in the main function, and
 * it passes the object here so it can be used.
 */
module.exports = function(scene){
		var menu = {
			"id": "game_menu",
			"speech": {
				"image": "speech_bubble_large",
			},
			"item_font": "small",
			"item_align": "center",
			"item_offset_x": Math.round(183/2),
			"item_offset_y": -15,
			"item_hover": 0x606dcc,
			"item_spacing": 9,
			"on_close": function(scene) { 
				scene.input.off("drag"); //otherwise this will continue to always be checking
			},
			"items": function(scene,location) {
				scene.location_window.add(new Phaser.GameObjects.Rectangle(scene,1,0,182,111,0xffffff,0.9).setStrokeStyle(1,0x00000).setOrigin(0,0))
				var txt = new Phaser.GameObjects.BitmapText(scene,Math.round(183/2),5,"chunky","--------- Menu ---------").setOrigin(0,0);
				txt.setX(txt.x-Math.round(txt.width/2));
				scene.location_window.add(txt)
				var txt = new Phaser.GameObjects.BitmapText(scene,183/2,40,"chunky","------------------------").setOrigin(0,0);
				txt.setX(txt.x-Math.round(txt.width/2));
				scene.location_window.add(txt)

				//a quick little function for converting the objects into human-readable strings
				var obj_dump = function(obj,separator="\n",indent="",num=0) {	
					var o = [];
					for(var i in Object.keys(obj)) {
						var key = Object.keys(obj)[i];
						var val = obj[key];
						if(typeof val == "number") {
							var out_val = Phaser.Math.RoundTo(val,-2);
						} else if(typeof val=="object") {						
							if(val.length == 0) {
								var out_val = "[ ]";
							} else {
								var out_val = "[";
								var oo = obj_dump(val,separator,indent+"  ",(+num)+1);
								if(oo.trim()) out_val+="\n"+oo+"\n";
								out_val+=indent+"]";
							}
						} else if(typeof val=="boolean") {
							var out_val = (val)?"Yes":"No";
						} else if(typeof val=="string") {
							var out_val = "\""+val+"\"";
						} else {
							console.log(typeof val);
							var out_val = val;
						}
						o.push(indent+key+": "+out_val);
					}
					return o.join(separator);
				}

				//a reusable function for dumping the variable info
				var info_dump = function(scene) {
					console.log(scene.gamestate);
					console.log(scene.player);
					var info = "";
					info+=String("=").repeat(38)+"\n";
					info+="        CURRENT GAME DATA:\n";
					info+=String("=").repeat(38)+"\n";
					info+="GAMESTATE:"+String.fromCharCode(8).repeat(46)+String.fromCharCode(16).repeat(46)+"\n"; //these weird char codes are part of the font, and allow it to go backwards so it can draw an underline
					info+=obj_dump(scene.gamestate);
					info+="\n"+String("-").repeat(38)+"\n";
					info+="PLAYER:"+String.fromCharCode(8).repeat(46)+String.fromCharCode(16).repeat(46)+"\n";
					info+=obj_dump(scene.player);
					info+="\n"+String("-").repeat(38)+"\n";
					info+="SETTINGS:"+String.fromCharCode(8).repeat(46)+String.fromCharCode(16).repeat(46)+"\n";
					info+=obj_dump(scene.settings);
					info+="\n"+String("=").repeat(38)+"\n";
					return info;
				}
				var info = info_dump(scene);

				//create the scroller
				scene.location_window.scroller = new scene.scrollText({
					scene: scene,
					x: 7,
					y: 50,
					text: info,
					width: 183-14,
					height: 55,
					color: 0x808080,
					parent: scene.location_window
				})
				scene.location_window.add(scene.location_window.scroller)

				var items = [];
				items.push({
					"name": "SAVE GAME",
					"use":function(scene,item,location) {						
						require("./save_game.js")(scene);
					}
				})
				items.push({
					"name": "RESTORE GAME",
					"use":function(scene,item,location) {
						require("./restore_game.js")(scene);
					}
				})
				items.push({
					"name": "GOALS",
					"use": function(scene) {
						require("./goal_progress.js")(scene);
					}
				})
				return items;

			}
		}
		scene.show_location("game_menu",false,menu);

}