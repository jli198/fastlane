
/* 
 * The bank is a place where the player can store money, apply for a loan, and gamble on the 
 * stock market. I have not implemented it here yet. I don't think it would require any
 * additional systems than already exist to make it work (it would require making a submenu
 * for the stockmarket like the Rent Office does for its jobs, but that is not that hard other
 * than the tedium of coding the buttons and so on). 
 * Because I haven't implemented the Wild Willy event, there is no purpose to storing money
 * in the bank. The loan system could be useful though I never use it.
 */
module.exports = {
	"id": "bank",
	"name": "Bank",
	"x":  21, "y": 145,
	"x1":8, "y1": 120,
	"x2":67, "y2": 155,
	"jobs": [
		{
			"name": "Janitor",
			"wage": 6,
			"experience": 10,
			"dependability": 20,
			"degrees": [],
			"uniform": "casual"
		},
	]
}