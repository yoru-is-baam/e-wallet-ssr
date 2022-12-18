const path = require("path");
const fs = require("fs");

async function uploadId(file) {
	var oldPath = file.filepath;
	var pathToUpload =
		"./public/uploads/" +
		file.newFilename +
		path.extname(file.originalFilename);

	let data = await fs.promises.readFile(oldPath);
	await fs.promises.writeFile(pathToUpload, data);
	await fs.promises.unlink(oldPath);

	return file.newFilename + path.extname(file.originalFilename);
}

function generateRandomString(strLength) {
	const chars = (length = 10
		? "0123456789"
		: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
	const randomArray = Array.from(
		{ length: strLength },
		(v, k) => chars[Math.floor(Math.random() * chars.length)]
	);

	const randomString = randomArray.join("");

	return randomString;
}

function generateOtp(strLength) {
	const chars = "0123456789";
	const randomArray = Array.from(
		{ length: strLength },
		(v, k) => chars[Math.floor(Math.random() * chars.length)]
	);

	const randomString = randomArray.join("");

	return randomString;
}

async function removeUploadId(idFrontPath, idBackPath) {
	idFrontPath = "./public/uploads/" + idFrontPath;
	idBackPath = "./public/uploads/" + idBackPath;

	try {
		await fs.promises.unlink(idFrontPath);
		await fs.promises.unlink(idBackPath);
	} catch (error) {
		console.error(error);
		return false;
	}

	return true;
}

function formatCurrency(money) {
	return money.toLocaleString("it-IT", { style: "currency", currency: "VND" });
}

function calculateFee(money) {
	return parseInt((money * 5) / 100);
}

module.exports = {
	uploadId,
	generateRandomString,
	removeUploadId,
	formatCurrency,
	generateOtp,
	calculateFee,
};
