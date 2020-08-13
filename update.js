var fs = require("file-system")

var textures = fs.readdirSync("resources/Texture2D")

var skins = fs.readdirSync("resources/Sprite")
var patterns = []
var exludePatterns = [
    "bodyParts",
    "#",
    "faceEyes",
    "FallGuy_NM"
]

for (var texture of textures) {
    if (texture.indexOf("CH_FallGuy_") != -1 && texture.indexOf("MSK.png") != -1) {
        var skip = false
        for (var exlude of exludePatterns) {
            if (texture.indexOf(exlude) != -1) {
                skip = true
                break
            }
        }

        if (!skip) patterns.push(texture)
    }
}

var files = `const patterns = ${JSON.stringify(patterns)}
const skins = ${JSON.stringify(skins)}`

fs.writeFileSync("data/files.js", files)