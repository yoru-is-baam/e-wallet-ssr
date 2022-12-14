const path = require("path");
const fs = require("fs");

async function uploadId(file) {
	var oldPath = file.filepath;
	var pathToUpload =
		"./uploads/" + file.newFilename + path.extname(file.originalFilename);

	let data = await fs.promises.readFile(oldPath);
	await fs.promises.writeFile(pathToUpload, data);
	await fs.promises.unlink(oldPath);

	return pathToUpload;
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

module.exports = { uploadId, generateRandomString };
