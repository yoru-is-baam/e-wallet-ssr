var express = require("express");
var router = express.Router();

const adminDb = require("../utility/admin_db");
const db = require("../utility/database");
const { validate } = require("../utility/validate");

router.get("/admin_system", validate.adminOnly, async (req, res) => {
	let waitConfirmAccounts = await adminDb.getWaitConfirmAccount();

	return res.status(200).render("./admin/admin_system", {
		title: "Admin system",
		waitConfirmAccounts: waitConfirmAccounts,
	});
});

// waiting display
router.get("/waiting_display/:userId", validate.adminOnly, async (req, res) => {
	let user = await db.getUser(req.params.userId);

	if (user === "") {
		return res.redirect(302, "/400");
	}

	return res
		.status(200)
		.render("./admin/waiting_display", { title: "Waiting user", user: user });
});

router.post("/waiting_display/:userId/:status", async (req, res) => {
	let userId = req.params.userId;
	let status = req.params.status;

	let isUpdated = await adminDb.updateStatus(userId, status);

	if (isUpdated) {
		return res.status(200).json({ code: 1, msg: "Success" });
	}

	return res.status(400).json({ code: 0, msg: "Fail" });
});

module.exports = router;
