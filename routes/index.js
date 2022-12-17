var express = require("express");
var router = express.Router();

const db = require("../utility/database");
const fn = require("../utility/function");
const { validate } = require("../utility/validate");

// index
router.get("/", validate.redirectIndex, function (req, res) {
	return res.render("index", { title: "E-wallet" });
});

// not verify account
router.get(
	"/not_verify_account",
	validate.redirectNotVerifyAccount,
	async function (req, res) {
		let user = await db.getUser(req.session.account.userId);
		let status = await db.getStatus(req.session.account.accountId);

		if (user === "") {
			return res.status(400).render("400", { title: "400 Bad Request" });
		}

		let balance = await db.getBalance(req.session.account.accountId);

		user = {
			name: user.name,
			phone: user.phone,
			email: user.email,
			address: user.address,
			birth: user.birth,
			status: status,
			balance: fn.formatCurrency(balance),
		};

		return res
			.status(200)
			.render("not_verify_account", { title: "E-wallet", ...user });
	}
);

// home
router.get("/home", validate.redirectLogin, async (req, res) => {
	let user = await db.getUser(req.session.account.userId);
	let status = await db.getStatus(req.session.account.accountId);

	if (user === "") {
		return res.status(400).render("400", { title: "400 Bad Request" });
	}

	let balance = await db.getBalance(req.session.account.accountId);

	user = {
		name: user.name,
		phone: user.phone,
		email: user.email,
		address: user.address,
		birth: user.birth,
		status: status,
		balance: fn.formatCurrency(balance),
	};

	return res.status(200).render("home", { title: "E-wallet", ...user });
});

// recharge
router.post("/recharge", async (req, res) => {
	let cardNumber = req.body.cardNumber;
	let expirationDate = req.body.expirationDate;
	let cvv = req.body.cvv;
	let rechargeMoney = req.body.rechargeMoney;

	// validation
	let rechargeValidationStr = await validate.rechargeCardValidation(
		cardNumber,
		expirationDate,
		cvv,
		rechargeMoney
	);

	if (rechargeValidationStr === "") {
		return res.status(400).json({ code: -1, msg: rechargeValidationStr });
	} else if (rechargeValidationStr !== "OK") {
		return res.status(400).json({ code: 0, msg: rechargeValidationStr });
	}

	let isUpdatedBalance = await db.updateBalance(
		req.session.account.accountId,
		rechargeMoney
	);

	if (isUpdatedBalance) {
		let isAddedRechargeHistory = await db.addRechargeHistory(
			req.session.account.accountId,
			cardNumber,
			rechargeMoney
		);

		if (isAddedRechargeHistory) {
			return res.status(200).json({ code: 1, msg: "OK" });
		}
	}

	return res.status(400).json({ code: -1, msg: "" });
});

// withdrawal
router.get("/withdrawal", validate.redirectLogin, (req, res) => {
	return res.status(200).render("withdrawal", { title: "Withdrawal" });
});

router.post("/withdrawal", async (req, res) => {
	let cardNumber = req.body["card-num"];
	let expirationDate = req.body.expiration;
	let cvv = req.body.cvv;
	let withdrawalMoney = req.body.money;
	let note = req.body.note;

	let withdrawalValidationStr = await validate.withdrawalValidation(
		req.session.account.accountId,
		cardNumber,
		expirationDate,
		cvv,
		withdrawalMoney
	);

	if (withdrawalValidationStr === "") {
		return res.redirect(302, "/400");
	} else if (withdrawalValidationStr != "OK") {
		return res.status(400).render("withdrawal", {
			title: "Withdrawal",
			error: withdrawalValidationStr,
			cardNumber,
			expirationDate,
			cvv,
			withdrawalMoney,
			note,
		});
	}

	let isAddedWithdrawalHistory = await db.addWithdrawalHistory(
		req.session.account.accountId,
		cardNumber,
		withdrawalMoney,
		note
	);

	if (isAddedWithdrawalHistory) {
		return res.redirect(302, "/home");
	}

	return res.redirect(302, "/400");
});

// transaction history
router.get("/transaction_history", validate.redirectLogin, (req, res) => {
	return res
		.status(200)
		.render("transaction_history", { title: "Transaction History" });
});

// recharge history
router.get("/recharge_history", validate.redirectLogin, async (req, res) => {
	let rechargeHistories = await db.getRechargeHistories(
		req.session.account.accountId
	);

	if (rechargeHistories === "") {
		return res.redirect(302, "/400");
	}

	return res.status(200).render("recharge_history", {
		title: "Recharge History",
		rechargeHistories: rechargeHistories,
	});
});

// withdrawal history
router.get("/withdrawal_history", validate.redirectLogin, async (req, res) => {
	let withdrawalHistories = await db.getWithdrawalHistories(
		req.session.account.accountId
	);

	if (withdrawalHistories === "") {
		return res.redirect(302, "/400");
	}

	return res.status(200).render("withdrawal_history", {
		title: "Withdrawal History",
		withdrawalHistories: withdrawalHistories,
	});
});

// 400
router.get("/400", (req, res) => {
	return res.status(400).render("400", { title: "400 Bad Request" });
});

module.exports = router;
