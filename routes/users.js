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

const db = require("../utility/database");
const fn = require("../utility/function");

// register
router.get("/register", validate.redirectIndex, function (req, res) {
	return res.status(200).render("register", { title: "Register", csrf: token });
});

router.post("/register", (req, res) => {
	const form = formidable({ multiples: false });

	form.parse(req, async (err, fields, files) => {
		if (err || !tokens.verify(secret, fields._csrf)) {
			return res.redirect(400, "/400");
		}

		let checkValidDB = await validate.registerValidationDB(
			fields.email,
			fields.phone
		);

		if (typeof checkValidDB == "string") {
			return res.status(400).render("register", {
				title: "Register",
				csrf: token,
				...fields,
				error: checkValidDB,
			});
		} else if (typeof checkValidDB == "boolean" && !checkValidDB) {
			return res.redirect(400, "/400");
		}

		let userInfo = await db.addUser(fields, files);

		if (typeof userId === "boolean") {
			return res.redirect(400, "/400");
		}

		let account = await db.addAccount(userInfo);

		if (!account) {
			return res.redirect(400, "/400");
		}

		return res.redirect("/users/login");
	});
});

// login
router.get("/login", validate.redirectIndex, function (req, res) {
	if (req.session.email) {
		delete req.session.email;
	}

	return res.status(200).render("login", { title: "Login", csrf: token });
});

router.post(
	"/login",
	validate.validateLoginUser,
	validate.redirectIndex,
	async (req, res) => {
		let username = req.body.username;
		let password = req.body.password;

		// validation
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).render("login", {
				title: "Login",
				csrf: token,
				...req.body,
				errors: errors.mapped(),
			});
		}

		let checkValidDB = await validate.loginValidationDB(username, password);

		if (typeof checkValidDB === "string") {
			if (checkValidDB === "Role admin") {
				req.session.role = "admin";
				return res.redirect(302, "/admin/admin_system");
			}

			return res.status(400).render("login", {
				title: "Login",
				csrf: token,
				...req.body,
				error: checkValidDB,
			});
		} else if (typeof checkValidDB == "boolean" && !checkValidDB) {
			return res.redirect(400, "/400");
		}

		//TODO: process login
		let account = await db.getAccount(username);

		if (account === "") {
			return res.redirect(302, "/400");
		}

		// every page need username
		// instead username use _id should be faster
		req.session.account = {
			accountId: account._id,
			userId: account.userId,
			role: account.role,
		};

		if (account.status === "First login") {
			return res.redirect(302, "/users/change_password");
		} else if (account.status === "Wait confirm") {
			return res.redirect(302, "/not_verify_account");
		} else if (account.status === "Wait update") {
			return res.redirect(302, "/users/update_id");
		} else if (account.status === "Confirm") {
			return res.redirect(302, "/home");
		} else if (account.status === "Disabled") {
			return res.status(400).render("login", {
				title: "Login",
				csrf: token,
				...req.body,
				error: "This account is disabled, please contact 18001008",
			});
		}
	}
);

// logout
router.get("/logout", validate.redirectLogin, (req, res) => {
	req.session.destroy();
	return res.status(200).render("logout", { title: "Logout" });
});

// change password
router.get("/change_password", validate.redirectFirstLogin, (req, res) => {
	return res
		.status(200)
		.render("change_password", { title: "Create new password" });
});

router.post("/change_password", async (req, res) => {
	let password = req.body.pwd;
	let isChanged = await db.changePassword(
		req.session.account.accountId,
		password
	);

	if (isChanged) {
		return res.redirect(302, "/not_verify_account");
	}

	return res.redirect(400, "/400");
});

// reset password
router.get("/reset_password", validate.redirectLogin, (req, res) => {
	return res.status(200).render("reset_password", { title: "Reset password" });
});

router.post("/reset_password", async (req, res) => {
	let changedStr = await db.resetPassword(
		req.body["old-pass"],
		req.body["new-pass"],
		req.session.account.accountId
	);

	if (changedStr === "") {
		return res.redirect(302, "/400");
	} else if (changedStr === "Wrong old password") {
		return res
			.status(400)
			.render("reset_password", { title: "Reset password", error: changedStr });
	}

	return res.redirect(302, "/home");
});

// update id
router.get("/update_id", validate.redirectUpdateId, (req, res) => {
	return res.status(200).render("update_id", { title: "Update Id" });
});

router.post("/update_id", (req, res) => {
	const form = formidable({ multiples: false });

	form.parse(req, async (err, fields, files) => {
		if (err) {
			return res.redirect(302, "/400");
		}

		let user = await db.getUser(req.session.account.userId);

		if (user === "") {
			return res.redirect(302, "/400");
		}

		let isDeleted = await fn.removeUploadId(user.idFrontPath, user.idBackPath);
		if (!isDeleted) {
			return res.redirect(302, "/400");
		}

		let idFrontPath = await fn.uploadId(files["id-front"]);
		let idBackPath = await fn.uploadId(files["id-back"]);

		let isUpdated = await db.updateId(user._id, idFrontPath, idBackPath);
		if (isUpdated) {
			return res.redirect(302, "/not_verify_account");
		}

		return res.redirect(302, "/400");
	});
});

// forgot password
router.get("/forgot_password", validate.redirectIndex, (req, res) => {
	return res
		.status(200)
		.render("forgot_password", { title: "Forgot password" });
});

router.post("/forgot_password", async (req, res) => {
	let email = req.body.email;
	let phone = req.body.phone;

	let isMatch = await validate.emailAndPhoneValidation(email, phone);

	if (!isMatch) {
		return res.status(400).render("forgot_password", {
			title: "Forgot password",
			email,
			phone,
			error: "Do not have this email or phone",
		});
	}

	let isSent = await db.sendOtp(email);

	if (isSent) {
		req.session.email = email;
		return res.redirect(302, "/users/type_otp");
	}

	return res.redirect(302, "/400");
});

// type otp
router.get("/type_otp", validate.redirectBecauseEmail, (req, res) => {
	return res.status(200).render("type_otp", { title: "Type OTP" });
});

router.post("/type_otp", async (req, res) => {
	let otp = req.body.otp;
	let email = req.session.email;

	let isMatchOtp = await validate.otpValidation(otp, email);
	if (!isMatchOtp) {
		return res.redirect(302, "/400");
	}

	return res.redirect(302, "/users/change_password_otp");
});

// change pwd otp
router.get(
	"/change_password_otp",
	validate.redirectBecauseEmail,
	(req, res) => {
		return res
			.status(200)
			.render("change_password_otp", { title: "Change password" });
	}
);

router.post("/change_password_otp", async (req, res) => {
	let password = req.body.pwd;
	let isChanged = await db.changePasswordByEmail(req.session.email, password);

	req.session.destroy();

	if (isChanged) {
		return res.redirect(302, "/users/login");
	}

	return res.redirect(400, "/400");
});

module.exports = router;
