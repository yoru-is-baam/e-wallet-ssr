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

function generateRandomString(usernameLength = 10) {
	const chars = "0123456789";
	const randomArray = Array.from(
		{ length: usernameLength },
		(v, k) => chars[Math.floor(Math.random() * chars.length)]
	);

	const randomString = randomArray.join("");

	return randomString;
}

module.exports = { uploadId, generateRandomString };
