const {
    createCanvas,
    loadImage
} = require('canvas')

const fs = require("file-system")
const md5 = require("md5")

var skin_data = {
    faces: {},
    patterns: {},
    models: {},
    colors: {}
}

var faces = fs.readFileSync("data/faces.json", "utf8")
faces = JSON.parse(faces)

var colors = fs.readFileSync("data/colors.json", "utf8")
colors = JSON.parse(colors)

skin_data.colors = colors


async function run() {

    var sprites = fs.readdirSync(__dirname + "/resources/Sprite")

    for (var sprite of sprites) {
        listModel(sprite)
    }

    for (let face in faces) {
        await createFace(face)
    }


    var Texture2D = fs.readdirSync(__dirname + "/resources/Texture2D")
    var patterns = []
    var pattern_skip = ["CH_FallGuy_NM.png", "CH_FallGuy_faceEyes_MSK.png"]

    for (var texture of Texture2D) {
        if (texture.indexOf("CH_FallGuy_") != -1 &&
            texture.indexOf("bodyParts") == -1 &&
            pattern_skip.indexOf(texture) == -1) {
            var patternName = texture.substr(11, texture.lastIndexOf("_") - 11)
            if (patternName != "") {
                patterns.push(texture)
                skin_data.patterns[patternName] = md5(patternName)
            }

        }
    }

    for (var pattern of patterns) {
        for (var color in colors) {
            await createPattern(pattern, color)
        }
    }

    fs.writeFileSync(__dirname + "/data/data.js", `const skin_data = ${JSON.stringify(skin_data)}`)
}

run()


function listModel(sprite) {
    let start;
    var top = false;
    if (sprite.indexOf("UI_Icon_Bottom_") != -1) {
        start = sprite.substr(15)
    } else if (sprite.indexOf("UI_Icon_Top_" != -1)) {
        top = true;
        start = sprite.substr(12)
    } else {
        return
    }

    var name = start.substr(0, start.indexOf(".png"))
    skin_data.models[sprite] = {
        name,
        top
    }
}


function createPattern(pattern, color_name) {

    var canvas = createCanvas(512, 512)
    var ctx = canvas.getContext('2d')

    return new Promise((resolve, reject) => {
        loadImage("resources/Texture2D/" + pattern).then(image => {

            var patternName = pattern.substr(11, pattern.lastIndexOf("_") - 11)
            var color = colors[color_name]


            var hash = md5(patternName)
            var folder = __dirname + "/resources/Patterns/" + md5(color_name)

            var path = `${folder}/${hash}.png`

            if (!fs.existsSync(folder)) fs.mkdirSync(folder)

            skin_data.patterns[patternName] = hash

            if (fs.existsSync(path)) {
                console.log("Skipped " + patternName)
                resolve()
                return
            }

            ctx.clearRect(0, 0, 512, 512)
            ctx.drawImage(image, 0, 0, 512, 512)

            let imgData = ctx.getImageData(0, 0, 512, 512)
            let data = imgData.data;

            for (var y = 0; y < 512; y++) {
                for (var x = 0; x < 512; x++) {
                    var index = (x + 512 * y) * 4;


                    var amountOfRed = data[index] / 255

                    var replacement = getGradientColor(color[0], color[1], amountOfRed)
                    replacement = hexToRgb(replacement)

                    data[index + 0] = replacement.r
                    data[index + 1] = replacement.g
                    data[index + 2] = replacement.b
                }
            }


            ctx.clearRect(0, 0, 512, 512)
            ctx.putImageData(
                imgData, 0, 0)

            const out = fs.createWriteStream(path)
            const stream = canvas.createPNGStream()
            stream.pipe(out)
            out.on('finish', () => {
                console.log(patternName + " pattern was generated.")
                resolve()
            })
        })
    })
}


function createFace(key) {

    var canvas = createCanvas(2048, 2048)
    var ctx = canvas.getContext('2d')

    return new Promise((resolve, reject) => {
        loadImage("resources/Texture2D/CH_FallGuy_faceEyes_MSK.png").then(image => {

            var hash = md5(key)
            var path = `${__dirname}/resources/Faces/${hash}.png`

            skin_data.faces[key] = hash

            if (fs.existsSync(path)) {
                console.log("Skipped " + key)
                resolve()
                return
            }
            ctx.clearRect(0, 0, 2048, 2048)
            ctx.drawImage(image, 0, 0, 2048, 2048)

            let imgData = ctx.getImageData(0, 0, 2048, 2048)
            let data = imgData.data;

            var face = faces[key]

            for (let y = 0; y < 2048; y++) {
                for (let x = 0; x < 2048; x++) {
                    let index = (x + 2048 * y) * 4;
                    let replacement;


                    if (data[index + 2] > 0) {
                        // Blue = Transparent
                        data[index + 3] = 0;
                    } else if (data[index + 0] > 0) {
                        // Red = Eyes
                        replacement = face[1]
                    } else {
                        replacement = face[0]
                    }

                    if (replacement) {
                        replacement = hexToRgb(replacement)

                        data[index + 0] = replacement.r
                        data[index + 1] = replacement.g
                        data[index + 2] = replacement.b
                    }
                }
            }


            ctx.clearRect(0, 0, 2048, 2048)
            ctx.putImageData(
                imgData, 0, 0)

            const out = fs.createWriteStream(path)
            const stream = canvas.createPNGStream()
            stream.pipe(out)
            out.on('finish', () => {
                console.log(key + " face was generated.")
                resolve()
            })

        })
    })
}




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