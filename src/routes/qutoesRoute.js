const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authToken')
const QutoesRoutes = require('../controllers/quotesController');

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


router.get('/quote/:id', QutoesRoutes.getQuoteById);
router.post('/like/:id', QutoesRoutes.like);
router.post('/dislike/:id', QutoesRoutes.dislike);
io.on('connection', (socket) => {
    socket.on('like', (data) => {
        io.emit('likeCountUpdated', { likeCount: updatedLikeCount });
    });

    socket.on('dislike', (data) => {
        io.emit('dislikeCountUpdated', { dislikeCount: updatedDislikeCount });
    });
});
router.post('/create/qoutoes',verifyToken, QutoesRoutes.qutoesCreate);
router.delete('/delete/qoutoe/:id',verifyToken, QutoesRoutes.deleteQutoes);
router.delete('/delete/user/:id', QutoesRoutes.deleteUser);
router.post('/create/comment/:id', QutoesRoutes.commentCreate);
router.get('/all/qutoes', QutoesRoutes.allQuotes);


module.exports = router;
