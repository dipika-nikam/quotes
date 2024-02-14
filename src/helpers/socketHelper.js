
function setupSocketListeners(io) {
    io.on('connection', function(socket) {
        console.log('a user has connected!');
        
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
    });

    io.on('like', function(data) {
        updateLikeCount(data);
    });

    io.on('dislike', function(data) {
        updateDislikeCount(data);
    });
}

function updateLikeCount(data) {
    const likeCountElement = document.getElementById('like-count-' + data.quote_id);
    if (likeCountElement) {
        likeCountElement.innerText = data.like_count;
    }
}

function updateDislikeCount(data) {
    const dislikeCountElement = document.getElementById('dislike-count-' + data.quote_id);
    if (dislikeCountElement) {
        dislikeCountElement.innerText = data.dislike_count;
    }
}

module.exports = setupSocketListeners; 
