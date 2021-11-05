const express = require('express');
const router = new express.Router();
const Room = require('../model/rooms');
const User = require('../model/users');
const auth = require('../middleware/auth');

router.get('/api/rooms/:userId', async (req, res) => {
    try {
        const rooms = await Room.find({
            "participants.userId": req.params.userId
        })
        if(rooms.length === 0) {
            throw new Error('No chat rooms for this user');
        }
        res.status(200).json(rooms);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
})

router.post('/api/rooms/:userId', async (req, res) => {
    try {
        const {participants, name} = req.body;
        const userId = req.params.userId;
        participants.push(userId);
        const room = new Room({
            administrator: userId,
            participants: participants.map((participant) => ({
                userId: participant,
                isNewMessage: false
            })),
            messages: [],
            name
        })
        await room.save();
        res.status(200).json(room)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/api/messages/:roomId', async (req, res) => {
    try {
        const message = req.body;  // {senderId, message, date}
        const roomId = req.params.roomId;
        const room = await Room.findById(roomId);
        room.participants.forEach(participant => {
            if(String(message.senderId) !== String(participant.userId)) {
                participant.isNewMessage = true;
            }
        })
        room.messages.push(message);
        await room.save();
        res.status(200).json(room)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.post('/api/messages/read/:roomId', async (req, res) => {
    try {
        // auth middleware req.user
        req.user = {
            _id: "617312e93b567e0016a59b2f"
        }
        const roomId = req.params.roomId;
        const room = await Room.findById(roomId);
        room.participants.forEach(participant => {
            if(String(participant.userId) === String(req.user._id)) {
                participant.isNewMessage = false;
            }
        })
        await room.save();
        res.status(200).json(room)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

module.exports = router