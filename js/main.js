var width = window.innerWidth / 2

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / window.innerHeight, 0.1, 1000);

camera.position.x = -0.568
camera.position.y = 1.227
camera.position.z = 1.969

var order = 1

var UPPER;
var LOWER;


var clock = new THREE.Clock();

var renderer = new THREE.WebGLRenderer({
    alpha: true
});

/* var selectedPattern = "CaveMan"
var selectedColor = skin_data.colors["Baby Pink"]
 */


window.onresize = () => {
    width = window.innerWidth / 2
    renderer.setSize(width, window.innerHeight);

    camera.aspect = width / window.innerHeight;
    camera.updateProjectionMatrix();
}

renderer.setSize(width, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

controls.target.set(0, 1, 0);
controls.enablePan = false


var FBXLoader = new THREE.FBXLoader()
var OBJLoader = new THREE.OBJLoader()
var TextureLoader = new THREE.TextureLoader()

var body;



/* 
        var map = TextureLoader.load(canvas.toDataURL())
        var material = new THREE.MeshBasicMaterial({
            depthTest: true,
            map
        })

        if (body) body.traverse(function (node) {
            if (node.isMesh) {
                node.material = material;
            }
    
    
        }) */

function generateTexture(pattern_url, face_url) {
    return new Promise((resolve, reject) => {
        var canvas = document.createElement("canvas")
        var ctx = canvas.getContext("2d")
        canvas.width = canvas.height = 512;

        var ready = false;
        var pattern = new Image()
        var face = new Image()

        pattern.src = pattern_url
        face.src = face_url

        pattern.onload = face.onload = readyUp

        function readyUp() {
            if (ready) draw()
            else ready = true;
        }

        function draw() {
            ctx.drawImage(pattern, 0, 0, 512, 512)
            ctx.drawImage(face, 0, 0, 512, 512)
            resolve(canvas.toDataURL())

        }
    })
}

var mixer, mixer3;
var mixer2
var top

document.addEventListener("keydown", e => {
    console.log(e.keyCode)
    var speed = .01
    switch (e.keyCode) {
        case 38:
            top.position.x += speed
            break
        case 40:
            top.position.x -= speed
            break;
        case 37:
            top.position.y += speed
            break
        case 39:
            top.position.y -= speed
            break
        case 65:
            top.position.z += speed
            break;
        case 68:
            top.position.z -= speed
            break;
            /*   case 32:
                  action.stop()
                  action2.stop()
                  break */
    }

    console.log(top.position)
})

OBJLoader.load('resources/Mesh/Body.obj', obj => {

    /* var pattern = TextureLoader.load(`resources/Patterns/1c410105d889f14214b9b47c3b1e0ea3/4c72d232d1a1406e6c26251bbf6c3b25.png`)
    var face = TextureLoader.load('resources/Faces/0edf85315cdae4b8066ce9584b965844.png') */
    //var normal = TextureLoader.load(`resources/Texture2D/CH_FallGuy_NM.png`)

    generateTexture('resources/Patterns/1c410105d889f14214b9b47c3b1e0ea3/4c72d232d1a1406e6c26251bbf6c3b25.png', 'resources/Faces/0edf85315cdae4b8066ce9584b965844.png').then(image => {

        var texture = TextureLoader.load(image)
        FBXLoader.load("resources/Animator/CH_PortalChell_Bottom/CH_PortalChell_Bottom.fbx", scout => {
            FBXLoader.load("resources/Animator/PB_UI_Character.fbx", character => {
                FBXLoader.load("resources/Animator/CH_PortalChell_Top/CH_PortalChell_Top.fbx", other => {
                    character.traverse(function (node) {
                        if (node instanceof THREE.Mesh) {
                            node.material.map = texture
                            node.material.roughness = 5
                            node.material.envMap /* = mirrorCamera.renderTarget */
                            node.material.refractionRatio = 1
                            node.material.normalScale = new THREE.Vector2(1, -1)
                            node.material.needsUpdate = true;
                            node.material.shininess = 0x050505

                            /* node.material.polygonOffset = true;
                            node.material.polygonOffsetFactor = 10; */

                            node.material.flatShading = false
                            /* 
                            node.material.wireframe = false */
                        }
                    });


                    /*  var scale = 1.2 */
                    /*  scout.scale.y = scale */
                    ;
                    /*  other.scale.y = scale */




                    other.traverse(function (node) {
                        if (node instanceof THREE.Mesh) {
                            /*   node.material.polygonOffset = true;
                              node.material.polygonOffsetFactor = -10; */

                            /* 
                            node.material.wireframe = false */
                        }
                    });


                    /*  scout.traverse(function (node) {
                         if (node instanceof THREE.Mesh) {
                             node.material = material
                         }
                     }); */



                    mixer = new THREE.AnimationMixer(scout)
                    mixer2 = new THREE.AnimationMixer(character)
                    mixer3 = new THREE.AnimationMixer(other)

                    top = new THREE.Group()

                    top.add(other)
                    scene.add(scout)
                    /* scene.add(top) */
                    scene.add(character)

                    /* scout.scale.y = 1.5
                     */

                    /* top.position.y = .4
                    top.position.z = .02
                    top.position.x = 0 */
                    scout.updateMatrix()

                    var animation = 2
                    console.log(character.animations)

                    window.action = mixer.clipAction(character.animations[animation])
                    window.action2 = mixer2.clipAction(character.animations[animation])
                    var action3 = mixer3.clipAction(character.animations[animation])
                    /* action.play()
                    action2.play()
                    action3.play() */
                })

            })

        })
    })





    /* scene.add(body) */
})



/* function loadObject(object_location, texture_location, top = true) {
    var map = TextureLoader.load(`resources/Texture2D/${texture_location}_AM.png`)
    console.log(`resources/Texture2D/${texture_location}_AM.png`)
    //var normalMap = TextureLoader.load(`resources/Texture2D/${texture_location}_NM.png`)

    var material = new THREE.MeshBasicMaterial({
        map,
        depthTest: true
    })

    /* material.flatShading = false */

/* OBJLoader.load('resources/Mesh/' + object_location, obj => {

    obj.traverse(function (node) {
        if (node.isMesh) {
            node.material = material;
        }
    });

    obj.renderOrder = 1

    if (top) {
        scene.remove(UPPER)
        UPPER = obj
    } else {
        scene.remove(LOWER)
        LOWER = obj;
    }

    scene.add(obj)
}) */




var ambientLight = new THREE.AmbientLight(0x404040, 3.5);
scene.add(ambientLight);


/* var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight); */



function animate() {

    var delta = clock.getDelta()

    if (mixer && mixer2 && mixer3) {
        mixer.update(delta)
        mixer2.update(delta)
        mixer3.update(delta)

    }
    controls.update()

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

}


animate();

var tabs = {
    colour: () => {
        var list = []
        for (let color in skin_data.colors) {
            color = skin_data[color]

            let button = document.createElement("div")
            button.classList.add("color-pick")
            button.style.background = color[0]
            button.innerHTML = `
            <svg height="100" width="100">
                <polygon points="100,30 100,100 30,100" style="fill:${color[1]};" />
            </svg>`

            button.onclick = () => {
                if (selectedColor == color) return
                selectedColor = color

            }

            list.push(button)
        }

        return list
    },
    pattern: () => {
        var list = []
        for (let pattern of patterns) {

            let button = new Image()
            button.classList.add("color-pick")
            button.src = `resources/Texture2D/${pattern}`

            button.onclick = () => {
                var patternName = pattern.substr(11, pattern.indexOf("_MSK.png") - 11)
                if (selectedPattern == patternName) return
                selectedPattern = patternName
                setPattern(selectedPattern, selectedColor)
            }
            list.push(button)
        }

        return list
    },
    /* face: () => {}, */
    upper: () => {
        return getModels(true)
    },
    lower: () => {
        return getModels(false)
    },
}

function getModels(upper = true) {
    let returns = []
    for (let skin of skins) {
        //UI_Icon_Top_Wolf
        if (skin.indexOf("UI_Icon_Top") != -1 && upper) returns.push(skin)
        else if (skin.indexOf("UI_Icon_Bottom") != -1 && !upper) returns.push(skin)
    }

    let list = []
    for (let skin of returns) {
        let button = new Image()
        button.classList.add("color-pick")
        button.src = `resources/Sprite/${skin}`

        let textureName = false;


        let skinNameStart = (upper ? 12 : 15)
        let skinNameEnd = skin.indexOf(".png")
        if (skin.indexOf("Variant01.png") != -1) {
            skinNameEnd = skin.lastIndexOf("_")
            textureName = skin.substr(skinNameStart, skinNameEnd - skinNameStart) + "_Variant01"
        }

        let skinName = skin.substr(skinNameStart, skinNameEnd - skinNameStart)
        button.title = skinName

        button.onclick = () => {
            loadObject(`CH_${skinName}_${upper ? "UP" : "LW"}.obj`, `CH_${(textureName ? textureName : skinName)}`, upper)
        }

        list.push(button)
    }
    return list
}

function populateTabs() {
    for (let tab in tabs) {
        let button = document.createElement("button")
        button.classList.add("tab-button")
        button.innerText = tab.toUpperCase()
        button.onclick = () => {
            openTab(tab)
            populateList(tabs[tab]())
        }
        document.getElementById("tab-view").appendChild(button)

    }

    openTab("colour")
    populateList(tabs.colour())
}

/* populateTabs() */

function populateList(list) {
    var configPanel = document.getElementById("config-panel")
    configPanel.innerHTML = ""
    for (var item of list) {
        configPanel.appendChild(item)
    }
}

function openTab(tab) {
    for (var button of document.getElementsByClassName("tab-button")) {
        if (button.innerText == tab.toUpperCase()) button.classList.add("tab-button-selected")
        else button.classList.remove("tab-button-selected")
    }
}