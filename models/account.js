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
		default: "First login",
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
	role: {
		type: String,
		required: true,
		default: "Customer",
	},
	balance: {
		type: Number,
		required: true,
		default: 0,
	},
	withdrawalCount: {
		type: Number,
		required: true,
		default: 0,
	},
	withdrawalTime: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	userId: {
		type: String,
		required: true,
		unique: true,
	},
});

var Account = mongoose.model("accounts", accountSchema);

Account.findOne({ username: "administrator" }, async (err, account) => {
	if (err) {
		console.error(err);
	}

	if (!account) {
		let account = new Account({
			username: "administrator",
			password: "123456",
			status: "Admin",
			role: "Admin",
			balance: 100,
			userId: "123456789",
		});

		try {
			await account.save();
		} catch (error) {
			console.error(error);
		}
	}
});

module.exports = Account;
