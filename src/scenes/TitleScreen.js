/*
 *	This is just an example scene. In a real game or simulation, there would
 *  like be many different 'scenes'. A scene is basically any self-contained
 *  part of the game with some kind of visual output. They work by extending
 *  the defult Phaser.Scene object. Note that where it says "MainScene"
 *  below could be the name of any scene, so long as it is initially referenced
 *  in index.js.
 */

export default class TitleScreen extends Phaser.Scene {
    constructor () {
        super("TitleScreen");
    }

		//if we needed to run something immediately on loading, we'd put it here
		init() {
      console.log('TitleScreen');
		}

		//if we needed anything to preload, we'd put it here
		preload() {

		}

		//is meant to create everything the scene needs to run
    create () {

			//set the slogan -- change this!
			var stevensSlogan = "The Innovation University®";

			//create a background image from the asset 'stevens-campus-8bit'
			//we are setting it at position 0,0, and telling it with setOrigin(0) that this
			//is the top left of the image. we are also setting its alpha property to 0
			var background = this.add.image(0, 0, 'stevens-campus-8bit').setOrigin(0).setAlpha(0)
				.setInteractive()
				.on("pointerup",function() {
					this.scene.scene.start("MainScene");
				})

			//tweens are animations -- here we are saying, make the alpha property
			//of the background be equal to 1.0, and take 500 ms for this, and
			//start immediately (0 delay)
			this.tweens.add({
				targets: [background],
				alpha: 1.0,
				delay: 0,
				duration: 500
			})

			//create the textWelcome images
			var textWelcome = this.add.image(118,-17,'welcome-to').setDepth(10).setOrigin(0).setVisible(true)

			//another tween -- this one moves the welcome text down
			//by adjusting the y property
 			this.tweens.add({
				targets: [textWelcome],
				delay: 600,
				duration: 1000,
				y: 70
			})

			//create the "Stevens" signature image
			var stevensSig = this.add.image(31,56,"stevens-sig").setOrigin(0,0);
			stevensSig.setCrop(0,0,0,stevensSig.height); //set the crop to be the height of the image, but no width

			var cropObj = {width:0}; //create an object to manipulate the tween of
			this.tweens.add({
				targets: [cropObj],
				delay: 1600,
				duration: 1000,
				width: stevensSig.width, //max width of image
				onUpdate: function() {
					stevensSig.setCrop(0,0,cropObj.width,174) //set the crop
				}
			})

			//format text for slogan
			var fmt = {
				fontFamily: "Times New Roman",
				fontSize: "14pt",
				align: "center",
				color: "#ffffff",
				fontStyle: "italic"
			}

			//create the text objects off screen

			var tagLine = this.add.bitmapText(320/2,200+15,"chunky",stevensSlogan).setDropShadow(1,1,0x992a44,1.0).setTintFill(0xffffff).setOrigin(0.5,0).setDepth(10);

			//and move them up once the right amount of time has passed so that the
			//signature is revealed.
			this.tweens.add({
				targets: [tagLine],
				delay: 2100,
				duration: 1500,
				y: 145,
				onComplete() {
					var scene = this.parent.scene;
					//once this has sat here for a few seconds, fade out and move to MainScene
					var fader = scene.add.rectangle(0,0,320,200,0x000000).setOrigin(0,0).setDepth(1000).setAlpha(0);
					scene.tweens.add({
						targets: [fader],
						alpha: 1.0,
						delay: 1000,
						duration: 500,
						onComplete() {
							var scene = this.parent.scene;
							scene.scene.start("MainScene")
						}
					})
				}
			})
    }
}
