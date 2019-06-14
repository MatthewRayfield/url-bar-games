var popups = [];

function loop() {
    popups.forEach(function (popup, y) {
        var i,
            s = '#',
            l = Math.round(Math.sin(performance.now()/200 + (y/2)) * 5) + 5;

        s += String.fromCharCode(0x2588);

        for (i = 0; i < l; i ++) {
            //s += String.fromCharCode(0x2581);
            s += String.fromCharCode(0x2588);
        }

        //s += 'x';

        popup.document.location.hash = s;
    });

    setTimeout(loop, 1000/20);
}

function closeWindows() {
    var popup;

    running = false;

    while (popups.length) {
        popup = popups.shift();
        popup.close();
    }
}

function setup() {
    var closeButton;

    closeButton = document.createElement('button');
    closeButton.innerHTML = 'close';
    closeButton.addEventListener('click', closeWindows);
    document.body.appendChild(closeButton);

    loop();

    /*popups.forEach(function (popup) {
        popup.history.replaceState({}, '', '/');
    });*/
}
