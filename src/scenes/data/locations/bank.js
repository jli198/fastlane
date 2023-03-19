
/* 
 * The bank is a place where the player can store money, apply for a loan, and gamble on the 
 * stock market. 
 * 
 * The code below shows how to do the basic deposit/withdraw operations (very simple), and
 * more complexly creates a stockmarket submenu. The fluctuation of stocks is much simpler
 * here than in the real game (they just go up and down with the economy in realtime).
 * 
 * I have not tried to implement the loan system since I am not 100% clear how it works 
 * in the original game (e.g. exactly how it determines when you can get a loan and when you
 * can't and how much money it will loan you).  
 * 
 * Because I haven't implemented the Wild Willy event (YET?), there is no purpose to storing money
 * in the bank. 
 */
module.exports = {
	"id": "bank",
	"name": "Bank",
	"x":  21, "y": 145,
	"x1":8, "y1": 120,
	"x2":67, "y2": 155,
	"image": "place_bank",
	"item_image_x": 0,
	"item_image_y": 57,
	"speech": {
		"image": "speech_bubble_l_t",
		"image_x": 48,
		"image_y": 22,
		"text_x": 71,
		"text_y": 41,
		"mouth": "nariman_jaw",
		"mouth_x": 27,
		"mouth_y": 36,
	},
	"welcomes": [
		"Welcome to the bank, where your money is our money!"
	],
	"jobs": [
		{
			"name": "Janitor",
			"wage": 6,
			"experience": 10,
			"dependability": 20,
			"degrees": [],
			"uniform": "casual"
		},
	],
	"item_color": 0x1F2223,
	"item_offset_y": 2,
	"item_spacing": 14,
	"items": [
		{
			"x": 126,
			"align": "center",
			"name": "Deposit  $100",
			"use": function(scene,item,location) {
				if(scene.player.money>=100) {
					scene.player.money-=100;
					scene.player.bank_money+=100;
					scene.show_message({...location.speech,...{
						"message": "Your money is (*mostly) safe with us!"
					}})
					scene.update_money();
				} else {
					scene.show_message({...location.speech,...{
						"message": "You can't deposit money you don't have."
					}})
				}
			}
		},
		{
			"name": "Withdraw  $100",
			"align": "center",
			"use": function(scene,item,location) {
				if(scene.player.bank_money>=100) {
					scene.player.money+=100;
					scene.player.bank_money-=100;
					scene.show_message({...location.speech,...{
						"message": "Enjoy your money!"
					}})
					scene.update_money();
				} else {
					scene.show_message({...location.speech,...{
						"message": "You can't withdraw money you don't have."
					}})
				}
			}
		},
		{
			"name": "Loan Payment",
			"align": "center",
			"use": function(scene,item,location) {
				scene.show_message({...location.speech,...{
					"message": "You don't have a loan with us (too bad)."
				}})
			},
		},
		{
			"name": "Apply for Loan",
			"align": "center",
			"use": function(scene,item,location) {
				scene.show_message({...location.speech,...{
					"message": "We're not offering loans at the time."
				}})
			},
		},
		{
			"name": "See the Broker",
			"align": "center",
			"use": function(scene,item,location) {
				console.log("stock market");
				if(scene.player.time<1) {
					scene.show_message({...location.speech,...{
						"message": "We're closed now."
					}})
					return;
				}
				scene.subtract_time(1);
				var stock_market = new Phaser.GameObjects.Container(scene,1,1);
				var stock_market_background = new Phaser.GameObjects.Rectangle(scene,0,0,183-2,112-2,0x619ACB).setOrigin(0,0).setInteractive();
				stock_market.add(stock_market_background);
				scene.location_window.add(stock_market);
				
				var box = new Phaser.GameObjects.Rectangle(scene,0.5,0,100.5,15,0xE3BA69).setStrokeStyle(1,0x9A4128).setOrigin(0,0);
				var txt = new Phaser.GameObjects.BitmapText(scene,1,2,"large","INVESTMENTS").setTintFill(0x692028).setOrigin(0,0).setDropShadow(-1,0,0x9A4128);
				box.setX(box.x-Math.round(box.width/2));
				txt.setX(txt.x-Math.round(txt.width/2));
				var bigText = new Phaser.GameObjects.Container(scene,55,5);
				bigText.add(box);
				bigText.add(txt);
				stock_market.add(bigText);

				var txt = new Phaser.GameObjects.BitmapText(scene,140-15,7,"small","Market\nValue",undefined,1).setOrigin(0,0);
				txt.setX(txt.x-Math.round(txt.width/2));
				stock_market.add(txt);

				var txt = new Phaser.GameObjects.BitmapText(scene,175-15,7,"small","Your\nHoldings",undefined,1).setOrigin(0,0);
				txt.setX(txt.x-Math.round(txt.width/2));
				stock_market.add(txt);

				//calculate stock prices
				var stocks = [];
				for(var i in scene.gamestate.stocks) {
					stocks.push({
						"name": scene.gamestate.stocks[i].name,
						"price": Math.min(Math.max(Math.round(scene.gamestate.stocks[i].base*scene.gamestate.economy),scene.gamestate.stocks[i].min),scene.gamestate.stocks[i].max)
					})
				}

				var button_offset_y = 13;
				var button_y = 15+button_offset_y;
				var text_y = 30;
				var text_offset_y = 13;
				var stockButtons = [];
				var holdings = [];
				var selectedStock = undefined;
				for(var i in stocks) {
					var stockRect = new Phaser.GameObjects.Rectangle(scene,0.5,0,100.5,10,0x9ABAE3)
						.setStrokeStyle(1,0x000000)
						.setOrigin(0,0)
						.setInteractive()
						.setData("i",i)
						.on("pointerover",function() {
							var rect = this;
							var txt = this.parentContainer.txt;
							txt.setTintFill(0xa43a22);
							this.setStrokeStyle(1,0xffffff);
						})
						.on("pointerout",function() { 
							var txt = this.parentContainer.txt;
							txt.setTintFill(0x692028); 
							var i = this.getData("i");
							if(selectedStock!=i) {
								this.setStrokeStyle(1,0x000000);
							}
						})
						.on("pointerup", function() {
							var i = this.getData("i");
							selectedStock = i;
							for(var z in stockButtons) {
								if(z==i) {
									stockButtons[z].setStrokeStyle(1,0xffffff);
									stockButtons[z].setFillStyle(0xE3F3FB);
								} else {
									stockButtons[z].setStrokeStyle(1,0x000000);
									stockButtons[z].setFillStyle(0x9ABAE3);
								}
							}
						})
						stockRect.setX(stockRect.x-Math.round(stockRect.width/2));
						
					stockButtons.push(stockRect);
					var stockButtontxt = new Phaser.GameObjects.BitmapText(scene,0,0,"chunky",stocks[i].name).setTintFill(0x692028).setOrigin(0).setDropShadow(-1,0,0x9A4128);
					stockButtontxt.setX(stockButtontxt.x-Math.round(stockButtontxt.width/2));
					var stockButton = new Phaser.GameObjects.Container(scene,54,button_y);
					stockButton.add(stockButtons[stockButtons.length-1]);
					stockButton.txt = stockButtontxt;
					stockButton.add(stockButton.txt);
					stock_market.add(stockButton);
					var txt = new Phaser.GameObjects.BitmapText(scene,113,text_y,"small","$"+stocks[i].price).setOrigin(0,0);
					stock_market.add(txt);

					var holding = 0;
					for(var z in scene.player.stocks) {
						if(scene.player.stocks[z].name==stocks[i].name) {
							holding = scene.player.stocks[z].shares * stocks[i].price;
						}
					}
					holdings.push(new Phaser.GameObjects.BitmapText(scene,150,text_y,"small","$"+holding).setOrigin(0,0));
					stock_market.add(holdings[holdings.length-1]);

					text_y+=text_offset_y;
					button_y+=button_offset_y;
				}

				//remove existing "done" button and replace with a new one that goes back a screen
				var btn_x = scene.location_window.buttons.done.x; //get its position first
				scene.location_window.buttons.done.destroy(); //destroy it
				scene.location_window.add(scene.bottom_button("btn-done",btn_x,function(scene) {
					scene.show_location(location.id,false);
				},location))

				//also get rid of the "work" button if it exists
				if(typeof scene.location_window.buttons.work!="undefined") {
					scene.location_window.buttons.work.destroy(); //destroy it
				}

				scene.location_window.add(scene.bottom_button("btn-buy",6,function(scene) {
					if(typeof selectedStock == "undefined") return false;
					var i = selectedStock;
					var name = stocks[i].name;
					var cost = stocks[i].price;
					if(scene.player.money>=cost) {
						scene.player.money-=cost;
						var holding = cost;
						var hasStock = false;
						for(var z in scene.player.stocks) {
							if(scene.player.stocks[z].name==name) {
								scene.player.stocks[z].shares++;
								holding = cost * scene.player.stocks[z].shares;
								hasStock = true;
							}
						}
						if(!hasStock) {
							scene.player.stocks.push({"name": name,"shares":1})
						}
						scene.update_money();
						holdings[i].setText("$"+holding);
					}
				},location))

				scene.location_window.add(scene.bottom_button("btn-sell",76,function(scene) {
					if(typeof selectedStock == "undefined") return false;
					var i = selectedStock;
					var name = stocks[i].name;
					var cost = stocks[i].price;
					for(var z in scene.player.stocks) {
						if(scene.player.stocks[z].name==name) {
							if(scene.player.stocks[z].shares>0) {
								scene.player.stocks[z].shares--;
								scene.player.money+=cost;
								if(name=="T-BILLS") scene.player.money-=3;
							}
							holding = cost * scene.player.stocks[z].shares;
						}
					}
					scene.update_money();
					holdings[i].setText("$"+holding);
				},location))
			}
		}				
	]

}