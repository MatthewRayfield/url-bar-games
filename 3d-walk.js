var popups = [],
    palette,
    toggleRenderButton,
    container,
    renderer,
    camera,
    player,
    face,
    keys = {};

var map = [
        'xxxxxxxxxxxxxxxx',
        'xxxxxxxx       x',
        'x           f  x',
        'x              x',
        'x         xxxxxx',
        'x  xxxxx  x',
        'x  x   x  x',
        'x  x      x',
        'x  x   x  x',
        'x  xxxxx  x',
        'x         x',
        'x         x',
        'xxxxxxxxxxx',
    ];

function loop() {
    var data = new Uint8Array(renderer.width/10 * renderer.height/10 * 4),
        x, y, r, g, b, s;

    var movement = {x: 0, y: 0},
        speed = 2;

    if (keys[16]) speed *= 3;

    if (keys[87]) {
        movement.y = -speed;
    }
    else if (keys[83]) {
        movement.y = speed;
    }

    if (keys[68]) {
        player.rotation.y -= .2;
    }
    else if (keys[65]) {
        player.rotation.y += .2;
    }

    movement = rotateCoord(movement, radToDeg(player.rotation.y));
    player.position.x += movement.x;
    player.position.z += movement.y;

    face.lookAt(player.position);

    renderer.render();

    renderer.tRenderer.readRenderTargetPixels(renderer.renderTarget, 0, 0, renderer.width/10, renderer.height/10, data);

    popups.forEach(function (popup, y) {
        s = '';
        y *= 2;

        for (x = 0; x < renderer.width/10; x ++) {
            r = Math.floor(data[((y*renderer.width/10)+x)*4+0] / 16);
            g = Math.floor(data[((y*renderer.width/10)+x)*4+1] / 16);
            b = Math.floor(data[((y*renderer.width/10)+x)*4+2] / 16);

            s += palette[r][g][b].s;
        }

        popup.document.location.hash = s;
    });

    setTimeout(loop, 1000/10);
}

function addPlane(x, y, z, xd, yd, zd, color) {
    material = new THREE.MeshStandardMaterial({
        //color: 0xffffff * Math.random(),
        color: color,
        metalness: 0,
    });

    mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 20, 1, 1), material);

    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;

    mesh.rotation.x = degToRad(xd);
    mesh.rotation.y = degToRad(yd);
    mesh.rotation.z = degToRad(zd);

    renderer.scene.add(mesh);
}

function loadPalette() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'palette.json');
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState == 4) {
            palette = JSON.parse(xhr.responseText);

            loop();
        }
    });
    xhr.send();
}

window.addEventListener('keydown', function (event) {
    console.log(event.which);
    keys[event.which] = true;
});

window.addEventListener('keyup', function (event) {
    keys[event.which] = false;
});

function toggleRender() {
    if (container.style.display == 'none') {
        container.style.display = 'block';
        toggleRenderButton.innerHTML = 'hide render';
    }
    else {
        container.style.display = 'none';
        toggleRenderButton.innerHTML = 'show render';
    }
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
    var light, x, z,
        closeButton;

    toggleRenderButton = document.createElement('button');
    toggleRenderButton.innerHTML = 'show render';
    toggleRenderButton.addEventListener('click', toggleRender);
    document.body.appendChild(toggleRenderButton);

    closeButton = document.createElement('button');
    closeButton.innerHTML = 'close';
    closeButton.addEventListener('click', closeWindows);
    document.body.appendChild(closeButton);

    container = document.createElement('div');
    container.id = 'container';
    container.style.display = 'none';
    document.body.appendChild(container);

    renderer = new Renderer();

    camera = renderer.camera;

    player = new THREE.Object3D();
    player.position.set(85, 0, 95);
    player.rotation.y = degToRad(45);

    player.add(camera);

    renderer.scene.add(player);

    light = new THREE.AmbientLight(0xdddddd);
    renderer.scene.add(light);

    light = new THREE.PointLight(0xffffff, .05);
    light.castShadow = true;
    light.position.set(0, 20, 0);
    renderer.scene.add(light);
    var lightHelper = new THREE.PointLightHelper(light, 1);

    for (z = 0; z < map.length; z ++) {
        for (x = 0; x < map[z].length; x ++) {
            if (map[z][x] != 'x') {
                if (map[z][x] == 'f') {
                    material = new THREE.MeshBasicMaterial({
                        map: THREE.ImageUtils.loadTexture('face.png'),
                        transparent: true
                    });

                    mesh = new THREE.Mesh(new THREE.PlaneGeometry(15, 15, 1, 1), material);
                    mesh.position.x = x * 10;
                    mesh.position.z = z * 10;
                    face = mesh;

                    renderer.scene.add(mesh);
                }

                if (map[z-1][x] == 'x') { // south facing
                    addPlane(x*10, 0, z*10-5, 0, 0, 0, 0xFF0000);
                }
                if (map[z+1][x] == 'x') { // north facing
                    addPlane(x*10, 0, z*10+5, 180, 0, 0, 0x00FF00);
                }
                if (map[z][x+1] == 'x') { // west facing
                    addPlane(x*10+5, 0, z*10, 0, -90, 0, 0x00FFFF);
                }
                if (map[z][x-1] == 'x') { // east facing
                    addPlane(x*10-5, 0, z*10, 0, 90, 0, 0xFFFF00);
                }
            }
        }
    }

    window.addEventListener('resize', function () {
        renderer.resize();
    });

    renderer.camera.position.z = 7;

    loadPalette();

    popups.forEach(function (popup) {
        popup.history.replaceState({}, '', '/');
    });
}
