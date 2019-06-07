var popups = [],
    palette,
    toggleRenderButton,
    container,
    renderer,
    cube;

function loop() {
    var data = new Uint8Array(renderer.width/10 * renderer.height/10 * 4),
        x, r, g, b, s;

    cube.rotation.x += .02*6;
    cube.rotation.y += .03*6;

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

    mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4, 1, 1), material);

    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;

    mesh.rotation.x = degToRad(xd);
    mesh.rotation.y = degToRad(yd);
    mesh.rotation.z = degToRad(zd);

    cube.add(mesh);
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
    renderer.setSize(200, 140);

    camera = renderer.camera;

    light = new THREE.AmbientLight(0xdddddd);
    renderer.scene.add(light);

    light = new THREE.PointLight(0xffffff, .05);
    light.castShadow = true;
    light.position.set(0, 20, 0);
    renderer.scene.add(light);

    renderer.camera.position.z = 7;

    cube = new THREE.Object3D();

    addPlane( 0,  0,  2,   0,   0,   0, 0xFF0000); // front
    addPlane( 0,  0, -2, 180,   0,   0, 0x00FF00); // back
    addPlane( 0,  2,  0, -90,   0,   0, 0x0000FF); // top
    addPlane( 0, -2,  0,  90,   0,   0, 0xFFFF00); // bottom
    addPlane( 2,  0,  0,   0,  90,   0, 0xFF00FF); // right
    addPlane(-2,  0,  0,   0, -90,   0, 0x00FFFF); // left

    renderer.scene.add(cube);

    loadPalette();

    popups.forEach(function (popup) {
        popup.history.replaceState({}, '', '/');
    });
}
