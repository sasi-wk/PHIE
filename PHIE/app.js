var express = require('express')
var multer = require('multer')
var bodyParser = require('body-parser')
var fs = require('fs')
var unzip = require('unzip')
var path = require('path')
var mkdir = require('mkdirp')
var app = express()
var fsname=''


app.use(bodyParser.json());  

app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

//load file upload form
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
});

//unzip
function unzipFile(req,res){
    fs.createReadStream('uploads/'+req.file.originalname)
    .pipe(unzip.Parse())
    .on('entry', function (entry) {
      var fileName = entry.path
      var type = entry.type
      if (type==='File') {
        var fullPath = __dirname + '/output/' + path.dirname( fileName )
        fileName = path.basename( fileName )
        mkdir.sync(fullPath)
        entry.pipe(fs.createWriteStream( fullPath + '/' + fileName ))
      } else {
        entry.autodrain()
      }
    })
}


//set folder for file upload
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null,file.originalname);
        //cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

//call multer
var upload = multer({ //multer settings
                storage: storage
            }).single('file');

/** API path that will upload the files */
app.post('/upload', function(req, res) {
    upload(req,res,function(err){
        console.log(req.file);
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
        res.json({error_code:0,err_desc:null,filename:req.file.originalname})

        unzipFile(req,res)
        
    })
})

  
app.listen(3000, function() {
    console.log('App running on port 3000')
});