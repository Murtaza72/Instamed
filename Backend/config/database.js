const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose
        .connect(
            `mongodb+srv://${process.env.MONGO_USERID}:${process.env.MONGO_PASSWORD}@instamed.viyjmtt.mongodb.net/`
        )
        .then(data => {
            console.log(`Connected to ${data.connection.host}`);
        })
        .catch(error => {
            console.log(error);
        });
};

module.exports = connectDatabase;
