var mongoose = require("mongoose");
const moment = require("moment-timezone");
const dateAsia = moment.tz(Date.now(), "Asia/Bangkok");

var rechargeHistorySchema = mongoose.Schema({
	cardNumber: {
		type: String,
		required: true,
	},
	accountId: {
		type: String,
		required: true,
	},
	money: {
		type: Number,
		required: true,
	},
	date: {
		type: String,
		required: true,
		default: dateAsia.toString(),
	},
});

var RechargeHistory = mongoose.model(
	"recharge_histories",
	rechargeHistorySchema
);

module.exports = RechargeHistory;
