
/* 
 * The university is a place where education is acquired.
 * This is complicated for two reasons: 
 * 		1. you don't just "buy" education, you make "progress" in it after "enrolling" in a course.
 *    2. the game uses a totally different appearance (books) for this versus other items.
 * But as such it is a nice example of how flexible this system can be.
 * This location object has a property called `degrees` that is only used by the code inside
 * this particular module. What it does is it builds the menu of items based on what degrees
 * the player already has (in scene.player.degrees), and what progress they have made in them.
 * The `degrees` property has all of the prerequisites in it in its `required` field (in the
 * original Jones game, there can only be one prereq for each degree, so I've implemented that
 * here, but you could imagine a slight rework that would allow multiple prereqs, storing it
 * as an array). 
 * The menu is built up through custom objects -- each menu item is a container with an image
 * of a book in it, a text object with the degree name, and a text object with the progress
 * level. 
 * There is also a custom button, ENROLL, which adds an "Enrollment Receipt" into the inventory.
 * This is "spent" whenever they start a new course. (It probably ought to check if there are
 * any courses yet to take before even creating to ENROLL button, but it doesn't.)
 * Note that the ENROLL button is one of the few popup speech bubbles that uses the `choices`
 * property to prompt the player to say "Yes" or "No" to enrolling (the Rent Office also does this).
*/
module.exports = {
	"id": "library",
	"name": "Stefan Librotorium",
	"x": 220, "y": 180,
	"x1":190, "y1": 156,
	"x2":251, "y2": 193,
	"image": "place_university",
	"item_image_x": 0,
	"item_image_y": 57,
	"speech": {
		"image": "speech_bubble_l_t",
		"image_x": 49,
		"image_y": 20,
		"text_x": 71,
		"text_y": 41,
		"mouth": "nariman_jaw",
		"mouth_x": 28,
		"mouth_y": 36,
	},
	"jobs": [
		{
			"name": "Library Assistant",
			"wage": 5,
			"experience": 10,
			"dependability": 10,
			"degrees": [],
			"uniform": "casual"
		},
		{
			"name": "Tutor",
			"wage": 11,
			"experience": 40,
			"dependability": 50,
			"degrees": [],
			"uniform": "dress"
		},
		{
			"name": "Librarian",
			"wage": 20,
			"experience": 50,
			"dependability": 60,
			"degrees": ["Bach Arts"],
			"uniform": "dress"
		},
	],
	"welcomes": [
		"Welcome to Innovation Institute, where innovation was invented!",
		"Welcome to Innovation Institute, where the Innovation Burger was invented!",
		"Welcome to Innovation Institute! Inspired by innovation, powered by money!",
		"Welcome to Innovation Institute! Will you be paying with cash or credit?",
		"Welcome to Innovation Institute! Nevermind your grades, how high is your credit score?",
	],
	"degrees": [ //this has no intrinsic meaning, but is used by items functions below
		
    {name: "Bach Eng", longname: "Bachelors of Engineering", requires:false},
    {name: "Bach CS", longname: "Bachelors in Computer Science", requires:false},
    {name: "Bach Business", longname: "Bachelors in Business", requires:false},
    {name: "Bach Arts", longname: "Bachelors in Liberal Arts", requires:false},
    {name: "MBA", longname: "Masters in Business Administration", requires: ["Bach Eng","Bach CS", "Bach Business"]},
    {name: "M Eng", longname: "Masters in Engineering", requires:["Bach Eng", "Bach CS"]},
    {name: "M CS", longname: "Masters in Computer Science", requires: ["Bach Eng", "Bach CS", "Bach Business", "Bach Liberal Arts"]},
    {name: "M Liberal Arts", longname: "Masters in Liberal Arts", requires: "Bach Arts"}
    /*
    {name:"Jr. College", longname:"Junior College", requires:false},
		{name:"Trade Sch.", longname:"Trade School", requires:false},
		{name:"Bus. Admin", longname:"Business Admin",requires: ["Jr. College", "Trade Sch."]},
		{name:"Academic", longname:"Academic",requires:"Jr. College"},
		{name:"Electronics",longname:"Electroncs", requires:"Trade Sch."},
		{name:"Pre-Engineer.", longname:"Pre-Engineering",requires:"Trade Sch."},
		{name:"Grad School", longname:"Graduate School",requires:"Academic"},
		{name:"Engineering",longname:"Engineering",requires:"Pre-Engineer"},
		{name:"Post-Doc",longname:"Post-Doctoral",requires:"Grad School"},
		{name:"Research", longname:"Research",requires:"Post-Doc"},
		{name:"Publishing", longname: "Publishing", requires:"Research"}
    */
	],
	"items": function(scene,location) {
		//create the degree list -- heavily customized from default behavior!
		var degrees = location.degrees;
		var items = [];

		//textures of book image
		var book_imgs = ["book_green","book_blue","book_red","book_gray"];
		var cur_book = 0;

		//for each degree
		for(var i in degrees) {
			var degree = degrees[i];
      var has_requirements = false;
      if(Array.isArray(degree.requires)) {
        for(var z in degree.requires) {
          if(scene.player.degrees.includes(degree.requires[z])) {
            has_requirements = true;
          }
        }
      } else if(degree.requires!==false) {
        if(scene.player.degrees.includes(degree.requires)) {
          has_requirements = true;
        }
      } else if(degree.requires==false) {
        has_requirements = true;
      }
			if(
				//check if the degree should be displayed 
				(has_requirements &&
				(!scene.player.degrees.includes(degree.name)))
			) {	
				//if it is to be displayed, make a container with the book image and text
				var book = new Phaser.GameObjects.Container(scene,0,0);
				var book_graphic = new Phaser.GameObjects.Image(scene,0,0,book_imgs[cur_book]).setOrigin(0,0).setDepth(10)
				book.add(book_graphic);
				book.degreeName = new Phaser.GameObjects.BitmapText(scene,2,9,"chunky",degree.name).setOrigin(0).setDepth(100)
				book.add(book.degreeName);
				var enrolled = scene.player.enrolled.map(function(e) { return e.name; }).indexOf(degree.name);
				if(enrolled>-1) {
					if(scene.player.enrolled[enrolled].remaining<10) {
						book.degreeRemaining = new Phaser.GameObjects.BitmapText(scene,81,9,"chunky",scene.player.enrolled[enrolled].remaining).setOrigin(0).setDepth(100);
						book.add(book.degreeRemaining)
					}
				}	
				book.width = book_graphic.width;
				book.height = book_graphic.height;
				//then push this container to the item list
				items.push({
					"name": degree.name,
					"object": book,
					"hitbox": function(scene,item,location) {	
						//setting a custom hitbox based on the book graphic locations
						//item._item_y is set dynamically after the y position is calculated
						return {"x":70,"y":item._item_y,"width":book_graphic.width,"height":book_graphic.height,"originX":0,"originY":0}
					},
					"x": 70,
					"hover": function(hover,obj) {
						obj.degreeName.setTintFill(hover?0xf0f0f0:0x000000);
						if(typeof obj.degreeRemaining!="undefined") obj.degreeRemaining.setTintFill(hover?0xf0f0f0:0x000000);
					},
					"use": function(scene,item,location) {
						//called if they click on this item
						var enrolled = scene.player.enrolled.map(function(e) { return e.name; }).indexOf(item.name);
						var degree = location.degrees[location.degrees.map(function(e) { return e.name; }).indexOf(item.name)];
						//if they are enrolled, continue their progress
						if(enrolled>-1) {
							if(scene.player.time>=1) {
								var remaining = scene.player.enrolled[enrolled].remaining;
								remaining--;
								scene.subtract_time(6);
                
                // Happiness Score Depends on Degree
                if(scene.player.degrees.includes('Bach Eng')) {
                  scene.player.happiness -= 5;
                }
                if(scene.player.degrees.includes('Bach CS')) {
                  scene.player.happiness -= 7;
                }
                if(scene.player.degrees.includes('Bach Business')) {
                  scene.player.happiness -= 3;
                }
                if(scene.player.degrees.includes('Bach Arts')) {
                  scene.player.happiness -= 1;
                }

                if(scene.player.degrees.includes('MBA')) {
                  scene.player.happiness -= 3;
                }
                if(scene.player.degrees.includes('M Eng')) {
                  scene.player.happiness -= 7;
                }
                if(scene.player.degrees.includes('M CS')) {
                  scene.player.happiness -= 5;
                }
                if(scene.player.degrees.includes('M Liberal Arts')) {
                  scene.player.happiness -= 1;
                }
                
								if(remaining==0) {
									scene.player.enrolled.splice(enrolled,1);
									scene.player.degrees.push(degree.name);
									scene.player.dependability+=5;
									//diploma message
									scene.show_message({
										fade_in: true,
										fade_delay: 800,
										message: degree.longname,
										font: "chunky",
										text_y: 75,
										text_x: 90,
										image: "message_degree",
										image_x: 0,
										image_y: 0,
										close_by_clicking: false,
										args: location,
										callback: function(scene,location) {
											console.log(location);
											scene.show_location(location.id,false);		
										}
									});
								} else {
									scene.player.enrolled[enrolled].remaining = remaining;
									scene.show_location(location.id,false);		
								}
							} else {
								scene.show_message({...location.speech,...{
									message: "There is not enough time to study."
								}});
							}
						} else { //if not enrolled, see if they can enroll
							if(scene.inventory_has_item("Enrollment receipt")) {
								if(scene.player.time>=1) {
									scene.inventory_remove_item("Enrollment receipt");
									scene.player.enrolled.push({"name":degree.name,"remaining":9});

									scene.subtract_time(6);
									scene.show_location(location.id,false);		
								} else {
									scene.show_message({...location.speech,...{
										message: "There is not enough time to study."
									}})
								}
							} else {
								scene.show_message({...location.speech,...{
									message: "You are not enrolled in this course."
								}});
							}
						}
					}
				})
				cur_book++; //advances colors of books
				if(cur_book>=book_imgs.length) cur_book = 0;
			}
		}
		//now return the item list (phew)
		return items;
	},
	"item_spacing": -13, //make them list from bottom to top
	"item_offset_y": 54,
	"buttons": [
		{	//ENROLL button
			"image": "btn-enroll",
			"onclick": function(scene,location) {
				//process "Enrollment receipt" purchase if possible
				if(scene.inventory_has_item("Enrollment receipt")) {
					scene.show_message({...location.speech,...{
						message: "You are already enrolling, pick the class to enroll in."
					}});
					return false;
				}
				var fee = Math.round(50,scene.gamestate.economy); //enrollment base fee is $50
				scene.show_message({...location.speech,...{
					message: "The enrollment fee is $"+fee+". Would you like to enroll?\n ",
					choices: [
					{ option:"Yes", 
						onclick: function(scene) {
							if(scene.player.money<fee) {
								scene.show_message({...location.speech,...{
									message: "You don't have enough money for the fee."
								}});
							} else {
								scene.inventory_add_item("Enrollment receipt");
								scene.player.money-=fee;
								scene.update_money();
							}
						}
					},
					{ option:"No" }
				]
				}});
			}
		}
	],			
}