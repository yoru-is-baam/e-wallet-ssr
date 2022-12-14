function checkLogin() {
	let usernameBox = document.getElementById("username");
	let pwdBox = document.getElementById("password");

	let username = usernameBox.value.trim();
	let pass = pwdBox.value.trim();

	if (username.length < 10) {
		showError("Your username must be at least 10 characters");
		usernameBox.focus();

		return false;
	} else if (pass.length < 6) {
		showError("Your password must be at least 6 characters");
		pwdBox.focus();

		return false;
	} else {
		showError();

		return true;
	}
}

function checkRegister() {
	let nameBox = document.getElementById("name");
	let emailBox = document.getElementById("email");
	let phoneBox = document.getElementById("phone");
	let addressBox = document.getElementById("address");
	let birthDayBox = document.getElementById("birthday");
	let idFrontBox = document.getElementById("id-front");
	let idBackBox = document.getElementById("id-back");

	let name = nameBox.value.trim();
	let email = emailBox.value.trim();
	let phone = phoneBox.value.trim();
	let address = addressBox.value.trim();
	let birthDay = birthDayBox.value.trim();
	let idFront = idFrontBox.value.trim();
	let idBack = idBackBox.value.trim();

	let nameFormat = /^[A-Za-z\s]+$/;
	let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	let phoneFormat =
		/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
	let imgFormat = /\.(jpe?g|png|gif|bmp)$/i;

	if (!nameFormat.test(name)) {
		showError("Please enter your name again");
		nameBox.focus();

		return false;
	} else if (name.length < 5) {
		showError("Name must be at least 5 characters.");
		nameBox.focus();

		return false;
	} else if (!mailFormat.test(email)) {
		showError("You have entered an invalid email address!");
		emailBox.focus();

		return false;
	} else if (!phoneFormat.test(phone)) {
		showError("You have entered an invalid phone number!");
		phoneBox.focus();

		return false;
	} else if (address === "") {
		showError("Please enter your address");
		addressBox.focus();

		return false;
	} else if (!checkBirthDay(birthDay)) {
		showError("Your have entered an invalid birthday!");
		birthDayBox.focus();

		return false;
	} else if (!imgFormat.test(idFront) || idFront === "") {
		showError("Your id card was not invalid");
		idFrontBox.focus();

		return false;
	} else if (!imgFormat.test(idBack) || idBack === "") {
		showError("Your id card was not invalid");
		idBackBox.focus();

		return false;
	} else {
		showError();

		return true;
	}
}

function checkChangeOtp() {
	let pwdBox = document.getElementById("pwd");
	let pwdConfirmBox = document.getElementById("pwd-confirm");

	let pwd = pwdBox.value.trim();
	let pwdConfirm = pwdConfirmBox.value.trim();

	if (pwd.length < 6) {
		showError("Your password must be at least 6 characters");
		pwdBox.focus();

		return false;
	} else if (pwd.search(/[a-z]/i) < 0) {
		showError("Your password must contain at least one letter");
		pwdBox.focus();

		return false;
	} else if (pwd.search(/\d/) < 0) {
		showError("Your password must contain at least one digit");
		pwdBox.focus();

		return false;
	} else if (pwd !== pwdConfirm) {
		showError("Password wasn't match");
		pwdBox.focus();

		return false;
	} else {
		showError();

		return true;
	}
}

function showError(errorMessage) {
	let errorMessageBox = document.getElementById("error-message");

	if (errorMessage === null || errorMessage === undefined) {
		errorMessageBox.classList.add("d-none");
	} else {
		errorMessageBox.classList.remove("d-none");
		errorMessageBox.innerHTML = errorMessage;
	}
}

function checkBirthDay(birthDay) {
	let yourDate = new Date(birthDay);
	let today = new Date();

	return yourDate <= today;
}

function showIdFrontName(img) {
	if (img.files && img.files[0]) {
		let labelFront = document.getElementsByClassName("id")[0];

		labelFront.innerHTML = img.files[0].name;
	}
}

function showIdBackName(img) {
	if (img.files && img.files[0]) {
		let labelBack = document.getElementsByClassName("id")[1];

		labelBack.innerHTML = img.files[0].name;
	}
}

function countingTimeLogOut() {
	let countDown = 5;
	let id = setInterval(() => {
		countDown--;
		if (countDown >= 0) {
			$("#counter").html(countDown);
		}
		if (countDown === -1) {
			clearInterval(id);
			window.location.href = "login.html";
		}
	}, 1000);
}

function alertNotification() {
	alert("This feature is only available for verified accounts");
}

function verifiedAccount(username, status) {
	let url = "waiting_display.php?username=" + username + "&status=" + status;

	window.location.href = url;
}

