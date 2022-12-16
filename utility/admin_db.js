const User = require("../models/user.js");
const Account = require("../models/account");

async function getWaitConfirmAccount() {
	try {
		let waitConfirmAccounts = await Account.find({ status: "Wait confirm" });

		if (waitConfirmAccounts) {
			return waitConfirmAccounts;
		}
	} catch (error) {
		console.error(error);
		return "";
	}

	return "";
}

async function updateStatus(userId, status) {
	try {
		let account = await Account.findOneAndUpdate(
			{ userId: userId },
			{ status: status }
		);

		if (account) {
			return true;
		}
	} catch (error) {
		console.error(error);
		return false;
	}

	return false;
}

module.exports = { getWaitConfirmAccount, updateStatus };
