const bcrypt = require("bcrypt")
const _ = require("lodash")
const axios = require("axios")
const otpGenerator = require("otp-generator")
const UserModel = require("./UserModel")
const otpModel = require("./OtpModel")
const {google} = require("googleapis")
const nodemailer = require("nodemailer")
require("dotenv").config()
const jwt = require("jsonwebtoken")



const RegisterUser = async (req,res)=>{

    try{
        const {email, password, firstname, lastname} = req.body
        const user = await UserModel.findOne({email})
        if(user){
            res.status(400).send("User already registered")
        }else{
            const OTP = otpGenerator.generate(6,{
                digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
            })

            // const accessToken = await oAuth2Client.getAccessToken()

            const mailTransporter =  nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            }
        })

            let details = {
                from: process.env.USER,
                to: req.body.email,
                subject: "Verify your Email Account with Earli Finance", 
                html: `This is your OTP:${OTP}. Copy it and paste in your inputs `
            }
            mailTransporter.sendMail(details, (err)=>{
                    if(err){
                        console.log("It has an error", err)
                    }else{
                        console.log("Email has been sent successfully",details.message)
                    }
            })

            console.log(OTP)

            const otp = new otpModel({ 
                otp: OTP,
                email: req.body.email
            })




            const salt = await bcrypt.genSalt(10)
            otp.otp = await bcrypt.hash(otp.otp, salt)

            const result = await otp.save()

            res.status(201).send("OTP  send successfully")
        }
       
    }catch(error){
        res.status(404).json({message: error.message})
    }
}

const VerifyOTP = async (req,res)=>{
    try{
        const {email, password, firstname, lastname,otp} = req.body
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password,salt)

        const otpHolder = await otpModel.find({email})
        if(otpHolder.length === 0){
            res.status(400).send("You use an expired OTP")
        }else{
            const  rightOtpFind = otpHolder[otpHolder.length - 1]
            const validUser = await bcrypt.compare(otp, rightOtpFind.otp)
            if(validUser){
                    const user = await UserModel.create({email, password:hash, firstname, lastname})
                    const token = user.generateJWT()
                    const result = await user.save()
                    const OTPDelete = await otpModel.deleteMany({
                        email: rightOtpFind.email
                    })
                    return res.status(200).json({message: "User Regisered successfully",token: token, data: result})
            }else{
                res.status(400).send("Invalid OTP")
            }
        }



    }catch(error){
        res.status(400).json({message: error.message})
    }
}


const LoginUsers = async (req,res)=>{
    try{
        const  {email, password} = req.body
        const findUser = await UserModel.findOne({email: email})
        if(!findUser){
          res.status(400).json({message: "User Does not Exist"})
        }else{
            const checkPassword = await bcrypt.compare(password,findUser.password)
            if(!checkPassword){
                res.status(400).json({message: "Incorrect Password"})     
            }else{
                const OTP = otpGenerator.generate(6,{
                    digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
                })
    
                const mailTransporter =  nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS,
                }
            })
    
                let details = {
                    from: process.env.USER,
                    to: req.body.email,
                    subject: "Verify your Email Account with Earli Finance", 
                    html: `This is your OTP:${OTP}. Copy it and paste in your inputs `
                }
                mailTransporter.sendMail(details, (err)=>{
                        if(err){
                            console.log("It has an error", err)
                        }else{
                            console.log("Email has been sent successfully")
                        }
                })
    
                console.log(OTP)
    
                const otp = new otpModel({ 
                    otp: OTP,
                    email: req.body.email
                })

                const salt = await bcrypt.genSalt(10)
                otp.otp = await bcrypt.hash(otp.otp, salt)
    
                const result = await otp.save()
    
                res.status(201).send("OTP  send successfully")
            }
        }
          
    }catch(error){
        res.status(400).json({message:error.message})
    }

}


const VerifyOTPForLogin = async (req,res)=>{
    try{
        const {email, password,otp} = req.body

        const otpHolder = await otpModel.find({email})
        if(otpHolder.length === 0){
            res.status(400).send("You use an expired OTP")
        }else{
            const  rightOtpFind = otpHolder[otpHolder.length - 1]
            const validUser = await bcrypt.compare(otp, rightOtpFind.otp)
            if(validUser){
                const findUser = await UserModel.findOne({email: email})
                if(!findUser){
                        res.status(404).json({message: "Invalid User"})
                }else{
                    const {password, ...doc} = findUser._doc
                    const token = jwt.sign(
                        {_id: findUser._id,
                        firstname:findUser.firstname,
                        lastname: findUser.lastname,
                    email:findUser.email},
                        process.env.JWT_SECRET_KEY,
                        {expiresIn: "2d"}
                    )

                 await otpModel.deleteMany({
                        email: rightOtpFind.email
                    })
                    
                    return res.status(200).json({message: "User Regisered successfully",token: token, data: {...doc}})
                }
                
            }else{
                res.status(400).send("Invalid OTP")
            }
        }

    }catch(error){
        res.status(400).json({message: error.message})
    }
}

const getAllUsers = async (req,res)=>{
    try{
            const getAll = await UserModel.find()
            res.status(201).json({message: "All Users", data: getAll})
    }catch(error){
        res.status(400).json({message: error.message})
    }
}

module.exports = {
RegisterUser,VerifyOTP,LoginUsers,VerifyOTPForLogin,getAllUsers
}