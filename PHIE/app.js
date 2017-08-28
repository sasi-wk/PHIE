var express = require('express')
var multer = require('multer')
var bodyParser = require('body-parser')
var fs = require('fs')
var unzip = require('unzip')
var path = require('path')
var mkdir = require('mkdirp')
var lineByLine = require('n-readlines')
var app = express()
const outputFolder = './output/'


app.use(bodyParser.json());
app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Credentials", true)
    next()
})

/**load file upload form*/
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
})
function o (){
    l = '';
    return {
        a:function(){

        }, b:function(){

        }
    }
}

/**reading file from output folder and push value to data[][] */
function DataSetReader(file){
    var l = new lineByLine(file)
    var h = l.next().toString('ascii').split('|')
    var b;
    this.next = function(){
        if(b = l.next()){
            return b = b.toString('ascii').replace('\r', '').split('|');
        }else{
            return b = undefined;
        }
    }
    this.get = function(k){
        var i = h.indexOf(k);
        return i === -1 ? null : b[i];
    }
}
function readingfile(files) {
    var liner = new lineByLine('./output/' + files)
    var line
    var lineNumber = 0
    var head = []  //ข้อมูลช่องที่ 1 ของ data
    var content = [] //ข้อมูลช่องที่ 2 ของ data
    var data = [] // อาร์เรย์ที่ใช้เก็บข้อมูลที่อ่านได้
    while (line = liner.next()) {
        if (lineNumber == 0) {
            head = line.toString('ascii').split('|')
        } else {
            content = line.toString('ascii').split('|')
            for (i = 0; i <= head.length; i++) {
                data.push(head[i], content[i])
            }
        }
        lineNumber++
        console.log('data[' + lineNumber + ']:-----' + data)
    }
    console.log('end of line reached')
}

/**unzip*/
function unzipFile(req, res) {
    var r = fs.createReadStream('uploads/' + req.file.originalname)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            var fileName = entry.path
            if (entry.type === 'File') {
                var fullPath = __dirname + '/output/' + path.dirname(fileName)
                fileName = path.basename(fileName)
                mkdir.sync(fullPath)
                entry.pipe(fs.createWriteStream(fullPath + '/' + fileName))
            }
        })//.then(fs.readdir(outputFolder, (err, files) => {
        //     files.forEach(file => {
        //         //filelist.push(file)
        //         //console.log(filelist.length + filelist)
        //     })
        //     console.log(files)
        //     readingfile(files)
        // }))
        .on('close', function(){  
        var service_dsr = new DataSetReader(outputFolder+'/service.txt')
        while(service_dsr.next()){
            var o = {
                hcode :service_dsr.get('hcode'),
                hn:service_dsr.get('hn'),
                diag:[]
            }
            console.log(service_dsr.get('hcode'))
            var diag_dsr = new DataSetReader(outputFolder+'/diag.txt');
            while(diag_dsr.next()){
                if(diag_dsr.get('vn') === service_dsr.get('vn')
                && diag_dsr.get('hcode') === service_dsr.get('hcode')){
                    var diag_o = {

                    }
                    o.diag.push(diag_o)
                }
            }
        }
        });
}


/**set folder for file upload*/
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.originalname);
        //cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

/**call multer*/
var upload = multer({ //multer settings
    storage: storage
}).single('file');

/** API path that will upload the files */
app.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        console.log(req.file);
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        res.json({ error_code: 0, err_desc: null, filename: req.file.originalname })
        unzipFile(req, res)
    })

})




app.listen(3000, function () {
    console.log('App running on port 3000')
});