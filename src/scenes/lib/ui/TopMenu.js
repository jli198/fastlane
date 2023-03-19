/* 
 * A very simple class for creating a Sierra-DOS style menu that pops up at the top of the screen.
 * Currently triggered by putting the mouse up at the top edge and holding down the pointer,
 * but could be set to be shown manually, maybe.
 * Requires a configuration object that currently accepts:
 * 	`scene`: the current Phaser scene (required)
 *  `menu`: an object containing the menu data
 * 
 *  TO DO - would be nice to have it display hotkeys in a right-aligned way. Right now they
 *  				exist, but silently so. To do this would be tricky because it would require modifying the 
 * 					width of the menus after the fact. 
 * 
 */

export default class TopMenu extends Phaser.GameObjects.GameObject {
	constructor(scene, config) {
		super(scene);
		this.scene = scene;
		this.config = config;
		var defaults = {
			menu: [],
			hitsize: 6,
			font: "chunky",
			lineheight: 14,
			container_x: -1,
			container_y: -1,
			background: 0xffffff,
			text: 0x000000,
			background_hover: 0x000000,
			disabled: 0xa0a0a0,
			text_hover: 0xffffff,	
			modal_background: 0x000000,
			modal_alpha: 0.5,
			menu_text_indent: 4,
			menu_text_trailing: 15,
		}

		//add all to the config
		for(var i in Object.keys(defaults)) {
			var k = Object.keys(defaults)[i];
			if(typeof config[k] == "undefined") {
				config[k] = defaults[k];
			} 
		}

		this.draw();
	}