function unlockAccount(username, status) {
	let url = "locked_display.php?username=" + username + "&status=" + status;

	window.location.href = url;
}

function idValidation() {
	let idFrontBox = document.getElementById("id-front");
	let idBackBox = document.getElementById("id-back");

	let idFront = idFrontBox.value.trim();
	let idBack = idBackBox.value.trim();

	let imgFormat = /\.(jpe?g|png|gif|bmp)$/i;

	if (!imgFormat.test(idFront) || idFront === "") {
		showError("Your id card was not invalid");
		idFrontBox.focus();

		return false;
	} else if (!imgFormat.test(idBack) || idBack === "") {
		showError("Your id card was not invalid");
		idBackBox.focus();

		return false;
	} else {
		showError();

		return true;
	}
}

function checkOldAndNew() {
	let oldPassBox = document.getElementById("old-pass");
	let newPassBox = document.getElementById("new-pass");
	let passConfirmBox = document.getElementById("pass-confirm");

	let oldPass = oldPassBox.value.trim();
	let newPass = newPassBox.value.trim();
	let passConfirm = passConfirmBox.value.trim();

	if (oldPass.length < 6) {
		showError("Your password must be at least 6 characters");
		oldPassBox.focus();

		return false;
	} else if (newPass.length < 6) {
		showError("Your password must be at least 6 characters");
		newPassBox.focus();

		return false;
	} else if (newPass.search(/[a-z]/i) < 0) {
		showError("Your password must contain at least one letter");
		newPassBox.focus();

		return false;
	} else if (newPass.search(/\d/) < 0) {
		showError("Your password must contain at least one digit");
		newPassBox.focus();

		return false;
	} else if (newPass !== passConfirm) {
		showError("Password wasn't match");
		passConfirmBox.focus();

		return false;
	} else {
		showError();

		return true;
	}
}

function checkMailAndPhone() {
	let emailBox = document.getElementById("email");
	let phoneBox = document.getElementById("phone");

	let email = emailBox.value.trim();
	let phone = phoneBox.value.trim();

	let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	let phoneFormat =
		/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

	if (!mailFormat.test(email)) {
		showError("You have entered an invalid email address!");
		emailBox.focus();

		return false;
	} else if (!phoneFormat.test(phone)) {
		showError("You have entered an invalid phone number!");
		phoneBox.focus();

		return false;
	} else {
		showError();

		return true;
	}
}

function checkOtp() {
	let otpBox = document.getElementById("otp");

	let otp = otpBox.value.trim();

	if (otp.length < 6) {
		showError("OTP must be at least 6 characters");

		return false;
	} else if (otp.length > 6) {
		showError("OTP can be greater than 6 characters");

		return false;
	} else {
		showError();

		return true;
	}
}

function checkCC() {
	let cardNumberBox = document.getElementById("card-num");
	let dateExpireBox = document.getElementById("date-expire");
	let cvvBox = document.getElementById("cvv");
	let depositMoneyBox = document.getElementById("deposit-money");

	let cardNumber = cardNumberBox.value.trim();
	let dateExpire = dateExpireBox.value.trim();
	let cvv = cvvBox.value.trim();
	let depositMoney = depositMoneyBox.value.trim();

	let moneyFormat = /^[0-9]*$/;

	if (!/^[0-9]{1,6}$/.test(cardNumber)) {
		showError("Card number must be digits");
		cardNumberBox.focus();

		return false;
	} else if (!checkDateExpire(dateExpire)) {
		showError("Invalid date expiration");
		dateExpireBox.focus();

		return false;
	} else if (!/^[0-9]{1,3}$/.test(cvv)) {
		showError("CVV must be digits");
		cvvBox.focus();

		return false;
	} else if (depositMoney.length == "") {
		showError("Money can not be empty");
		depositMoneyBox.focus();

		return false;
	} else if (!moneyFormat.test(depositMoney)) {
		showError("Invalid money");
		depositMoneyBox.focus();

		return false;
	} else {
		showError();

		return true;
	}
}

function checkDateExpire(date) {
	let dateExpire = new Date(date);
	let today = new Date();

	return dateExpire > today;
}

function checkTransfer() {
	let phoneBox = document.getElementById("phone");
	let moneyBox = document.getElementById("money-transfer");

	let phone = phoneBox.value.trim();
	let money = moneyBox.value.trim();

	let phoneFormat =
		/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
	let moneyFormat = /^[0-9]*$/;

	if (!phoneFormat.test(phone)) {
		showError("You have entered an invalid phone number!");
		phoneBox.focus();

		return false;
	} else if (money.length == "") {
		showError("Money can not be empty");
		moneyBox.focus();

		return false;
	} else if (!moneyFormat.test(money)) {
		showError("Invalid money");
		moneyBox.focus();

		return false;
	} else {
		showError();

		return true;
	}
}
