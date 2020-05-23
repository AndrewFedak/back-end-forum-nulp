const express = require('express');
const User = require('../model/users');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

router.post('/authenticate', async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.generateAuthToken();
        await user.save();
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send({error: e});
    }
});

router.post('/authenticate/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.dataUserEmail, req.body.dataUserPassword);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/logout', auth, async (req, res) => {
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

router.get('/profile', auth, async (req, res) => {
    try {
        const {dataUserName, dataUserEmail, _id, dataUserIcon} = req.user;
        res.send({dataUserName, dataUserEmail, _id, dataUserIcon})
    } catch (e) {
        res.status(500).send()
    }
});

router.get('/online', async (req, res) => {
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

const upload = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            cb(new Error('Your file type is forbidden!'))
        }
        cb(undefined, true);
    }
});

router.post('/api/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    req.user.dataUserIcon = buffer;
    await req.user.save();
    res.send('Good');
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
});

router.get(`/api/avatar/:id`, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.dataUserIcon) {
            throw new Error('Gg')
        }
        res.set('Content-Type', 'img/png');
        res.send(user.dataUserIcon)
    } catch (e) {
        res.status(404).send()
    }

});

module.exports = router;