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
    death = false,

    barrels = [],
    barrelMap = {},
    barrelSpeed = 150,
    barrelRate = 5000,
    barrelBaseRate = 3000,

    nextBarrelAdd = 0,
    lastBarrelMove = 0,
    lastPlayerMove = 0,

    levelWon = false,
    levelEndTime,

    showingLevel = false,
    gameover = false,
    running = false,

    hammering = false,
    hammerX,
    
    closeButton,
    
    backgroundAudio,
    walkingAudio,
    hammeringAudio;

var map = [
        '               '.split(''),
        '        1      '.split(''),
        ' 2          1  '.split(''),
        '1  1           '.split(''),
        '       1    1  '.split(''),
        '1    1         '.split(''),
        '            1  '.split(''),
    ];


function render() {
    var timeTo,
        barrelShown = false,
        paulineShown = true,
        gorillaX = 2, gorillaY = 1;

    if (levelWon) {
        timeTo = levelEndTime - performance.now();

        if (Math.floor(timeTo/800) >= 4) {
            gorillaX = 3;
        }
        else if (Math.floor(timeTo/800) == 3) {
            gorillaX = 4;
        }
        else if (Math.floor(timeTo/800) == 2) {
            gorillaX = 5;
        }
        else if (Math.floor(timeTo/800) == 1) {
            gorillaX = 5;
            gorillaY = 0;
            paulineShown = false;
        }
        else if (Math.floor(timeTo/800) <= 0) {
            gorillaX = 5;
            gorillaY = -1;
            paulineShown = false;
        }
    }
    else {
        timeTo = nextBarrelAdd - performance.now();

        if (timeTo < 5000 && timeTo > 4000) {
            barrelShown = true;
        }
        if (timeTo < 4000 && timeTo > 3000) {
            barrelShown = true;
        }
        if (timeTo < 3000 && timeTo > 2000) {
            barrelShown = true;
            gorillaX = 1;
        }
        if (timeTo < 2000 && timeTo > 1000) {
            gorillaX = 1;
        }
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
                    if (death) {
                        if (Math.floor(performance.now()/400) % 2) {
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
                else if (hammering && y == playerY && x == hammerX /*&& Math.floor(performance.now()/100) % 2*/) {
                    s += '🔨';
                }
                else if (y == gorillaY && x == gorillaX) {
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
                else if (paulineShown && y == 0 && x == 6) {
                    s += pauline;
                }
                else if (levelWon && y == 0 && x == 7) {
                    if (Math.floor(performance.now()/400) % 2) {
                        s += paulineShown ? '💖' : '💔';
                    }
                    else {
                        s += paulineShown ? '💕' : '⬜';
                    }
                }
                else {
                    if (map[y][x] == '1') s += '⬆';
                    else if (map[y][x] == '2') s += '🔨';
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
        hammerX = playerX - 1;
    }
    if (keys[39]) {
        didMove = true;
        playerX ++; // right
        hammerX = playerX + 1;
    }

    if (keys[38]) {
        if (!hammering && map[Math.floor(playerY)][Math.floor(playerX)] == '1') {
            didMove = true;
            playerY --; // up
        }
    }
    if (keys[40]) {
        if (Math.floor(playerY) < levelHeight - 1) {
            if (!hammering && map[Math.floor(playerY)+1][Math.floor(playerX)] == '1') {
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
        walkingAudio.volume = 1;
        lastPlayerMove = performance.now();
    }
    else {
        walkingAudio.volume = 0;
    }

    if (map[Math.floor(playerY)][Math.floor(playerX)] == '2') {
        map[Math.floor(playerY)][Math.floor(playerX)] = '3';

        hammering = true;

        hammeringAudio.currentTime = 0;
        hammeringAudio.volume = 1;

        setTimeout(function () {
            hammering = false;
        }, 9000);
    }

    if (playerY == 0) {
        playSound('dk-levelend');
        levelWon = true;
        running = false;
        levelEndTime = performance.now() + 4000;
        setTimeout(function () {
            levelWon = false;
            nextLevel();
            setupLevel();
            showLevel();
        }, 4000);
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
        hammering = false;
        running = false;
        lives --;
        death = true;
        playSound('dk-death');

        setTimeout(function () {
            if (lives <= 0) {
                gameover = true;
            }
            else {
                death = false;
                setupLevel();
                showLevel();
            }
        }, 5000);
    }
}

function checkSmash() {
    var freshBarrels;

    if (hammering) {
        console.log(barrelMap[Math.floor(hammerX) +','+ Math.floor(playerY)]);
        if (barrelMap[Math.floor(hammerX) +','+ Math.floor(playerY)]) {
            playSound('dk-smash3', .3);

            barrelMap = {};
            freshBarrels = [];

            barrels.forEach(function (barrel) {
                if (barrel.x != Math.floor(hammerX) || barrel.y != Math.floor(playerY)) {
                    barrelMap[barrel.x+','+barrel.y] = true;
                    freshBarrels.push(barrel);
                }
            });

            barrels = freshBarrels;
        }
    }
}

function loop() {
    var now = performance.now();

    if (running) {
        if (hammering) {
            hammeringAudio.volume = 1;
            backgroundAudio.volume = 0;
        }
        else {
            hammeringAudio.volume = 0;
            backgroundAudio.volume = 1;
        }

        if (now - lastPlayerMove >= 200) {
            movePlayer();
            checkSmash();
            checkDeath();
        }
        if (now - lastBarrelMove >= barrelSpeed) {
            moveBarrels();
            checkSmash();
            checkDeath();
        }
        if (now > nextBarrelAdd) addBarrel();
    }
    else {
        hammeringAudio.volume = 0;
        backgroundAudio.volume = 0;
        walkingAudio.volume = 0;
    }

    render();

    setTimeout(loop, 1000/30);
}

function nextLevel() {
    var i, l, x, y;

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

    if (level <= 5) {
        do {
            y = Math.floor(Math.random()*(levelHeight - 2))+2;
            x = Math.floor(Math.random()*levelWidth);
        }
        while (map[y][x] == '1');

        map[y][x] = '2';
    }
}

function setupLevel() {
    map.forEach(function (line) {
        var i;

        for (i = 0; i < line.length; i ++) {
            if (line[i] == '3') line[i] = '2';
        }
    });

    playerX = 0;
    playerY = levelHeight - 1;
    barrels = [];
    barrelMap = {};
    lastBarrelMove = 0;
    lastPlayerMove = 0;
    running = true;
}

function showLevel() {
    playSound('dk-howhigh');
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

    walkingAudio = playSound('dk-walking', 0);
    walkingAudio.loop = true;
    backgroundAudio = playSound('dk-bacmusic', 0);
    backgroundAudio.loop = true;
    hammeringAudio = playSound('dk-hammertime', 0);
    hammeringAudio.loop = true;

    setupLevel();
    showLevel();
    loop();
}

history.replaceState({}, '', '/');
