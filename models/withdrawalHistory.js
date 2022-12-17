var mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateAsia = moment.tz(Date.now(), "Asia/Bangkok");

var withdrawalHistorySchema = mongoose.Schema({
	cardNumber: {
		type: String,
		required: true,
	},
	accountId: {
		type: String,
		required: true,
	},
	note: {
		type: String,
		required: true,
	},
	money: {
		type: Number,
		required: true,
	},
	fee: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		required: true,
	},
	date: {
		type: String,
		required: true,
		default: dateAsia.toString(),
	},
});

var WithdrawalHistory = mongoose.model(
	"withdrawal_histories",
	withdrawalHistorySchema
);

module.exports = WithdrawalHistory;
