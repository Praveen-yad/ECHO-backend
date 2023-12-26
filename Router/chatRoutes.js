const express = require('express')
const protect = require('../Middleware/authMiddleware')
const { accessChat,fetchChats,createGroupChat,renameGroup,removeFromGroup,addToGroup, sendReciver,AddNewMessage,RemoveNewMessage,deleteChat} = require("../Controllers/chatController")
const Router = express.Router()

Router.post("/", protect, accessChat)
Router.get("/", protect, fetchChats)
Router.post("/group", protect, createGroupChat)
Router.put("/rename", protect, renameGroup)
Router.put("/groupremove", protect, removeFromGroup)
Router.put("/groupadd", protect, addToGroup)
Router.post("/getreciver", protect, sendReciver)
Router.post("/addnew", protect, AddNewMessage)
Router.post("/removenew", protect, RemoveNewMessage)
Router.post("/deletechat", protect, deleteChat)

module.exports = Router