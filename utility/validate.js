const { body } = require("express-validator");
const User = require("../models/user.js");
const Account = require("../models/account");
const Card = require("../models/card");

const bcrypt = require("bcrypt");
const db = require("./database");
const adminDb = require("./admin_db");

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
		let currentTime = Date.now();
		let blockedTime = currentTime - account.blockedTime;
		const ONE_MINUTE = 60000;
		const WRONG_COUNT_NOT_ALLOWED = 3;
		const WRONG_COUNT_BLOCK_INFINITELY = 6;

		if (!account) {
			return "Do not have this user";
		} else if (account.role === "Admin") {
			if (password === account.password) {
				return "Role admin";
			} else {
				return "Wrong password";
			}
		} else if (
			account.wrongCount === WRONG_COUNT_BLOCK_INFINITELY &&
			account.unusualLogin
		) {
			return "Your account is blocked because wrong many times, please contact administrator";
		} else if (
			account.wrongCount >= WRONG_COUNT_NOT_ALLOWED &&
			blockedTime < ONE_MINUTE
		) {
			return "Your account is blocked, please try again after 1 minute";
		}

		let isMatch = await bcrypt.compare(password, account.password);

		if (!isMatch) {
			let isUpdatedWrongCount = await db.updateWrongCount(
				username,
				account.wrongCount,
				account.unusualLogin
			);

			if (isUpdatedWrongCount) {
				return "Wrong password";
			}

			return false;
		}

		let isRestored = await adminDb.restoreLoginStatus(username);

		if (!isRestored) {
			return false;
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

let redirectBecauseEmail = async (req, res, next) => {
	if (req.session.email) {
		return next();
	}

	if (req.session.account) {
		return res.redirect(302, "/home");
	}

	return res.redirect(302, "/users/login");
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

let rechargeCardValidation = async (
	cardNumber,
	expirationDate,
	cvv,
	rechargeMoney
) => {
	try {
		let card = await Card.findOne({ cardNumber: cardNumber });
		const ONE_MILLION_ONE_RECHARGE = 1000000;

		if (!card) {
			return "This card is not supported";
		}

		let expirationDateInDB = card.expirationDate;
		let cvvInDB = card.cvv;

		if (expirationDate !== expirationDateInDB) {
			return "Wrong expiration date";
		}

		if (cvv !== cvvInDB) {
			return "Wrong cvv";
		}

		if (cardNumber === "222222" && rechargeMoney > ONE_MILLION_ONE_RECHARGE) {
			return "This card can just recharge 1 million/1 time";
		}

		if (cardNumber === "333333") {
			return "This card is out of money";
		}
	} catch (error) {
		console.error(error);
		return "";
	}

	return "OK";
};

let withdrawalValidation = async (
	accountId,
	cardNumber,
	expirationDate,
	cvv
) => {
	try {
		let withdrawalCount = await db.getWithdrawalCount(accountId);
		let withdrawalTime = await db.getWithdrawalTime(accountId);

		if (withdrawalCount === "" || withdrawalTime === "") {
			return "";
		}

		const WITHDRAWAL_COUNT_ALLOW = 2;
		const ONE_DAY_MILLISECOND = 8.64e7;
		let IS_ENOUGH_24_HOURS =
			Date.now() - withdrawalTime === ONE_DAY_MILLISECOND;

		if (IS_ENOUGH_24_HOURS) {
			let isRestoredWithdrawalCount = await db.restoreWithdrawalCount(
				accountId
			);

			if (!isRestoredWithdrawalCount) {
				return "";
			}
		}

		if (withdrawalCount > WITHDRAWAL_COUNT_ALLOW) {
			return "You can just withdraw 2 times/1 day";
		}

		let card = await Card.findOne({ cardNumber: cardNumber });

		if (card) {
			if (card.cardNumber !== "111111") {
				return "This card can not use to withdraw";
			}

			if (card.expirationDate !== expirationDate) {
				return "Wrong expiration date";
			}

			if (card.cvv !== cvv) {
				return "Wrong cvv";
			}
		} else {
			return "This card is not supported";
		}
	} catch (error) {
		console.error(error);
		return "";
	}

	return "OK";
};

let emailAndPhoneValidation = async (email, phone) => {
	try {
		let user = await User.findOne({ email: email });

		if (user) {
			if (user.phone === phone) {
				return true;
			}
		}
	} catch (error) {
		console.error(error);
		return false;
	}

	return false;
};

let otpValidation = async (otp, email) => {
	try {
		let user = await User.findOne({ email: email });

		if (user) {
			if (user.otp === otp) {
				let isUpdatedOtp = await db.updateOtp(email);

				if (isUpdatedOtp) {
					return true;
				}
			}
		}
	} catch (error) {
		console.error(error);
		return false;
	}

	return false;
};

let validate = {
	validateLoginUser: validateLoginUser,
	validateRegisterUser: validateRegisterUser,
	loginValidationDB: loginValidationDB,
	registerValidationDB: registerValidationDB,
	rechargeCardValidation: rechargeCardValidation,
	emailAndPhoneValidation: emailAndPhoneValidation,
	otpValidation: otpValidation,
	withdrawalValidation: withdrawalValidation,
	redirectIndex: redirectIndex,
	redirectLogin: redirectLogin,
	redirectBecauseEmail: redirectBecauseEmail,
	redirectNotVerifyAccount: redirectNotVerifyAccount,
	redirectFirstLogin: redirectFirstLogin,
	redirectUpdateId: redirectUpdateId,
	adminOnly: adminOnly,
};

module.exports = { validate };