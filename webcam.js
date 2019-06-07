var popups = [],
    video = document.createElement('video'),
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    vWidth, vHeight,
    oWidth, oHeight,
    palette;

function loop() {
    var x, y, i, r, g, b;

    context.drawImage(video, 0, 0, oWidth, oHeight);
    data = context.getImageData(0, 0, oWidth, oHeight).data;

    popups.forEach(function (popup, y) {
        var s = '';

        y *= 2;

        for (x = 0; x < oWidth; x ++) {
            i = 4 * ((y * oWidth) + x);

            r = Math.floor(data[i + 0] / 16);
            g = Math.floor(data[i + 1] / 16);
            b = Math.floor(data[i + 2] / 16);

            s += palette[r][g][b].s;
        }

        popup.document.location.hash = s;
    });

    setTimeout(loop, 1000/10);
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
    var xhr = new XMLHttpRequest();

    closeButton = document.createElement('button');
    closeButton.innerHTML = 'close';
    closeButton.addEventListener('click', closeWindows);
    document.body.appendChild(closeButton);

    xhr.open('GET', 'palette.json');
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState == 4) {
            palette = JSON.parse(xhr.responseText);

            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({video: true})
                .then(function (stream) {
                    video.srcObject = stream;
                    video.play();

                    setTimeout(function () {
                        vWidth = video.videoWidth || video.naturalWidth || video.width;
                        vHeight = video.videoHeight || video.naturalHeight || video.height;

                        oHeight = popups.length * 2;
                        oWidth = Math.floor((vWidth/vHeight) * oHeight);

                        canvas.width = oWidth;
                        canvas.height = oHeight;

                        loop();
                    }, 1000);
                })
                .catch(function (error) {
                    console.log("Something went wrong!");
                });
            }
        }
    });
    xhr.send();

    popups.forEach(function (popup) {
        popup.history.replaceState({}, '', '/');
    });
}
