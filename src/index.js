import Phaser from 'phaser'; //loads Phaser library

/* now we import all of the different "scenes"...*/
import Preloader from './scenes/Preloader.js'; //Loads assets
import TitleScreen from './scenes/TitleScreen.js'; //Loads our 'title' scene 
import MainScene from './scenes/MainScene.js'; //Loads our 'main' scene 

/* the config object gives some basic info to Phaser */
const config = {
	type: Phaser.AUTO,
	parent: 'phaser',
	width: 320, /* width, in pixels, of the game */
	height: 200, /* height, in pixels, of the game */
	pixelArt: true, /* these settings make it so it isn't blurry */
	antialias: false, /* ditto */
	roundPixels: true, /* if your pixel art seems 'warped' make sure this is true! */ 
	scene: [Preloader,TitleScreen,MainScene], /* this tells it what scenes to include */
};

/* this now creates and starts the game */
const game = new Phaser.Game(config);
