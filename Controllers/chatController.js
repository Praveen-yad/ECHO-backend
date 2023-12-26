const Chat = require("../models/chatModel")
const User = require("../models/userModel")

const accessChat =  async(req, res) => {
    const { userId } = req.body

    if(!userId){
        return res.status(400).send({sucess:false, message: "userId not Provided"})
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and:[
            {users: {$elemMatch: {$eq: userData._id}}},
            {users: {$elemMatch: {$eq: userId}}},
        ],
    }).populate("users", "-password").populate("latestMessage")

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name email pic",
    })

    if(isChat.length>0){
        res.status(200).send({sucess: true, response: isChat[0]})
    }else{
        let chatData = {
            chatName: "sender",
            isGroupChat:false,
            users:[userData._id, userId],
            newMessage: false
        }

        try{
            const createdChat = await Chat.create(chatData)
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password")
            res.status(200).send({sucess:true, response: FullChat})
        }catch(err){
            res.status(400).send({sucess:false, message: "An Error Occoured"})
        }
    }
}

const fetchChats = async(req,res) => {
    try{
        await Chat.find({users: {$elemMatch : {$eq: userData._id}}})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({updatedAt: -1})
        .then(async(result) => {
            await User.populate(result, {
                path: "latestMessage.sender",
                select: "name email pic",
            });
            res.status(200).send(result)
        })
    }catch(err){
        res.status(400).send({sucess:false, message:"Unexpected error occoured"})
    }
}

const createGroupChat = async(req,res) => {
    if(!req.body.users || !req.body.name){
        return res.status(400).send({sucess: false, message:"Incomplete Information"})
    }

    let users = JSON.parse(req.body.users);

    if(users.length < 2){
        return res.status(400).send({sucess: false, message: "Two or more people are required to create a group"})
    }

    users.push(userData._id)

    try{
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: userData._id
        })

        const fullGroupChat = await Chat.findOne({_id : groupChat._id})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

        res.status(200).send({sucess: true, response: fullGroupChat})
    }catch(err){
        res.status(400).send({sucess: false})
    }
}

const renameGroup = async(req,res) => {
    const { chatId, chatName } = req.body

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName
        },
        {
            new: true
        }
    )

    res.send({sucess: true, response: updatedChat})
}

const removeFromGroup = async(req,res) => {
    const { chatId, userId } = req.body
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull:{users: userId}
        },
        {
            new: true
        }
    )
    if(!removed){
        res.status(400).send({sucess: false})
    }else{
        res.status(200).send({removed})
    }
}

const addToGroup = async(req,res) => {
    const { chatId, userId } = req.body
    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push:{users: userId}
        },
        {
            new: true
        }
    )
    if(!added){
        res.status(400).send({sucess: false})
    }else{
        res.status(200).send({added})
    }
}

const sendReciver = async(req,res) => {
    const {chatId} = req.body
    try{
        let chat = await Chat.findById(chatId).populate("users")
        res.status(200).send(chat)
    }catch(err){
        res.status(400).send({sucess:false})
    }
}

const AddNewMessage = async(req, res) => {
    try{
        await Chat.findOneAndUpdate({_id:req.body.chatId}, {newMessage:true},{timestamps: false})
        res.status(200).send({sucess: true})
    }catch(err){
        res.status(400).send({sucess: false})
    }
}

const RemoveNewMessage = async(req,res) => {
    try{
        await Chat.findOneAndUpdate({_id:req.body.chatId}, {newMessage: false},{timestamps: false})
        
        res.status(200).send({sucess: true})
    }catch(err){
        res.status(400).send({sucess: false})
    }
}

const deleteChat = async(req,res) => {
    try{
        await Chat.findOneAndDelete({_id: req.body.chatId})
        res.status(200).send({sucess:true})
    }catch(err){
        res.status(400).send({sucess:false})
    }
}

module.exports = { accessChat,fetchChats,createGroupChat,renameGroup,removeFromGroup,addToGroup,sendReciver,RemoveNewMessage,AddNewMessage, deleteChat}