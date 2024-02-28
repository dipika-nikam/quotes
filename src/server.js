const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const qutoesRoutes = require('./routes/qutoesRoute')
const path = require('path');
const http = require('http');
const app = express();
const socketIo = require('socket.io');

const setupSocketListeners = require('./helpers/socketHelper')
const exphbs  = require('express-handlebars');


app.get('/reset-password', (req, res) => {
    res.render('reset-password');
});

app.use(express.static(path.join(__dirname, "/")));
  app.set("views", path.join(__dirname, "public/"));

app.set("view engine", "hbs");

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('like', (data) => {
        io.emit('likeCountUpdated', { quoteId: data.quoteId, likeCount: data.likeCount });
    });

    socket.on('dislike', (data) => {
        io.emit('dislikeCountUpdated', { quoteId: data.quoteId, dislikeCount: data.dislikeCount });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;
app.use('/api/auth', userRoutes);
app.use('/v1', qutoesRoutes)


mongoose.connect(process.env.URL)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(port, function () {
            console.log('listening on *:' + port);
        });
        // setupSocketListeners(io);
        // console.log('socket connected!');
    })
    .catch((error) => {
        console.log(error);
    });