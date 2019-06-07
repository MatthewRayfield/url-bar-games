function Renderer() {
    var self = this,
        container = document.getElementById('container');

    self.width = 500;
    self.height = 200;

    self.tRenderer = new THREE.WebGLRenderer({alpha: false, antialias: true});
    container.appendChild(self.tRenderer.domElement);
    self.tRenderer.setSize(self.width, self.height);

    self.renderTarget = new THREE.WebGLRenderTarget(self.width/10, self.height/10, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter});

    self.camera = new THREE.PerspectiveCamera(70, self.width / self.height, 1, 1000);
    
    self.scene = new THREE.Scene();

    self.render = function render() {
        self.tRenderer.render(self.scene, self.camera);
        self.tRenderer.render(self.scene, self.camera, self.renderTarget);
    };
}
