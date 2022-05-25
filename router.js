const express = require("express")
const router = express.Router()
const {RegisterUser,VerifyOTP,VerifyOTPForLogin,LoginUsers,getAllUsers,} = require("./controller")

router.post("/register", RegisterUser)
router.post("/verify", VerifyOTP)
router.post("/login",LoginUsers )
router.post("/verifylogin", VerifyOTPForLogin)
router.get("/allusers", getAllUsers)

module.exports = router