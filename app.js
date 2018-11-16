'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const fileType = require('file-type')
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const fs = require('fs')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const router = express.Router()

const port = process.env.PORT || 3026;

const upload = multer({
    dest: 'images/',
    limits: { fileSize: 10000000, files: 2 },
    fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Only Images are allowed !'), false)
        }
        callback(null, true);
    }
}).fields([
    {name: 'backgroundImage', maxCount: 1},
    {name: 'profileImage', maxCount: 1},
    {name: 'images', maxCount: 10}
])

router.post('/images/upload', upload, (req, res, next) => {
    if (!req.files) {
        return res.status(400).send({ status: 'error', errors: ['Insira um arquivo'] })
    } else {
        const files = []
        if(req.files.backgroundImage){
            files.push(...req.files.backgroundImage)
        }
        if(req.files.profileImage){
            files.push(...req.files.profileImage)
        }
        const data = {}

        files.map((item) => (
            data[item.fieldname] = item.filename
        ))

        return res.send({ status: 'ok', data })
    }
})

router.get('/images/:imagename', (req, res) => {
    let imagename = req.params.imagename
    let imagepath = __dirname + "/images/" + imagename
    let image = fs.readFileSync(imagepath)
    let mime = fileType(image).mime
    res.writeHead(200, { 'Content-Type': mime })
    res.end(image, 'binary')
})
app.use('/', router)
app.use((err, req, res, next) => {
    if (err.code == 'ENOENT') {
        res.status(404).json({ message: 'Image Not Found !' })
    } else {
        res.status(500).json({ message: err.message })
    }
})
app.listen(port)
console.log(`App Runs on ${port}`)