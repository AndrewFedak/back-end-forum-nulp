const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    dataUserName: {
        type: String,
        require: true,
        trim: true
    },
    dataUserEmail: {
        unique: true,
        type: String,
        require: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        }
    },
    dataUserPassword: {
        type: String,
        require: true,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot be password');
            }
        }
    },
    dataUserIcon: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);
    // console.log(token);
    user.tokens = user.tokens.concat({token});

    await user.save();
    return token
};

userSchema.statics.findByCredentials = async (dataUserEmail, dataUserPassword) => {
    const user = await User.findOne({dataUserEmail});
    if (!user) {
        throw new Error('Unable to log in')
    }


    const isMatch = await bcrypt.compare(dataUserPassword, user.dataUserPassword);

    if (!isMatch) {
        throw new Error('Unable to log in')
    }

    return user;
};


userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('dataUserPassword')) {
        user.dataUserPassword = await bcrypt.hash(user.dataUserPassword, 8);
    }

    next();
});

const User = new mongoose.model('User', userSchema);

module.exports = User;