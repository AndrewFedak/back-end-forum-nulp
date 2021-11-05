const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    administrator: {
        type: mongoose.Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId
        },
        isNewMessage: {
            type: Boolean
        }
    }],
    messages: [{
        senderId: {
            type: mongoose.Schema.Types.ObjectId
        },
        message: {
            type: String
        },
        date: {
            type: String
        }
    }]
}, {
    timestamps: true
});

const Room = new mongoose.model('Room', roomSchema);

module.exports = Room;