const User = require("../models/user.js");
const Account = require("../models/account");

async function getWaitConfirmAccounts() {
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

async function getBlockedAccounts() {
	try {
		const WRONG_COUNT_BLOCK_INFINITELY = 6;
		let blockedAccounts = await Account.find({
			wrongCount: WRONG_COUNT_BLOCK_INFINITELY,
			unusualLogin: true,
		});

		if (blockedAccounts) {
			return blockedAccounts;
		}
	} catch (error) {
		console.error(error);
		return "";
	}

	return "";
}

async function getActiveAccounts() {
	try {
		let activeAccounts = await Account.find({
			status: "Confirm",
		});

		if (activeAccounts) {
			return activeAccounts;
		}
	} catch (error) {
		console.error(error);
		return "";
	}

	return "";
}

async function getDisabledAccounts() {
	try {
		let disabledAccounts = await Account.find({
			status: "Disabled",
		});

		if (disabledAccounts) {
			return disabledAccounts;
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

async function restoreLoginStatus(username) {
	try {
		let isRestored = await Account.findOneAndUpdate(
			{ username: username },
			{ wrongCount: 0, unusualLogin: false, blockedTime: 0 }
		);

		if (isRestored) {
			return true;
		}
	} catch (error) {
		console.error(error);
		return false;
	}

	return false;
}

module.exports = {
	getWaitConfirmAccounts,
	getBlockedAccounts,
	getActiveAccounts,
	getDisabledAccounts,
	updateStatus,
	restoreLoginStatus,
};
