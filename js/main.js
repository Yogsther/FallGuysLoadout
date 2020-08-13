var width = window.innerWidth / 2

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / window.innerHeight, 0.1, 1000);

camera.position.x = -0.95
camera.position.y = 1.38
camera.position.z = 3.29

var order = 1

var UPPER;
var LOWER;


var clock = new THREE.Clock();

var renderer = new THREE.WebGLRenderer({
    alpha: true
});

var selectedPattern = "CaveMan"
var selectedColor = COLORS["Baby Pink"]

setPattern(selectedPattern, selectedColor)


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



function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getGradientColor(start_color, end_color, percent) {
    // strip the leading # if it's there
    start_color = start_color.replace(/^\s*#|\s*$/g, '');
    end_color = end_color.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (start_color.length == 3) {
        start_color = start_color.replace(/(.)/g, '$1$1');
    }

    if (end_color.length == 3) {
        end_color = end_color.replace(/(.)/g, '$1$1');
    }

    // get colors
    var start_red = parseInt(start_color.substr(0, 2), 16),
        start_green = parseInt(start_color.substr(2, 2), 16),
        start_blue = parseInt(start_color.substr(4, 2), 16);

    var end_red = parseInt(end_color.substr(0, 2), 16),
        end_green = parseInt(end_color.substr(2, 2), 16),
        end_blue = parseInt(end_color.substr(4, 2), 16);

    // calculate new color
    var diff_red = end_red - start_red;
    var diff_green = end_green - start_green;
    var diff_blue = end_blue - start_blue;

    diff_red = ((diff_red * percent) + start_red).toString(16).split('.')[0];
    diff_green = ((diff_green * percent) + start_green).toString(16).split('.')[0];
    diff_blue = ((diff_blue * percent) + start_blue).toString(16).split('.')[0];

    // ensure 2 digits by color
    if (diff_red.length == 1) diff_red = '0' + diff_red
    if (diff_green.length == 1) diff_green = '0' + diff_green
    if (diff_blue.length == 1) diff_blue = '0' + diff_blue

    return '#' + diff_red + diff_green + diff_blue;
}




function setPattern(pattern, color) {

    var patternSize = 1024

    var image = new Image()
    var canvas = document.createElement("canvas")
    canvas.width = canvas.height = patternSize

    var ctx = canvas.getContext("2d")

    image.onload = () => {
        ctx.drawImage(image, 0, 0)
        var imgData = ctx.getImageData(0, 0, patternSize, patternSize)
        var data = imgData.data;


        for (var y = 0; y < patternSize; y++) {
            for (var x = 0; x < patternSize; x++) {
                var index = (x + patternSize * y) * 4;


                var amountOfRed = data[index] / 255

                var replacement = getGradientColor(color[0], color[1], amountOfRed)
                replacement = hexToRgb(replacement)

                data[index + 0] = replacement.r
                data[index + 1] = replacement.g
                data[index + 2] = replacement.b
            }
        }



        ctx.putImageData(
            imgData, 0, 0)


        var map = TextureLoader.load(canvas.toDataURL())
        var material = new THREE.MeshBasicMaterial({
            depthTest: true,
            map
        })

        if (body) body.traverse(function (node) {
            if (node.isMesh) {
                node.material = material;
            }
        })
    }
    image.src = `resources/Texture2D/CH_FallGuy_${pattern}_MSK.png`

}


OBJLoader.load('resources/Mesh/Body.obj', obj => {

    var material = new THREE.MeshBasicMaterial({
        depthTest: true
    })

    obj.traverse(function (node) {
        if (node.isMesh) {
            node.material = material;
        }
    });
    obj.renderOrder = 0

    body = obj
    scene.add(body)
})


function loadObject(object_location, texture_location, top = true) {
    var map = TextureLoader.load(`resources/Texture2D/${texture_location}_AM.png`)
    console.log(`resources/Texture2D/${texture_location}_AM.png`)
    //var normalMap = TextureLoader.load(`resources/Texture2D/${texture_location}_NM.png`)

    var material = new THREE.MeshBasicMaterial({
        map,
        depthTest: true
    })

    /* material.flatShading = false */

    OBJLoader.load('resources/Mesh/' + object_location, obj => {

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
    })
}



var ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);



function animate() {

    controls.update()

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}


animate();

var tabs = {
    colour: () => {
        var list = []
        for (let color in COLORS) {
            color = COLORS[color]

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
                setPattern(selectedPattern, selectedColor)
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

populateTabs()

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