const app = require('./app');
const dotenv = require('dotenv');

const connectDatabase = require('./config/database');

dotenv.config({ path: 'backend/config/config.env' });

process.on('uncaughtException', error => {
    console.log(`Error: ${error.message}`);
    console.log('Shutting down the server due to Uncaught Exception.');
    server.close();
    process.exit(1);
});

connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started at port ${process.env.PORT}`);
});

process.on('unhandledRejection', error => {
    console.log(`Error: ${error.message}`);
    console.log('Shutting down the server due to Unhandled Rejection.');
    server.close();
    process.exit(1);
});
