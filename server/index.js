require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./handlers/error');
const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');
const {loginRequired,ensureCorrectUser} = require('./middleware/auth');
const db = require('./models');

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/twitter-clone';

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/users/:id/messages', loginRequired, ensureCorrectUser, messagesRoutes);
app.use('/api/messages', loginRequired, async function(req,res,next){

    try {
        let messages = await db.Message.find().sort({createdAt: 'desc'}).populate('user', {
            username: true, profileImageUrl: true
        });
        console.log(messages);
        return res.status(200).json(messages);
    } catch (err) {
        return next(err);        
    }
});

app.use(function(req,res,next) {
    let err = new Error('Not Found!!');
    err.status = 404;
    next(err);
});

app.use(errorHandler);

app.listen(PORT, function(){
    console.log(`Server started on port ${PORT}`);
    console.log(`mongodb: ${MONGODB_URI}`);
});