
/* 
 * This code generates a fresh list of assets. This needs to be run OUTSIDE of Phaser -- such as
 * in webpack/base.js. This is because Phaser's packed form does not have access to 
 * the `fs` module for reading and writing files.
 * 
 * Requires a valid options object with the following properties:
 * 
 *  assets_path: path to where assets are stored
 *  asset_file: json file to generate (required if write_file is not false)
 *  asset_extensions: valid extensions for assets (array of strings), e.g. [".png",".jpg",".jpeg"]
 *	write_file: whether to write to a file or not (optional, default: true) -- if false, will 
 *							return the list of assets as an array.
 * 
 * Note that this writes ONE file for ONE directory. So if you wanted to do multiple
 * subdirectories you'd need to run it more than once and generate multiple files, or have
 * it return a bunch of arrays that you'd then write to your own file.
 * 
*/

module.exports = function(options){
	const fs = require('fs');
	const path = require("path");
	var assets = [];
	var files = fs.readdirSync(options.assets_path);
	files.forEach(file => {
		if(options.asset_extensions.indexOf(path.extname(file).toLowerCase())>-1) {
			assets.push(file.substr(0,file.length-path.extname(file).length));
		}
	});
	var write_file = (typeof options.write_file == "undefined"?true:options.write_file);
	if(write_file) {
		fs.writeFileSync(options.asset_file,JSON.stringify(assets));
		console.log(options.asset_file+" written");
	}
	return assets;
}