import { Loader } from "phaser"; // This is necessary if we want to show a loading screen


/*
 *	Preloads all assets, and shows progress as it loads them. Anything loaded here doesn't
 *  need to be loaded later.
 */

export default class Preloader extends Phaser.Scene {
	constructor (){
			super("Preloader"); //this is the key so Phaser knows what scene this is
	}
	//if we needed to run something immediately on loading, we'd put it here
	init() {
		console.log('Preloader');
	}

	preload () {
		//load image asset json file, so we know which images to load
		this.load.json("images", "images.json");

	}

	create () {
		//this is where the size of the game is stored
		this.width = this.sys.game.scale.baseSize.width;
		this.height = this.sys.game.scale.baseSize.height;

		//text format for the loading message
		var fmt = {
			fontFamily: "Arial",
			fontSize: "8pt",
			color:"#d0d0d0",
			align:'center'
		};


		//create a progress bar
		this.bar_length = this.width/2;
		this.bar_height = this.height/20;
		this.bar_frame = this.add.rectangle(this.width/2-5,this.height/2-5, this.bar_length+10,this.bar_height+10,undefined,0).setStrokeStyle(2,0xffffff);
		this.bar = this.add.rectangle(this.bar_frame.x-this.bar_length/2,this.bar_frame.y,this.bar_length*0,this.bar_height,0xffffff).setOrigin(0,0.5);
		
		/*
		this.circle_radius = this.height/8;
		this.add.circle(this.width/2,this.height/2,this.circle_radius+4).setStrokeStyle(2,0xffffff);
		this.circle_progress = this.add.graphics();
		*/

		//get the images JSON file that was preloaded, load into a variable
		var images = this.cache.json.get('images');

		//set the assets directories
		var assets_dir = "assets";
		var fonts_dir = "fonts";

		this.load.setPath(assets_dir);

		//add all images from the JSON file into the Phaser loader
		for(var i in images) {
			this.load.image(images[i]);
		}

		//fonts
		this.load.setPath(fonts_dir);
		this.load.bitmapFont('large', 'scitimes_0.png', 'scitimes.fnt');
		this.load.bitmapFont('small', 'scitiny_0.png', 'scitiny.fnt');
		this.load.bitmapFont('lcd', 'tinylcd_0.png', 'tinylcd.fnt');
		this.load.bitmapFont('chunky', 'scichunk_0.png', 'scichunk.fnt');

		//create event to run whenever an asset has been loaded
		this.load.on("progress",function(progress) {
			//note that when we are in a function, "this" means the loader
			//so we have to use this.scene to reference the original scene
			//that we referenced with "this" before. phew!
			
			//update the progress bar
			this.scene.bar.width = this.scene.bar_length*progress;

			/*
			//update the progress circle
			var angle = 360*progress;
			this.scene.circle_progress.clear();
			this.scene.circle_progress.fillStyle(0xec1730,1);
			this.scene.circle_progress.slice(this.scene.width/2,this.scene.height/2,this.scene.circle_radius,-90*Phaser.Math.DEG_TO_RAD,(angle-90)*Phaser.Math.DEG_TO_RAD);
			this.scene.circle_progress.fillPath();
			*/

		})

		//create an event to run when all assets loaded
		this.load.on('complete', function () {
			this.scene.scene.start("MainScene"); //now start the scene
		})

		//having told it what to do, start the loader!
		this.load.start();

	}
}

