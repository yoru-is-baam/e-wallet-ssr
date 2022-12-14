const { body } = require("express-validator");
const User = require("../models/user.js");
const Account = require("../models/account");

let validateRegisterUser = (name, email, phone, address, date) => {
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

let validateLoginUser = () => {
	return [
		body("username", "Name must be at least 10 characters").isLength({
			min: 10,
		}),
		body("password", "Password must be at least 6 characters").isLength({
			min: 6,
		}),
		body("username", "Do not have this username").custom((value) => {
			Account.findOne({ username: value }).then((user) => {
				if (!user) {
					return;
				}
			});
		}),
	];
};

let validateEmail = async (email) => {
	let user = await User.findOne({ email });

	if (user) {
		return true;
	}

	return false;
};

let validatePhone = async (phone) => {
	let user = await User.findOne({ phone });

	if (user) {
		return true;
	}

	return false;
};

let validate = {
	validateRegisterUser: validateRegisterUser,
	validateEmail: validateEmail,
	validatePhone: validatePhone,
	validateLoginUser: validateLoginUser,
};

module.exports = { validate };
