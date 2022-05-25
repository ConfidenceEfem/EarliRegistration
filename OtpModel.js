const mongoose = require("mongoose")

const OtpSchema = new mongoose.Schema({
    otp: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdA: {type: Date, default: Date.now, index: {expires: 300}}
},{timestamps: true})

const otpModel = mongoose.model("otpModel", OtpSchema)

module.exports = otpModel
