const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Please input your firstname"]
    },
    lastname: {
        type: String,
        required: [true, "Please input your lastname"]
    },
    email: {
        type: String,
        unique: true,
    },
    password:{
        type: String,
        required: ["Please input this field"]
    },


}, {timeStaps: true})


// UserSchema.pre("save",async function(next){
//     const salt = await bcrypt.genSalt(10)
//     const hash = await bcrypt.hash(this.password, salt)
//     this.password = hash
//     next()
// })

UserSchema.methods.generateJWT = function(){
const token = jwt.sign(
    {
        _id: this._id, 
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
    }, process.env.JWT_SECRET_KEY, {expiresIn: "1d"}
    )
    return token
}


const UserModel = mongoose.model("user", UserSchema)

module.exports = UserModel