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

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}
function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

function rotateCoord(coords, angle) {
    var x = coords.x, y = coords.y;
    var radians = degToRad(angle),
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * x) + (sin * y),
        ny = (cos * y) - (sin * x);

    return {x: nx, y: ny};
}
