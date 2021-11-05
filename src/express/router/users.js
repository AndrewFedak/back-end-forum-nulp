const express = require('express');
const User = require('../model/users');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

router.post('/api/registration', async (req, res) => {

    try {
        const user = new User(req.body);
        const token = await user.generateAuthToken();

        await user.save();
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send({error: 'Ви вже зареэстровані'});
    }
});

router.post('/api/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.dataUserEmail, req.body.dataUserPassword);
        if(!user) {
            throw new Error('Ви не зареєстровані')
        }
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(404).send({error: e.message});
    }
});

router.post('/api/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });
        await req.user.save();
        res.send()
    } catch (e) {
        res.status(400).send(e)
    }
});

router.get('/api/profile', auth, async (req, res) => {
    try {
        const {dataUserName, dataUserEmail, _id, dataUserIcon} = req.user;
        res.send({dataUserName, dataUserEmail, _id, dataUserIcon})
    } catch (e) {
        res.status(500).send()
    }
});

router.put('/api/profile', auth, async (req, res) => {
    try {
        if(!req.body.dataUserPassword.trim()) {
            req.body.dataUserPassword = req.user.dataUserPassword;
        }
        const user = await User.findOneAndUpdate({_id: req.user._id}, req.body);
        await user.save();
        res.status(200).send({
            ...req.user,
            ...req.body
        });
    } catch (e) {
        res.status(500).send(e)
    }
});

router.get('/api/online', async (req, res) => {
    try {
        const array = await User.find({});
        const filteredArray = array.filter((item) => {
            return item.tokens.length > 0;
        }).map((item) => item.dataUserName);
        res.send(filteredArray);
    } catch (e) {
        res.status(500).send({
            error: 'Error'
        })
    }
});

router.post('/api/users', async (req, res) => {
    try {
        const userIds = req.body.userIds;
        let users;
        if(!userIds) {
            users = await User.find({});
        } else {
            users = await User.find({_id: { $in: userIds}});
        }
        res.send(users);
    } catch (e) {
        console.log(e);
        res.status(500).send({
            error: 'Error'
        })
    }
});

const upload = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg|.JPG|.tif)$/)) {
            cb(new Error('Your file type is forbidden!'))
        }
        cb(undefined, true);
    }
});

router.post('/api/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    req.user.dataUserIcon = buffer;
    await req.user.save();
    res.status(200).send(req.user);
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
});

router.get(`/api/avatar/:id`, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user.dataUserIcon) {
            throw new Error('Немає фото')
        }
        res.set('Content-Type', 'img/png');
        res.send(user.dataUserIcon)
    } catch (error) {
        res.status(404).send({error})
    }
});

module.exports = router;