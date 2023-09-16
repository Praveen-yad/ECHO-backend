const express = require("express")
const protect = require('../Middleware/authMiddleware')
const {sendMessage ,allMessages, deleteAll} = require('../Controllers/messageController')
const Router = express.Router()

Router.post('/', protect, sendMessage)
Router.get('/delete', deleteAll)
Router.get('/:chatId', protect, allMessages)

module.exports = Router