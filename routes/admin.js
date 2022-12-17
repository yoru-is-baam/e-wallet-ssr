var express = require("express");
var router = express.Router();

const adminDb = require("../utility/admin_db");
const db = require("../utility/database");
const fn = require("../utility/function");
const { validate } = require("../utility/validate");

router.get("/admin_system", validate.adminOnly, async (req, res) => {
	let waitConfirmAccounts = await adminDb.getWaitConfirmAccounts();
	let blockedAccounts = await adminDb.getBlockedAccounts();
	let activeAccounts = await adminDb.getActiveAccounts();
	let disabledAccounts = await adminDb.getDisabledAccounts();
	let withdrawalOver5mAccounts = await adminDb.getWithdrawalOver5mAccounts();

	return res.status(200).render("./admin/admin_system", {
		title: "Admin system",
		waitConfirmAccounts: waitConfirmAccounts,
		blockedAccounts: blockedAccounts,
		activeAccounts: activeAccounts,
		disabledAccounts: disabledAccounts,
		withdrawalOver5mAccounts: withdrawalOver5mAccounts,
	});
});

// waiting display
router.get("/waiting_display/:userId", validate.adminOnly, async (req, res) => {
	let user = await db.getUser(req.params.userId);

	if (user === "") {
		return res.redirect(302, "/400");
	}

	return res
		.status(200)
		.render("./admin/waiting_display", { title: "Waiting user", user: user });
});

router.post("/waiting_display/:userId/:status", async (req, res) => {
	let userId = req.params.userId;
	let status = req.params.status;

	let isUpdated = await adminDb.updateStatus(userId, status);

	if (isUpdated) {
		return res.status(200).json({ code: 1, msg: "Success" });
	}

	return res.status(400).json({ code: 0, msg: "Fail" });
});

// blocked display
router.get("/blocked_display/:userId", validate.adminOnly, async (req, res) => {
	let user = await db.getUser(req.params.userId);

	if (user === "") {
		return res.redirect(302, "/400");
	}

	return res
		.status(200)
		.render("./admin/blocked_display", { title: "Blocked user", user: user });
});

router.post("/blocked_display/:userId/:status", async (req, res) => {
	let userId = req.params.userId;
	let status = req.params.status;

	if (status !== "Unblock") {
		return res.redirect(302, "/400");
	}

	let username = await db.getUsername(userId);
	if (username === "") {
		return res.redirect(302, "/400");
	}

	let isRestored = await adminDb.restoreLoginStatus(username);
	if (isRestored) {
		return res.status(200).json({ code: 1, msg: "Success" });
	}

	return res.status(400).json({ code: 0, msg: "Fail" });
});

// activated display
router.get(
	"/activated_display/:userId",
	validate.adminOnly,
	async (req, res) => {
		let user = await db.getUser(req.params.userId);

		if (user === "") {
			return res.redirect(302, "/400");
		}

		return res.status(200).render("./admin/activated_display", {
			title: "Activated user",
			user: user,
		});
	}
);

// withdrawal over 5m
router.get(
	"/withdraw_over_5m/:accountId",
	validate.adminOnly,
	async (req, res) => {
		let accountId = req.params.accountId;

		if (accountId === "") {
			return res.redirect(302, "/400");
		}

		let withdrawalHistory = await adminDb.getWithdrawalOver5mHistory(accountId);

		withdrawalHistory = {
			id: withdrawalHistory._id,
			cardNumber: withdrawalHistory.cardNumber,
			accountId: withdrawalHistory.accountId,
			fee: fn.formatCurrency(withdrawalHistory.fee),
			money: fn.formatCurrency(withdrawalHistory.money),
			date: withdrawalHistory.date,
		};

		return res.status(200).render("./admin/withdraw_over_5m", {
			title: "Withdrawal History",
			withdrawalHistory: withdrawalHistory,
		});
	}
);

router.post("/confirm_withdrawal", async (req, res) => {
	let withdrawalId = req.body.withdrawalId;
	let accountId = req.body.accountId;
	let status = req.body.status;

	let isExecuted = await db.confirmWithdrawal(withdrawalId, accountId, status);

	if (!isExecuted) {
		return res.status(400).json({ code: 0, msg: "Fail" });
	}

	return res.status(200).json({ code: 1, msg: "Success" });
});

// recent transactions

module.exports = router;
