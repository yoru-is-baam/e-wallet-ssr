var mongoose = require("mongoose");
var fn = require("../utility/function");

var userSchema = mongoose.Schema({
	phone: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
	},
	birth: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	idFrontPath: {
		type: String,
		required: true,
	},
	idBackPath: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
		default: fn.generateOtp(6),
	},
});

var User = mongoose.model("users", userSchema);

module.exports = User;
