var mongoose = require("mongoose");

var cardSchema = mongoose.Schema({
	cardNumber: {
		type: String,
		required: true,
		unique: true,
	},
	expirationDate: {
		type: String,
		required: true,
	},
	cvv: {
		type: String,
		required: true,
	},
	note: {
		type: String,
		required: true,
	},
});

var Card = mongoose.model("cards", cardSchema);

var cards = [
	{
		cardNumber: "111111",
		expirationDate: "2022-10-10",
		cvv: "411",
		note: "There is no limit to the number of recharges and the amount of each deposit",
	},
	{
		cardNumber: "222222",
		expirationDate: "2022-11-11",
		cvv: "443",
		note: "There is no limit to the number of recharges but can only be loaded up to 1 million/time",
	},
	{
		cardNumber: "333333",
		expirationDate: "2022-12-12",
		cvv: "577",
		note: "When you top up with this card, you will always receive a message that 'card is out of money'",
	},
];

cards.forEach(async (card) => {
	try {
		let cardInDB = await Card.findOne({ cardNumber: card.cardNumber });

		if (!cardInDB) {
			let cardDocument = new Card({
				cardNumber: card.cardNumber,
				expirationDate: card.expirationDate,
				cvv: card.cvv,
				note: card.note,
			});

			await cardDocument.save();
		}
	} catch (error) {
		console.error(error);
	}
});

module.exports = Card;
