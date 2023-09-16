const mongoose = require("mongoose")

const userModel = mongoose.Schema({
    name:{
        type: String,
        required :true
    },
    email:{
        type: String,
        required :true
    },
    pic:{
        type:String
    },
    password:{
        type: String,
        required :true
    },
    isVerified:{
        type: Boolean
    }
},{
    timestamps: true
})

const User = mongoose.model("User", userModel);
module.exports = User; 