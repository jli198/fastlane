
//creates buttons on the bottom of the location_window
module.exports = function(scene,img,x,onclick,location,ignore_modal = false){
		var y = 109;
		var btn = new Phaser.GameObjects.Image(scene,x,y,img)
		.setOrigin(0)
		.setDepth(100)
		.setInteractive()
		.setData("ignore_modal",ignore_modal)
		.setData("beingclicked",false)
		.on("pointerdown",function(e) {
			if(this.scene.player.modal && !ignore_modal) return false;
			if(typeof this.getData("x") == "undefined") {
				this.setData("x",this.x);
				this.setData("y",this.y);
			}
			this.setX(this.getData("x")+1).setY(this.getData("y")+1);
			this.setData("beingclicked",true);
		})
		.on("pointerout",function(e) { 
			if(this.scene.player.modal && !ignore_modal) return false;
			if(this.getData("beingclicked")) {
				this.setX(this.getData("x")).setY(this.getData("y"));
			}
		})
		.on("pointerover",function(e) { 
			if(typeof this.getData("x") == "undefined") {
				this.setData("x",this.x);
				this.setData("y",this.y);
			}
			if(this.scene.player.modal && !ignore_modal) return false;
			if(e.buttons==1) {
				this.setData("beingclicked",true);
			} else {
				this.setData("beingclicked",false);
			}
			if(this.getData("beingclicked")) {
				this.setX(this.getData("x")+1).setY(this.getData("y")+1);
			} 
		})
		.on("pointerup",function(e) {
			if(this.scene.player.modal && !ignore_modal) return false;
			if(this.getData("beingclicked")) {
				this.setX(this.getData("x")).setY(this.getData("y"));
				this.setData("beingclicked",false);
				if(typeof onclick=="function") onclick(this.scene,location);
			} 
		})
		return btn;

	}