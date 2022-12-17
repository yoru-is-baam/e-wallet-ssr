var mongoose = require("mongoose");
var fn = require("../utility/function");
const moment = require("moment-timezone");
const dateAsia = moment.tz(Date.now(), "Asia/Bangkok");

var transferHistorySchema = mongoose.Schema({
	recipientPhone: {
		type: String,
		required: true,
	},
	note: {
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
	fee: {
		type: Number,
		required: true,
	},
	sidePayFee: {
		type: String,
		required: true,
	},
	otp: {
		type: Number,
		required: true,
		default: fn.generateOtp(6),
	},
	status: {
		type: String,
		required: true,
	},
	time: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	date: {
		type: String,
		required: true,
		default: dateAsia.toString(),
	},
});

var TransferHistory = mongoose.model(
	"transfer_histories",
	transferHistorySchema
);

module.exports = TransferHistory;
