var express = require("express");
var router = express.Router();

const db = require("../utility/database");
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

		user = {
			name: user.name,
			phone: user.phone,
			email: user.email,
			address: user.address,
			birth: user.birth,
			status: status,
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

	user = {
		name: user.name,
		phone: user.phone,
		email: user.email,
		address: user.address,
		birth: user.birth,
		status: status,
	};

	return res.status(200).render("home", { title: "E-wallet", ...user });
});

// 400
router.get("/400", (req, res) => {
	return res.status(400).render("400", { title: "400 Bad Request" });
});

module.exports = router;