	draw() {
		var sceneWidth = this.scene.sys.game.scale.baseSize.width;
		var sceneHeight = this.scene.sys.game.scale.baseSize.height;
		var scene = this.scene;

		//destroy any existing menus
		if(typeof this.menu!="undefined") this.menu.destroy();
		this.scene.add.existing(this);

		//create menu bar container -- this is always around. note its origin should be just offscreen so its stroke is hidden.
		this.menu = this.scene.add.container(this.config.container_x,this.config.container_y).setDepth(1000);

		//this is an invisible screen-size rectangle that catches any clicks outside of the menus while menus displayed
		this.menu_all_clicker = new Phaser.GameObjects.Rectangle(scene,0,0,sceneWidth,sceneHeight,this.config.modal_background,this.config.modal_alpha).setDepth(999).setOrigin(0,0).setInteractive()
			.setData("menuObj",this)
			.on("pointerup",function() {
				var menuObj = this.getData("menuObj");
				menuObj.hide();
			})
			.on("pointermove",function(pointer) {
				//this happens if mouse leaves game window and then comes back to it
				var menuObj = this.getData("menuObj");
				if(!pointer.isDown) {
					menuObj.hide();
				}
			})
			.setVisible(false);
		this.menu.add(this.menu_all_clicker);
			
		//this is the area where holding down the mouse button will open the menu
		//note that the hitsize determines how "sensitive" this is
		this.menu_clicker = new Phaser.GameObjects.Rectangle(scene,0,0,sceneWidth+2,this.config.hitsize).setOrigin(0,0).setInteractive().setDepth(998).setFillStyle(0xff0000,0.0)
			.setData("menuObj",this)
			.on("pointerdown",function() {
				var menuObj = this.getData("menuObj");
				menuObj.show();
		})
		this.menu.add(this.menu_clicker); 

		//create the menu bar itself, which is initially hidden
		this.menu_bar = new Phaser.GameObjects.Container(scene,0,0).setVisible(false);
		this.menu_bar_rect = new Phaser.GameObjects.Rectangle(scene,0,0,sceneWidth+2,this.config.lineheight,this.config.background).setOrigin(0,0).setStrokeStyle(1,0x000000).setInteractive()
			.setData("menuObj",this)
			.on("pointerup",function() {
				//mouse up over the non-menu part of menu
				var menuObj = this.getData("menuObj");
				menuObj.hide();
			})
			.on("pointerover",function(pointer) {
				//movement over parts of the menu without objects
				var menuObj = this.getData("menuObj");
				if(pointer.isDown) {
					menuObj.submenu = false;
					menuObj.update();
				} else {
					menuObj.hide();
				}
			})

		this.menu_bar.add(this.menu_bar_rect);
		this.menu.add(this.menu_bar);

		//flags for the current submenu items
		this.submenu = false;

		//create the menu 
		var mx = 10;
		var my = 1;
		var menu_head = [];
		var m = 0;
		var menu_space = 5;
		var menu_config = this.config.menu;
		this.menu_head = menu_head;
		for(var i in menu_config) {
			menu_head[m] = {};
			menu_head[m].text = new Phaser.GameObjects.BitmapText(scene,mx,my,this.config.font," "+menu_config[i].text+" ").setOrigin(0,0)
			menu_head[m].submenu = new Phaser.GameObjects.Container(scene,mx-2,my+1).setVisible(false);
			var sub_y = 12;
			var sub_max_width = 0;
			menu_head[m].submenus = [];
			var hotkeys = [];
			for(var z in menu_config[i].options) {
				var subm = menu_config[i].options[z];

				//handle hotkeys -- this is pretty complicated because
				//Phaser stores all key presses in a universal keyboard manager object
				//and you can't assign data to it. the workaround here is to create
				//a unique index for the key combination and then check an array
				//of functions with the same index. seems to work.
				if(typeof subm.hotkey != "undefined" && subm.hotkey!==false) {
					var ctrl = (typeof subm.hotkey.ctrl=="undefined")?false:(subm.hotkey.ctrl);
					var alt = (typeof subm.hotkey.alt=="undefined")?false:(subm.hotkey.alt);
					var meta = (typeof subm.hotkey.meta=="undefined")?false:(subm.hotkey.meta);
					var shift = (typeof subm.hotkey.shift=="undefined")?false:(subm.hotkey.shift);
					hotkeys.push(scene.input.keyboard.on("keydown-"+subm.hotkey.key,function(event) {
						if(event.ctrlKey==ctrl && event.altKey == alt && event.shiftKey == shift && event.metaKey == meta) {
							var event_key = event.key.toUpperCase()+"_"+(event.ctrlKey?1:0)+(event.altKey?1:0)+(event.shiftKey?1:0)+(event.metaKey?1:0);
							if(typeof this.onclick !=="undefined") {
								if(typeof this.onclick[event_key]=="function") this.onclick[event_key](scene);
								event.stopPropagation();
							}
						}
					}))
					var event_key = subm.hotkey.key.toUpperCase()+"_"+(ctrl?1:0)+(alt?1:0)+(shift?1:0)+(meta?1:0);
					if(typeof subm.onclick=="function")	{
						if(typeof hotkeys[hotkeys.length-1].onclick == "undefined"){
							hotkeys[hotkeys.length-1].onclick = {};
						}
						hotkeys[hotkeys.length-1].onclick[event_key]=  menu_config[i].options[z].onclick;
					}
				}

				if(typeof subm.separator != "undefined" && subm.separator==true) {					
					var submenu_item = new Phaser.GameObjects.BitmapText(scene,this.config.menu_text_indent,sub_y-3,this.config.font,String(".").repeat(1))
						.setOrigin(0,0).setDepth(1)
						.setData("separator",true)				
						.setData("disabled",true);						
					sub_y+=8;
				} else {
					var submenu_item = new Phaser.GameObjects.BitmapText(scene,this.config.menu_text_indent,sub_y+1,this.config.font,menu_config[i].options[z].text)
						.setOrigin(0,0).setDepth(1)
						.setData("separator",false)
						.setData("disabled",typeof subm.disabled=="undefined"?false:subm.disabled);
					if(submenu_item.width+this.config.menu_text_indent>sub_max_width) sub_max_width = submenu_item.width+this.config.menu_text_indent;
					sub_y+=12;
				}
				menu_head[m].submenus.push(submenu_item);
			}
			menu_head[m].submenu.add(new Phaser.GameObjects.Rectangle(scene,0,12,sub_max_width+this.config.menu_text_trailing+1,sub_y-10,this.config.background).setOrigin(0,0).setStrokeStyle(1,0x000000).setDepth(0));

			var sub_y = 11;
			menu_head[m].hitboxes = [];
			for(var z in menu_head[m].submenus) {
				var subm = menu_head[m].submenus[z];
				if(subm.getData("separator")) {					
					sub_y+=8;
					var repeat = 1;
					//this is a somewhat clunky way to make the separator line dynamic in length to fit the space
					while(subm.width+this.config.menu_text_indent<sub_max_width+this.config.menu_text_trailing-this.config.menu_text_indent) {
						repeat++;
						subm.setText(String(".").repeat(repeat))
					}
					repeat--; //last one will overshoot
					subm.setText(String(".").repeat(repeat--))
					var hitbox = new Phaser.GameObjects.Rectangle(scene,0,sub_y-3,sub_max_width+this.config.menu_text_trailing,13,this.config.background).setOrigin(0,0)
					.setInteractive()
					.setData("menuObj",this)
					.setData("head",m)
					.setData("sub",z)
					.on("pointerup",function() {
						var menuObj = this.getData("menuObj");					
						menuObj.hide();
					})
					.on("pointerover",function(pointer) {
						var menuObj = this.getData("menuObj");
						var head = this.getData("head");
						if(pointer.isDown) {
							menuObj.submenu = [head];
						} else {
							menuObj.submenu = false;
						}
						menuObj.update();
					})					

				} else if(subm.getData("disabled")) {
					var hitbox = new Phaser.GameObjects.Rectangle(scene,0,sub_y+2,sub_max_width+15,13,this.config.background).setOrigin(0,0)
					.setInteractive()
					.setData("menuObj",this)
					.setData("head",m)
					.setData("sub",z)
					.on("pointerup",function() {
						var menuObj = this.getData("menuObj");					
						menuObj.hide();
					})
					.on("pointerover",function(pointer) {
						var menuObj = this.getData("menuObj");
						var head = this.getData("head");
						if(pointer.isDown) {
							menuObj.submenu = [head];
						} else {
							menuObj.submenu = false;
						}
						menuObj.update();
					})
					sub_y+=12;
				} else {
					var hitbox = new Phaser.GameObjects.Rectangle(scene,0,sub_y+2,sub_max_width+15,13,this.config.background).setOrigin(0,0)
						.setInteractive()
						.setData("menuObj",this)
						.setData("head",m)
						.setData("sub",z)
						.on("pointerup",function() {
							var menuObj = this.getData("menuObj");					
							var head = this.getData("head");
							var sub = this.getData("sub");
							menuObj.hide();
							menuObj.click(head,sub);
						})
						.on("pointerover",function(pointer) {
							//over a submenu
							var menuObj = this.getData("menuObj");					
							var head = this.getData("head");
							var sub = this.getData("sub");
							if(pointer.isDown) {
								menuObj.submenu = [head,sub];
							} else {
								menuObj.submenu = false;
							}
							menuObj.update();
						})
					sub_y+=12;
				}
				menu_head[m].hitboxes.push(hitbox);
				menu_head[m].submenu.add(menu_head[m].hitboxes[menu_head[m].hitboxes.length-1]);
				menu_head[m].submenu.add(menu_head[m].submenus[z]);
			}

			this.menu_bar.add(menu_head[m].submenu);
			//hitbox for the top menu items
			menu_head[m].hitbox = new Phaser.GameObjects.Rectangle(scene,mx-2,my,menu_head[m].text.width+menu_space,13).setOrigin(0,0)
			.setInteractive()
			.setData("m",m)
			.setData("menuObj",this)
			.on("pointerup",function() {
				var menuObj = this.getData("menuObj");
				menuObj.hide();
			})
			.on("pointerdown",function() {
				//clicking on the menu bar, not a submenu
				var menuObj = this.getData("menuObj");
				var m = this.getData("m");
				menuObj.submenu = [m];
				menuObj.update();
			})
			.on("pointerover",function(pointer) {
				//movement over a menu item
				var menuObj = this.getData("menuObj");
				if(pointer.isDown) { 
					this.emit("pointerdown"); //trigger other event to avoid duplication
				} else {
					menuObj.hide(); 
				}
			})

			mx+=menu_head[m].text.width+menu_space;
			this.menu_bar.add(menu_head[m].hitbox);
			this.menu_bar.add(menu_head[m].text);
			m++;
		}
	}

