const mongoose = require('mongoose');

const articlesSchema = new mongoose.Schema({
    titleTheme: {
        type: String,
        require: true,
        trim: true
    },
    userName: {
        type: String,
        require: true,
        trim: true
    },
    articlePreview: {
        shortDescription: {
            type: String,
            require: true,
            trim: true
        },
        visible: {
            type: Boolean,
            default: false
        }
    },
    particularArticle: {
        articleText: {
            type: String,
            trim: true
        },
        articleUserIcon: {
            type: String,
            trim: true
        },
        articleLikesAmount: [{
            type: mongoose.Schema.Types.ObjectId
        }]
    },
    articleComments: [
        {
            userName: {
                type: String
            },
            userComment: {
                type: String
            },
            commentCreationDate: {
                type: String
            },
            commentLikes: [{
                type: mongoose.Schema.Types.ObjectId
            }],
            commentOwner: {
                type: mongoose.Schema.Types.ObjectId
            }
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    }
}, {
    timestamps: true
});

const Articles = mongoose.model('Article', articlesSchema);

module.exports = Articles;