var popups = [],
    keys = {},

    levelHeight = 6,
    levelWidth = 15,

    popupWidth = window.screen.width, //1000,
    popupHeight = 50,
    popupGap = 50,

    didMove = false,

    playerX = 0,
    playerY = levelHeight - 1,

    barrels = [],
    barrelMap = {},

    lastBarrelMove = 0,
    lastPlayerMove = 0,

    running = true,
    
    closeButton;

var map = [
        '2 3            ',
        '            1  ',
        '1  1           ',
        '       1    1  ',
        '1    1         ',
        '            1  ',
    ];


function render() {
    popups.forEach(function (popup, y) {
        var s = '', x;

        for (x = 0; x < levelWidth; x ++) {
            if (barrelMap[x+','+y]) {
                s += '🔴';
            }
            else if (y == Math.floor(playerY) && x == Math.floor(playerX)) {
                if (didMove) {
                    if (Math.floor(performance.now()/200) % 2) {
                        s += '🚶';
                    }
                    else {
                        s += '🏃';
                    }
                }
                else {
                    s += '🚶';
                }
            }
            else {
                //if (map[y][x] == 0) s += '⠀';
                //if (map[y][x] == 0) s += '⬛';
                if (map[y][x] == '1') s += '⬆';
                else if (map[y][x] == '2') s += '🛢';
                else if (map[y][x] == '3') s += '🦍';
                else s += '⬜';
            }
        }

        if (popup.document.location) {
            popup.document.location.hash = '🔶' + s + '🔶';
        }
    });
}

function movePlayer() {
    var xMove = 0, yMove = 0;

    didMove = false;

    if (keys[37]) {
        didMove = true;
        playerX --; // left
    }
    if (keys[39]) {
        didMove = true;
        playerX ++; // right
    }

    if (keys[38]) {
        if (map[Math.floor(playerY)][Math.floor(playerX)] == '1') {
            didMove = true;
            playerY --; // up
        }
    }
    if (keys[40]) {
        if (Math.floor(playerY) < levelHeight - 1) {
            if (map[Math.floor(playerY)+1][Math.floor(playerX)] == '1') {
                didMove = true;
                playerY ++; // down
            }
        }
    }

    if (playerX < 0) playerX = 0;
    else if (playerX >= levelWidth) playerX = levelWidth - 1;

    if (playerY < 0) playerY = 0;
    else if (playerY >= levelHeight) playerY = levelHeight - 1;

    if (didMove) {
        lastPlayerMove = performance.now();
    }
}

function moveBarrels() {
    var freshBarrels = [];

    barrelMap = {};

    barrels.forEach(function (barrel) {
        if (barrel.d == 1) {
            if (barrel.x >= levelWidth - 1) {
                barrel.y ++;
                barrel.d = 0;
            }
            else {
                barrel.x ++;
            }
        }
        else {
            if (barrel.x <= 0) {
                barrel.y ++;
                barrel.d = 1;
            }
            else {
                barrel.x --;
            }
        }

        if (barrel.y < levelHeight) {
            barrelMap[barrel.x+','+barrel.y] = true;
            freshBarrels.push(barrel);
        }
    });

    barrels = freshBarrels;

    lastBarrelMove = performance.now();
}

function addBarrel() {
    barrels.push({x:3,y:0,d:1});

    setTimeout(addBarrel, 5000 + (Math.random() * 5000));
}

function loop() {
    var now = performance.now();

    if (!running) return;

    if (now - lastPlayerMove >= 200) movePlayer();
    if (now - lastBarrelMove >= 150) moveBarrels();

    render();

    setTimeout(loop, 1000/60);
}

function closeWindows() {
    running = false;

    popups.forEach(function (popup) {
        popup.close();
    });
}

function setup() {
    document.addEventListener('keydown', function (event) {
        keys[event.which] = true;
    });

    document.addEventListener('keyup', function (event) {
        keys[event.which] = false;
    });

    document.title = '-';

    closeButton = document.createElement('button');
    closeButton.innerHTML = 'close';
    closeButton.addEventListener('click', closeWindows);
    document.body.appendChild(closeButton);

    addBarrel();
    loop();
}