	//show the menu
	show() {
		this.menu_all_clicker.setVisible(true);
		this.menu_bar.setVisible(true);
		if(typeof this.config.onshow == "function") {
			this.config.onshow(this.config.scene);
		}
	}
	
	//hide the menu
	hide() {
		this.menu_bar.setVisible(false);
		this.menu_all_clicker.setVisible(false);
		if(typeof this.config.onhide == "function") {
			this.config.onhide(this.config.scene);
		}
	}
	
	//called when they click something
	click(head,sub) {
		if(typeof this.config.menu[head].options[sub].onclick=="function") {
			this.config.menu[head].options[sub].onclick(this.config.scene,this.submenu);
		}
	}

	//update the visible status of the menu
	update() {
		if(this.submenu === false){
			var head = -1;
			var sub = -1;
		} else {
			var head = this.submenu[0];
		}
		if(typeof this.submenu[1]=="undefined") {
			var sub = -1;
		} else{
			var sub = this.submenu[1];
		}
		//need to make this check if they are selectable
		for(var i in this.menu_head) {
			var selected_head = (i==head);
			this.menu_head[i].submenu.setVisible(selected_head);
			this.menu_head[i].hitbox.setFillStyle(selected_head?this.config.background_hover:this.config.background);
			this.menu_head[i].text.setTintFill(selected_head?this.config.text_hover:this.config.text);
			for(var z in this.menu_head[i].submenus) {
				var selected_sub = (z==sub);
				var selected = (selected_head&&selected_sub);
				this.menu_head[i].hitboxes[z].setFillStyle(selected?this.config.background_hover:this.config.background);
				if(this.menu_head[i].submenus[z].getData("disabled")) {
					this.menu_head[i].submenus[z].setTintFill(this.config.disabled);		
				} else {
					this.menu_head[i].submenus[z].setTintFill(selected?this.config.text_hover:this.config.text);				
				}
			}
		}
		if(typeof this.config.onupdate=="function") {
			this.config.onupdate(this.config.scene,this.submenu);
		}
	}


}