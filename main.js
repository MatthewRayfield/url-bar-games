var popups = [],
    keys = {},

    pauline = ['💃', '🕺', '🍔'][Math.floor(Math.random()*3)],

    level = 1,
    lives = 3,

    levelHeight = 7,
    levelWidth = 15,

    popupWidth = window.screen.width,
    popupHeight = 50,
    popupGap = 50,

    didMove = false,

    playerX = 0,
    playerY = levelHeight - 1,
    death = 0,

    barrels = [],
    barrelMap = {},
    barrelSpeed = 150,
    barrelRate = 5000,
    barrelBaseRate = 3000,

    nextBarrelAdd = 0,
    lastBarrelMove = 0,
    lastPlayerMove = 0,

    levelWon = false,
    showingLevel = false,
    gameover = false,
    running = false,
    
    closeButton;

var map = [
        '               '.split(''),
        '        1      '.split(''),
        '            1  '.split(''),
        '1  1           '.split(''),
        '       1    1  '.split(''),
        '1    1         '.split(''),
        '            1  '.split(''),
    ];


function render() {
    var timeToBarrel = nextBarrelAdd - performance.now(),
        barrelShown = false,
        gorillaX = 2;

    if (timeToBarrel < 5000 && timeToBarrel > 4000) {
        barrelShown = true;
    }
    if (timeToBarrel < 4000 && timeToBarrel > 3000) {
        barrelShown = true;
    }
    if (timeToBarrel < 3000 && timeToBarrel > 2000) {
        barrelShown = true;
        gorillaX = 1;
    }
    if (timeToBarrel < 2000 && timeToBarrel > 1000) {
        gorillaX = 1;
    }

    popups.forEach(function (popup, y) {
        var s = '', x;

        if (!popup.document.location) return;

        if (showingLevel) {
            if (y == 1) {
                for (x = 0; x < levelWidth; x ++) {
                    if ((Math.floor(performance.now()/400) + x) % 2) {
                        s += '🔺';
                    }
                    else {
                        s += '🔻';
                    }
                }
            }
            else if (y == 2) {
                s = toFullWidth('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀LEVEL:' + level);
            }
            else if (y == 3) {
                s = toFullWidth('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀LIVES:' + lives);
            }
            else if (y == 4) {
                for (x = 0; x < levelWidth; x ++) {
                    if ((Math.floor(performance.now()/400) + x) % 2) {
                        s += '🔻';
                    }
                    else {
                        s += '🔺';
                    }
                }
            }
            else {
                s = '';
            }

            popup.document.location.hash = s;
        }
        else if (gameover) {
            if (y == 1) {
                for (x = 0; x < levelWidth; x ++) {
                    if ((Math.floor(performance.now()/200) % levelWidth) == levelWidth - x) {
                        s += '🦍';
                    }
                    else {
                        s += '💀';
                    }
                }
            }
            else if (y == 2) {
                s = toFullWidth('⠀⠀⠀⠀⠀⠀⠀⠀⠀GAME⠀OVER');
            }
            else if (y == 3) {
                s = toFullWidth('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀LEVEL:' + level);
            }
            else if (y == 4) {
                for (x = 0; x < levelWidth; x ++) {
                    if ((Math.floor(performance.now()/200) % levelWidth) == x) {
                        s += '🦍';
                    }
                    else {
                        s += '💀';
                    }
                }
            }
            else {
                s = '';
            }

            popup.document.location.hash = s;
        }
        else {
            for (x = 0; x < levelWidth; x ++) {
                if (y == Math.floor(playerY) && x == Math.floor(playerX)) {
                    if (death > 0) {
                        if (Math.floor(death) % 2) {
                            s += '💀';
                        }
                        else {
                            s += '🚶';
                        }
                    }
                    else {
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
                }
                else if (y == 1 && x == gorillaX) {
                    s += '🦍';
                }
                else if (y == 1 && x == 0 && barrelShown) {
                    s += '🛢';
                }
                else if (barrelMap[x+','+y]) {
                    s += '🔴';
                }
                else if (y == 0 && (x < 5 || x > 9)) {
                    s += '🔶';
                }
                else if (y == 0 && x == 6) {
                    s += pauline;
                }
                else if (levelWon && y == 0 && x == 7) {
                    if (Math.floor(performance.now()/400) % 2) {
                        s += '💖';
                    }
                    else {
                        s += '💕';
                    }
                }
                else {
                    if (map[y][x] == '1') s += '⬆';
                    else s += '⬜';
                }
            }

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

    if (playerY == 0) {
        levelWon = true;
        running = false;
        setTimeout(function () {
            levelWon = false;
            nextLevel();
            setupLevel();
            showLevel();
        }, 3000);
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
    barrels.push({x:2, y:1, d:1});

    nextBarrelAdd = performance.now() + barrelBaseRate + (Math.random() * barrelRate);
}

function checkDeath() {
    if (barrelMap[Math.floor(playerX) +','+ Math.floor(playerY)]) {
        running = false;
        lives --;
        death = 10;
    }
}

function loop() {
    var now = performance.now();

    if (running) {
        if (now - lastPlayerMove >= 200) {
            movePlayer();
            checkDeath();
        }
        if (now - lastBarrelMove >= barrelSpeed) {
            moveBarrels();
            checkDeath();
        }
        if (now > nextBarrelAdd) addBarrel();
    }

    if (death > 0) {
        death -= .1;

        if (death <= 0) {
            if (lives <= 0) {
                gameover = true;
            }
            else {
                death = 0;
                setupLevel();
                showLevel();
            }
        }
    }

    render();

    setTimeout(loop, 1000/30);
}

function nextLevel() {
    var i, l;

    level ++;

    barrelRate -= 500;
    if (barrelBaseRate > 1000) {
        barrelBaseRate -= 250;
    }

    map.forEach(function (line, y) {
        var r, x;

        if (y == 0 || y == 1) return;

        if (y == 2) {
            r = 4 + Math.floor(Math.random() * (levelWidth-4));
        }
        else {
            r = Math.floor(Math.random() * levelWidth);
        }

        for (x = 0; x < levelWidth; x ++) {
            line[x] = x == r ? '1' : ' ';
        }
    });

    if (level <= 3) l = 2;
    else if (level <= 5) l = 1;

    for (i = 0; i < l; i ++) {
        map[Math.floor(Math.random()*(levelHeight - 2))+2][Math.floor(Math.random()*levelWidth)] = '1';
    }
}

function setupLevel() {
    playerX = 0;
    playerY = levelHeight - 1;
    barrels = [];
    barrelMap = {};
    lastBarrelMove = 0;
    lastPlayerMove = 0;
    running = true;
}

function showLevel() {
    showingLevel = true;
    running = false;
    setTimeout(function () {
        showingLevel = false;
        running = true;
    }, 2500);
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

    setupLevel();
    showLevel();
    loop();
}
