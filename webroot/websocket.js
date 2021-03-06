$(function(){
    // Create graffiti wall instance
    var _namespace = namespace || window.location.pathname || '';
    var canvasObject = CanvasObject($('#draw-canvas'));
    var wall = Wall(canvasObject);
    var timelapseCanvas = CanvasObject($('#timelapse-canvas'));
    timelapseCanvas.resizeToElement($('#main_content'), function(){});
    var timelapse = Timelapse(timelapseCanvas);

    // Instansiate interface
    var wallInterface = WallInterface();

    // Set color and width callbacks and defaults
    wallInterface.onColorSelect(function(color) {
        wall.setColor(color);
    });

    wall.setColor(wallInterface.getRandomColor());

    wallInterface.onWidthSelect(function(width) {
        wall.setWidth(width);
    });

    wall.setWidth(wallInterface.getDefaultWidth());

    // Configure socket
    var socket = Socket(window.location.host, 12346);
    // Handle if server is down
    if (! socket) {
        wallInterface.showError();
        return;
    }
    socket.addCallback('count', function(count) {
        $('#connected').text(count);
    });

    // Set up socket draw callback
    socket.addCallback('draw', function(data) {
        wall.draw(data);
    });

    socket.addCallback('replay', function(response) {
        wallInterface.progress(response.index, response.total);
        for (var i = 0, length = response.data.length; i < length; i++) {
            wall.draw(response.data[i]);
        }

        if (response.end) {
            wallInterface.switchToDraw();
            wall.enable();
        }
    });

    timelapse.progressCallback(function(i, t) {
        wallInterface.progress(i, t);
    });

    socket.addCallback('timelapse', function(response){
        timelapse.receive(response.data);
    });

    // Make it resize to element size and start the wall
    wall.resizeToElement($('#main_content'), function() {
        wallInterface.switchToLoading();
        wall.disable();
        socket.replay(_namespace);
    });

    // Set up sending draw data to server callback
    wall.setDrawCallback(function(data) {
        // Add the namespace
        data.namespace = _namespace;
        // Send data to socket
        socket.draw(data);
    });

    // Attach navbar buttons
    $('#wall').on('click', 'a', function(e){
        e.preventDefault();

        wall.enable();
        $('.nav li.nav-link').removeClass('active');
        $(this).parent().addClass('active');
        wallInterface.showDraw();
    });

    $('#about').on('click', 'a', function(e) {
        e.preventDefault();

        wall.disable();
        $('.nav li.nav-link').removeClass('active');
        $(this).parent().addClass('active');
        wallInterface.showAbout();
    });

    // Attach time lapse functions
    $('#timelapse').on('click', 'a', function(e){
        e.preventDefault();
        wall.disable();

        $('.nav li.nav-link').removeClass('active');
        $(this).parent().addClass('active');
        wallInterface.showTimelapse();
        socket.timelapse(_namespace);
        timelapse.start();
    });
});

