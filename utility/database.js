const fn = require("../utility/function");
const User = require("../models/user.js");
const Account = require("../models/account");

async function addUser(fields, files) {
	try {
		let idFrontPath = await fn.uploadId(files["id-front"]);
		let idBackPath = await fn.uploadId(files["id-back"]);

		let user = new User({
			phone: fields.phone,
			email: fields.email,
			name: fields.name,
			birth: fields.date,
			address: fields.address,
			idFrontPath: idFrontPath,
			idBackPath: idBackPath,
		});

		let data = await user.save();
	} catch (error) {
		console.log(error);
		return false;
	}

	return true;
}

async function addAccount() {}

async function checkGenerateUsername() {
	let username = "";

	do {
		username = fn.generateRandomString();

		try {
			let result = await Account.findOne({ username });
		} catch (error) {
			console.log(error);
			return "";
		}
	} while (result);

	return username;
}

module.exports = { addUser };
