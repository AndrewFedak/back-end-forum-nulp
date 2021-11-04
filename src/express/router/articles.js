const express = require('express');
const router = new express.Router();
const Articles = require('../model/articles');
const auth = require('../middleware/auth');

router.get('/api/articles', async (req, res) => {
    const {page, limit = 9, searchValue = ''} = req.query;
    try {
        const regExp = new RegExp(searchValue, 'gi');
        const allArticles = await Articles.find({titleTheme: regExp})
        const [amount, paginatedArticles] = await Promise.all(
            [allArticles.countDocuments(),
                allArticles
                .skip((page-1)*limit)
                .limit(+limit)
            ])
        res.status(200).send({
            amount,
            articles: paginatedArticles
        })
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/api/article/create', auth, async (req, res) => {
    const {titleTheme, articleText, shortDescription} = req.body;
    const userName = req.user.dataUserName;
    const articleUserIcon = req.user.dataUserIcon;
    const article = new Articles({
        titleTheme: titleTheme,
        userName: userName,
        articlePreview: {
            shortDescription: shortDescription
        },
        particularArticle: {
            articleText: articleText,
            articleUserIcon: articleUserIcon
        },
        owner: req.user._id
    });
    try {
        await article.save();
        res.status(200).send(article)
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/api/articles/add-comment/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const article = await Articles.findOne({_id});
        const {userName, userComment, commentOwner} = req.body;

        article.articleComments = article.articleComments.concat({
            userName,
            userComment,
            commentCreationDate: new Date().toISOString().substring(0, 10).replace(/-/g, '.'),
            commentLikes: [],
            commentOwner
        });

        await article.save();
        res.send(article)
    } catch (e) {
        res.status(400).send()
    }
});

router.post('/api/articles/like-comment', auth, async (req, res) => {
    try {
        const {_id, articleId} = req.body;
        const article = await Articles.findById(articleId);
        const idx = article.articleComments.findIndex((item) => {
            return String(item._id) === String(_id);
        });

        if (idx <= -1) {
            throw new Error('idx is not defined');
        }

        const isLiked = article.articleComments[idx].commentLikes.includes(req.user._id);

        const likedIdx = article.articleComments[idx].commentLikes.findIndex((item) => {
            return String(item) === String(req.user._id)
        });


        if (article.articleComments[idx].commentLikes.length === 0 || !isLiked) {
            article.articleComments[idx].commentLikes = article.articleComments[idx].commentLikes.concat(req.user._id);
        } else if (isLiked) {
            article.articleComments[idx].commentLikes = [...article.articleComments[idx].commentLikes.slice(0, likedIdx), ...article.articleComments[idx].commentLikes.slice(likedIdx + 1)];
        }
        await article.save();
        return res.send(article)
    } catch (e) {
        res.status(404).send({
            message: e.message
        })
    }
});

router.post('/api/articles/like-article', auth, async (req, res) => {
    try {
        const {articleId} = req.body;
        const article = await Articles.findById(articleId);
        const idx = article.particularArticle.articleLikesAmount.findIndex((item) => {
            return String(item) === String(req.user._id);
        });

        if (idx <= -1) {
            article.particularArticle.articleLikesAmount = article.particularArticle.articleLikesAmount.concat(req.user._id);
        } else if (idx > -1) {
            article.particularArticle.articleLikesAmount = [...article.particularArticle.articleLikesAmount.slice(0, idx), ...article.particularArticle.articleLikesAmount.slice(idx + 1)];
        }
        await article.save();
        return res.send(article)
    } catch (e) {
        res.status(404).send({
            message: e.message
        })
    }
});

router.get('/api/articles/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const article = await Articles.findOne({_id});
        res.status(200).send(article)
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;