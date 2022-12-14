var express = require("express");
var router = express.Router();

// user can type wrong input
const { validationResult } = require("express-validator");
const { validate } = require("../utility/validate");

// attacker can attack by send fake script
var Tokens = require("csrf");
var tokens = new Tokens();
var secret = tokens.secretSync();
var token = tokens.create(secret);

const formidable = require("formidable");

const fn = require("../utility/function");
const db = require("../utility/database");

// register
router.get("/register", function (req, res) {
	return res.render("register", { title: "Register", csrf: token });
});

router.post("/register", (req, res) => {
	const form = formidable({ multiples: false });

	form.parse(req, async (err, fields, files) => {
		if (err || !tokens.verify(secret, fields._csrf)) {
			return res.status(400).render("400", { title: "400 Bad Request" });
		}

		if (await validate.validateEmail(fields.email)) {
			return res.status(400).render("register", {
				title: "Register",
				csrf: token,
				...fields,
				errors: { email: "Already have this email" },
			});
		}

		if (await validate.validatePhone(fields.phone)) {
			return res.status(400).render("register", {
				title: "Register",
				csrf: token,
				...fields,
				errors: { phone: "Already have this phone" },
			});
		}

		let userInfo = await db.addUser(fields, files);

		if (typeof userId === "boolean") {
			return res.status(400).render("400", { title: "400 Bad Request" });
		}

		let account = await db.addAccount(userInfo);

		if (!account) {
			return res.status(400).render("400", { title: "400 Bad Request" });
		}

		return res.redirect("/users/login");
	});
});

// login
router.get("/login", function (req, res) {
	return res.render("login", { title: "Login", csrf: token });
});

router.post("/login", validate.validateLoginUser, (req, res) => {});

module.exports = router;
