const UserModel = require("../models/userModel")
const generateToken = require("./Config/generateToken")
const bcrypt = require("bcrypt")
const {sendMail, otp} = require("./sendMail")


const loginController = async (req,res) => {
    const {email, password} = req.body
    const user = await UserModel.findOne({email});
    if(user){
        const comparePassword = await bcrypt.compare(password, user.password)
        if(!comparePassword){
            res.status(400).send({sucess: false, message: "Invalid Username or Password"})
        }else{
            if(user.isVerified){
                const token = generateToken(user._id)
                res.status(200).send({sucess:true, response: user, token:token})
            }else{
                sendMail(user.email);
                res.status(400).send({sucess: false, response:user, message:"Email is not Verified"})
            }
        }
    }else{
        res.status(400).send({sucess:false, message: "Invalid Username or Password"})
    }
}


const registerController = async(req,res) => {
    const {name, email, password, pic} = req.body
    
    if(!name || !email || !password){
        res.status(400).send({sucess: false, message: "All necessary credentails have not been filled"})
    }

    const emailExist = await UserModel.findOne({email});
    if(emailExist){
        return res.status(400).send({sucess: false, message: "Email Already Exists"})
    }
    
    const nameExist = await UserModel.findOne({name});
    if(nameExist){
        return res.status(400).send({sucess: false, message: "Username Already Exists"})
    }
    const salt = await bcrypt.genSalt(10)
    const securePassowrd = await bcrypt.hash(password, salt)
    const user = await UserModel.create({
        name:name, 
        email:email,
        password:securePassowrd,
        pic:pic,
        isVerified: false
    })
    sendMail(user.email);
    res.status(200).send({sucess:true, response:user})
}


const otpVerification = async(req, res) => { 
    if(req.body.otp == otp){
        await UserModel.findOneAndUpdate({email: req.body.email}, {isVerified: true})
        res.status(200).send({sucess: true, message: "Otp Verified"})
    }else{
        res.status(400).send({sucess: false, message: "Incorrect OTP"})
    }
}

const searchUser = async(req, res) => {
    const keyword = req.query.search ? {
        $or:[
            {name: {$regex: req.query.search, $options: 'i'}},
            {email: {$regex: req.query.search, $options: 'i'}}
        ],
    }:{}

    const users = await UserModel.find(keyword).find({_id: {$ne: userData._id}})
    res.send(users)
}


module.exports = {registerController, loginController, otpVerification, searchUser}