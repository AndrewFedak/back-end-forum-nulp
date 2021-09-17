const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGODB_URL || "mongodb+srv://admin:Dubau2002@forumcluster.uok4s.mongodb.net/forum-db?retryWrites=true&w=majority"
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});