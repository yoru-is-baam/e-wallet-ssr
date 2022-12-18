var mongoose = require("mongoose");

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
	},
	status: {
		type: String,
		required: true,
	},
	time: {
		type: Date,
		required: true,
	},
	date: {
		type: String,
		required: true,
	},
});

var TransferHistory = mongoose.model(
	"transfer_histories",
	transferHistorySchema
);

module.exports = TransferHistory;
