var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var session = require("express-session");
var hbs = require("hbs");

require("dotenv").config();

var mongoose = require("mongoose");
mongoose.set("strictQuery", true);
mongoose
	.connect(process.env.DB_HOST)
	.then(() => console.log("Connect successfully!"))
	.catch(() => console.log("Connect error!"));

// route
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

hbs.registerPartials(__dirname + "/views/partials");

// app.use(function (req, res, next) {
// 	res.locals.error = req.session.error;
// 	delete req.session.error;
// 	next();
// });

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
	session({
		name: "user_sid",
		secret: process.env.SECRET_KEY,
		resave: false,
		saveUninitialized: false,
		cookie: {
			sameSite: true,
		},
	})
);
app.use(express.static(path.join(__dirname, "public")));

// route
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
