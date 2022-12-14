const fn = require("../utility/function");
const User = require("../models/user.js");
const Account = require("../models/account");

require("dotenv").config();

// config send mail
const google = require("googleapis");
const nodemailer = require("nodemailer");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.Auth.OAuth2Client(
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// when it is exposed then can protect user account
const bcrypt = require("bcrypt");
const saltRounds = 10;

async function addUser(fields, files) {
	try {
		let idFrontPath = await fn.uploadId(files["id-front"]);
		let idBackPath = await fn.uploadId(files["id-back"]);

		let user = new User({
			phone: fields.phone,
			email: fields.email,
			name: fields.name,
			birth: fields.date,
			address: fields.address,
			idFrontPath: idFrontPath,
			idBackPath: idBackPath,
		});

		data = await user.save();
	} catch (error) {
		console.error(error);
		return false;
	}

	return data;
}

async function addAccount(userInfo) {
	try {
		let username = await checkGenerateUsername();
		let password = fn.generateRandomString(6);
		if (username == "") {
			return false;
		}

		let hashedPass = await bcrypt.hash(password, saltRounds);

		let account = new Account({
			username: username,
			password: hashedPass,
			userId: userInfo._id,
		});

		if (sendMail(userInfo.email, username, password)) {
			await account.save();
		}
	} catch (error) {
		console.error(error);
		return false;
	}

	return true;
}

async function sendMail(email, username, password) {
	try {
		const accessToken = await oAuth2Client.getAccessToken();
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: "OAuth2",
				user: "dtsamsung51@gmail.com",
				clientId: CLIENT_ID,
				clientSecret: CLIENT_SECRET,
				refreshToken: REFRESH_TOKEN,
				accessToken: accessToken,
			},
		});

		// send mail with defined transport object
		let info = await transporter.sendMail({
			from: '"Administrator 👻" <dtsamsung51@gmail.com>', // sender address
			to: email, // list of receivers
			subject: "Your account ✔", // Subject line
			text: "Hello, good day. This is your account", // plain text body
			html: `<p>Username: ${username}</p><p>Password: ${password}</p>`, // html body
		});
	} catch (error) {
		console.error(error);
		return false;
	}

	return true;
}

async function checkGenerateUsername() {
	let username = "";

	do {
		username = fn.generateRandomString(10);

		try {
			result = await Account.findOne({ username });
		} catch (error) {
			console.log(error);
			return "";
		}
	} while (result);

	return username;
}

module.exports = { addUser, addAccount };
