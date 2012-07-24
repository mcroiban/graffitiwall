var Socket = (function(host, port){
    var socket = io.connect('http://' + host + ':' + port);
    socket.on('connect', function(){});

    return {
        send: function(message) {
            socket.emit('message', message);
        },
        draw: function(data) {
            socket.emit('draw', data);
        },
        addCallback: function(name, callback) {
            socket.on(name, callback);
        }
    };
});