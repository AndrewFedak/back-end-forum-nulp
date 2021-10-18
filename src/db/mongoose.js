const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGODB_URL;
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});