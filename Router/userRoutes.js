const express = require("express")
const {registerController, loginController, otpVerification, searchUser} = require("../Controllers/userController");
const protect = require("../Middleware/authMiddleware");

const Router = express.Router();

Router.post('/login', loginController)
Router.post('/register', registerController)
Router.post('/verify', otpVerification)
Router.post('/find',protect, searchUser)


module.exports = Router