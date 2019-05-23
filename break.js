var popups = [],
    keys = {},

    map = {},
    statusLine = '',

    levelWidth = 9,

    paddleSize = 3,
    paddleX,

    score = 0,
    lives = 2,
    level = 1,
    running = false,
    deathTime = 0,
    gameoverTime = 0,

    paddleSpeed = .3,
    ballSpeed = .1,

    blockLines = 2,
    blockCount = 0,
    positions,
    
    ballX, ballY, ballXV, ballYV;

var emojis = [
    '🤠', '👽', '🤷', '👏', '👀', '💩', '🐸', '💯', '💊', '💸', '🔥', '🍆', '🍕', '💦', '💎', '💰', '🔫', '🚬', '🐓', '🗿'
];

function toFullWidth(input) {
    var lookup = {"`" : "`","1" : "１","2" : "２","3" : "３","4" : "４","5" : "５","6" : "６","7" : "７","8" : "８","9" : "９","0" : "０","-" : "－","=" : "＝","~" : "~","!" : "！","@" : "＠","#" : "＃","$" : "＄","%" : "％","^" : "^","&" : "＆","*" : "＊","(" : "（",")" : "）","_" : "_","+" : "＋","q" : "ｑ","w" : "ｗ","e" : "ｅ","r" : "ｒ","t" : "ｔ","y" : "ｙ","u" : "ｕ","i" : "ｉ","o" : "ｏ","p" : "ｐ","[" : "[","]" : "]","\\" : "\\","Q" : "Ｑ","W" : "Ｗ","E" : "Ｅ","R" : "Ｒ","T" : "Ｔ","Y" : "Ｙ","U" : "Ｕ","I" : "Ｉ","O" : "Ｏ","P" : "Ｐ","{" : "{","}" : "}","|" : "|","a" : "ａ","s" : "ｓ","d" : "ｄ","f" : "ｆ","g" : "ｇ","h" : "ｈ","j" : "ｊ","k" : "ｋ","l" : "ｌ",";" : "；","'" : "＇","A" : "Ａ","S" : "Ｓ","D" : "Ｄ","F" : "Ｆ","G" : "Ｇ","H" : "Ｈ","J" : "Ｊ","K" : "Ｋ","L" : "Ｌ",":" : "：","\"" : "\"","z" : "ｚ","x" : "ｘ","c" : "ｃ","v" : "ｖ","b" : "ｂ","n" : "ｎ","m" : "ｍ","," : "，","." : "．","/" : "／","Z" : "Ｚ","X" : "Ｘ","C" : "Ｃ","V" : "Ｖ","B" : "Ｂ","N" : "Ｎ","M" : "Ｍ","<" : "<",">" : ">","?" : "？", " ": "　"},
        output = '';

    input.split('').forEach(function (c) {
        if (lookup[c]) output += lookup[c];
        else output += c;
    });

    return output;
}

function playSound(fileName, volume) {
    var audio;

    if (volume == undefined) volume = 1;
    if (volume > 1) volume = 1;

    audio = new (Audio)(fileName + '.wav');
    audio.volume = volume;

    audio.play();

    return audio;
}

function render() {
    popups.forEach(function (popup, y) {
        var s = '', x;

        if (!popup.document.location) return;

        if (y == 0) {
            popup.document.location.hash = statusLine;
        }
        else {
            for (x = 0; x < levelWidth; x ++) {
                if (x == Math.floor(ballX) && y == Math.floor(ballY)) {
                    s += '🎱';
                }
                else if (y == popups.length - 1 && x >= Math.floor(paddleX) && x < Math.floor(paddleX) + paddleSize) {
                    if (deathTime && !(Math.floor((Date.now()-deathTime)/500) % 2)) {
                        s += '💀';
                    }
                    else {
                        s += String.fromCharCode(0x2B1B);
                    }
                }
                else if (map[x+','+y]) {
                    if (gameoverTime && !(Math.floor((Date.now()-gameoverTime)/500) % 2)) {
                        s += '💀';
                    }
                    else {
                        s += map[x+','+y];
                    }
                }
                else s += '⬜';
            }

            popup.document.location.hash = '🔷' + s + '🔷';
        }
    });
}

