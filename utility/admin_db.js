var mongoose = require("mongoose");
const User = require("../models/user.js");
const Account = require("../models/account");
const WithdrawalHistory = require("../models/withdrawalHistory");

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

async function getWithdrawalOver5mAccounts() {
	try {
		let withdrawalOver5mHistories = await WithdrawalHistory.find({
			status: "Waiting",
		});

		if (!withdrawalOver5mHistories) {
			return "";
		}

		let accountIds = [];
		withdrawalOver5mHistories.forEach((withdrawalOver5mHistory) => {
			accountIds.push(withdrawalOver5mHistory.accountId);
		});

		let accounts = [];

		for (let i = 0; i < accountIds.length; i++) {
			let account = await getAccountById(accountIds[i]);

			if (account === "") {
				return "";
			}

			accounts.push(account);
		}

		return accounts;
	} catch (error) {
		console.error(error);
		return "";
	}
}

async function getWithdrawalOver5mHistory(accountId) {
	try {
		let withdrawalOver5mHistory = await WithdrawalHistory.findOne({
			status: "Waiting",
		});

		if (withdrawalOver5mHistory) {
			return withdrawalOver5mHistory;
		}
	} catch (error) {
		console.error(error);
		return "";
	}

	return "";
}

async function getAccountById(accountId) {
	try {
		let account = await Account.findById({
			_id: new mongoose.Types.ObjectId(accountId),
		});

		if (account) {
			return account;
		}
	} catch (error) {
		console.error(error);
		return "";
	}

	return "";
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
	getWithdrawalOver5mAccounts,
	getWithdrawalOver5mHistory,
};
