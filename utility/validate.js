const { body } = require("express-validator");
const User = require("../models/user.js");
const Account = require("../models/account");

const bcrypt = require("bcrypt");
const db = require("./database");

let validateRegisterUser = () => {
	return [
		body(name, "Name must be at least 5 characters").isLength({ min: 5 }),
		body(email, "You have entered an invalid email address!").isEmail(),
		body(email, "Already have this email").custom((value) => {
			User.findOne({ email: value }).then((user) => {
				if (user) {
					return;
				}
			});
		}),
		body(phone, "Mobile phone must be at least 10 numbers").isMobilePhone(),
		body(phone, "Already have this phone number").custom((value) => {
			User.findOne({ phone: value }).then((user) => {
				if (user) {
					return;
				}
			});
		}),
		body(address, "Please do not leave blank address").isEmpty(),
		body(address, "Invalid birthday").isISO8601("yyyy-mm-dd"),
	];
};

let validateLoginUser = [
	body("username", "Name must be at least 10 characters").isLength({
		min: 10,
	}),
	body("password", "Password must be at least 6 characters").isLength({
		min: 6,
	}),
];

let registerValidationDB = async (email, phone) => {
	try {
		let user = await User.findOne({ email });

		if (user) {
			return "Already have this email";
		}

		user = await User.findOne({ phone });

		if (user) {
			return "Already have this phone";
		}
	} catch (error) {
		console.error(error);
		return false;
	}

	return true;
};

let loginValidationDB = async (username, password) => {
	try {
		let account = await Account.findOne({ username });

		if (!account) {
			return "Do not have this user";
		} else if (account.role === "Admin") {
			if (password === account.password) {
				return "Role admin";
			} else {
				return "Wrong password";
			}
		}

		let isMatch = await bcrypt.compare(password, account.password);

		if (!isMatch) {
			return "Wrong password";
		}
	} catch (error) {
		console.error(error);
		return false;
	}

	return true;
};

let redirectLogin = (req, res, next) => {
	if (!req.session.account) {
		return res.redirect(302, "/users/login");
	}

	next();
};

let redirectNotVerifyAccount = async (req, res, next) => {
	if (!req.session.account) {
		return res.redirect(302, "/users/login");
	} else {
		let status = await db.getStatus(req.session.account.accountId);

		if (status === "Wait confirm") {
			return next();
		} else if (status === "First login") {
			return res.redirect(302, "/users/change_password");
		} else if (status === "Confirm") {
			return res.redirect(302, "../home");
		} else if (status === "Wait update") {
			return res.redirect(302, "/users/update_id");
		} else if (status === "Disabled") {
			return res.redirect(302, "/users/login");
		}
	}
};

let redirectFirstLogin = async (req, res, next) => {
	if (req.session.account) {
		let status = await db.getStatus(req.session.account.accountId);

		if (status === "First login") {
			return next();
		} else if (status === "Wait confirm") {
			return res.redirect(302, "../not_verify_account");
		} else if (status === "Confirm") {
			return res.redirect(302, "../home");
		} else if (status === "Wait update") {
			return res.redirect(302, "/users/update_id");
		} else if (status === "Disabled") {
			return res.redirect(302, "/users/login");
		}
	}

	return res.redirect("/users/login");
};

let redirectUpdateId = async (req, res, next) => {
	if (req.session.account) {
		let status = await db.getStatus(req.session.account.accountId);

		if (status === "Wait update") {
			return next();
		} else if (status === "Wait confirm") {
			return res.redirect(302, "../not_verify_account");
		} else if (status === "Confirm") {
			return res.redirect(302, "../home");
		} else if (status === "First login") {
			return res.redirect(302, "/users/change_password");
		} else if (status === "Disabled") {
			return res.redirect(302, "/users/login");
		}
	}

	return res.redirect("/users/login");
};

let redirectIndex = async (req, res, next) => {
	if (req.session.account) {
		let status = await db.getStatus(req.session.account.accountId);

		if (status === "First login") {
			return res.redirect(302, "/users/change_password");
		} else if (status === "Wait confirm") {
			return res.redirect(302, "../not_verify_account");
		} else if (status === "Confirm") {
			return res.redirect(302, "../home");
		} else if (status === "Wait update") {
			return res.redirect(302, "/users/update_id");
		} else if (status === "Disabled") {
			return res.redirect(302, "/users/login");
		}
	}

	next();
};

let adminOnly = (req, res, next) => {
	var role = req.session.role;

	if (role !== "admin") {
		return res.redirect(302, "/400");
	}

	next();
};

let validate = {
	validateLoginUser: validateLoginUser,
	validateRegisterUser: validateRegisterUser,
	loginValidationDB: loginValidationDB,
	registerValidationDB: registerValidationDB,
	redirectIndex: redirectIndex,
	redirectLogin: redirectLogin,
	redirectNotVerifyAccount: redirectNotVerifyAccount,
	redirectFirstLogin: redirectFirstLogin,
	redirectUpdateId: redirectUpdateId,
	adminOnly: adminOnly,
};

module.exports = { validate };