function addBlock() {
    var p = positions.pop();

    if (!p) {
        running = true;
        return;
    }

    map[p[0] +','+ p[1]] = emojis[Math.floor(Math.random()*emojis.length)];
    blockCount ++;

    setTimeout(addBlock, 100);
}

function setupLevel() {
    var x, y;

    if (level == 1) {
        blockLines = 2;
        paddleSize = 3;
    }
    if (level == 2) {
        blockLines = 3;
        paddleSize = 3;
    }
    else if (level == 3) {
        blockLines = 3;
        paddleSize = 2;
    }
    else if (level == 4) {
        blockLines = 4;
        paddleSize = 2;
    }
    else if (level == 5) {
        blockLines = 4;
        paddleSize = 1;
    }
    else {
        blockLines = 2;
        paddleSize = 3;
        ballSpeed += .1;
        paddleSpeed += .1;
    }

    blockCount = 0;
    positions = [];

    for (x = 0; x < levelWidth; x ++) {
        for (y = 1; y <= blockLines; y ++) {
            positions.push([x,y]);
        }
    }

    positions.sort(function () {return Math.random()*2-1});

    addBlock();
}

function startBall() {
    paddleX = Math.floor((levelWidth - paddleSize)/2);

    ballX = paddleX;
    ballY = popups.length - 2;
    ballXV = Math.round(Math.random()) ? -.1 : .1;
    ballYV = -ballSpeed;
}

function movePaddle() {
    if (keys[37]) {
        paddleX -= paddleSpeed; // left
        console.log('left');
    }
    if (keys[39]) {
        paddleX += paddleSpeed; // right
        console.log('right');
    }
}

function addSomeRandom() {
    var r = (Math.random()*.15) + .05;

    if (ballXV > 0) ballXV = r;
    else ballXV = -r;
}

function loseLife() {
    lives --;

    if (lives < 0) {
        playSound('over');
        gameoverTime = Date.now();
    }
    else {
        playSound('ded');
        setTimeout(function () {
            deathTime = 0;
            running = true;
            startBall();
        }, 2000);
    }

    deathTime = Date.now();

    running = false;
}

function moveBall() {
    var x, y;

    ballX += ballXV;
    ballY += ballYV;

    x = Math.floor(ballX);
    y = Math.floor(ballY);

    if (map[x+','+y]) {
        if (ballYV < 0) {
            ballYV = ballSpeed;
        }
        else {
            ballXV *= -1;
        }

        score += 1;
        map[x+','+y] = null;

        blockCount --;
        if (blockCount == 0) {
            playSound('win');
            running = false;
            level ++;
            setupLevel();
            startBall();
        }
        else {
            playSound('hit1');
            addSomeRandom();
        }
    }

    if (ballY < 1) {
        ballYV = ballSpeed;
        addSomeRandom();
    }
    else if (y == popups.length - 1 && Math.floor(ballX) >= Math.floor(paddleX) && Math.floor(ballX) < Math.floor(paddleX) + paddleSize) {
        ballYV = -ballSpeed;
        playSound('hit2');
        addSomeRandom();
    }
    else if (ballX < 0 || ballX > levelWidth - 1) {
        ballXV *= -1;
        addSomeRandom();
    }
    else if (ballY >= popups.length) {
        loseLife();
    }

    ballX = Math.max(0, Math.min(levelWidth - .01, ballX));
}

function loop() {
    var now = performance.now();

    if (running) {
        movePaddle();
        moveBall();
    }

    if (gameoverTime) {
        statusLine = toFullWidth('⠀Score:' + score + '⠀GAME⠀OVER');
    }
    else if (!positions.length) {
        statusLine = toFullWidth('⠀Score:' + score + '⠀Lives:' + lives);
    }
    else {
        statusLine = toFullWidth('⠀⠀---Level:' + level + '---');
    }

    render();

    setTimeout(loop, 1000/30);
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
    startBall();
    loop();
}
