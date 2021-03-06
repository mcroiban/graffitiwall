var Socket = (function(host, port){
    if (typeof io === 'undefined') {
        return false;
    }
    var socket = io.connect('http://' + host + ':' + port);
    socket.on('connect', function(){});

    return {
        send: function(message) {
            socket.emit('message', message);
        },
        draw: function(data) {
            socket.emit('draw', data);
        },
        emit: function(type, data) {
            socket.emit(type, data);
        },
        addCallback: function(name, callback) {
            socket.on(name, callback);
        },
        replay: function(namespace) {
            socket.emit('replay', {namespace: namespace});
        },
        timelapse: function() {
            socket.emit('timelapse');
        }
    };
});
