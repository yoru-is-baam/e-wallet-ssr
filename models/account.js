var mongoose = require("mongoose");

var accountSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		required: true,
		default: "Wait confirm",
	},
	wrongCount: {
		type: Number,
		required: true,
		default: 0,
	},
	unusualLogin: {
		type: Boolean,
		required: true,
		default: false,
	},
	blockedTime: {
		type: Date,
		required: true,
		default: 0,
	},
	userId: {
		type: String,
		required: true,
	},
});

var Account = mongoose.model("accounts", userSchema);

module.exports = Account;
