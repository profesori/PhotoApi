var config = require('config.json');
var express = require('express');
var router = express.Router();
var photoService = require('services/photo.service');
var aws = require('aws-sdk');
var AWS_ACCESS_KEY = "AKIAIWNGALJRBI5WBDOA";
var AWS_SECRET_KEY = "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";
var S3_BUCKET = "rudithoma";
var multer  = require('multer');
var fs = require('fs');
aws.config.update({
    signatureVersion: 'v4'
});


//router.use(multer({dest:'./uploads/'}).any());
var upload = multer({ dest: 'uploads/' });
// routes
router.post('/add', registerPhoto);
router.get('/current_photo', getCurrentPhoto);
router.get('/sign_S3',sign_s3);

router.post('/upload_photo', upload.single('image'), function(req, res) {
    console.log(req.file);
    var files = req.file;
        var berr = false;
        var txterr;
         var fileBuffer = fs.readFileSync(files.destination+files.filename);
             aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
            var s3 = new aws.S3();
            var s3_params = {
                Bucket: S3_BUCKET,
                Key:"etapes_photos/"+files.originalname,
                Body:fileBuffer
            };
            s3.putObject(s3_params,function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);
                
            });
     
        if (berr) {
             res.status(400).send(txterr);
        }else{
             res.sendStatus(200);
        }
});


module.exports = router;


function registerPhoto(req, res) {
    photoService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function sign_s3(req,res) {
     aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: req.query.file_name,
        Expires: 600,
        ContentType: req.query.file_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'http://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
}

function getCurrentPhoto(req, res) {
      console.log(req.headers);
    photoService.getById(req.headers.id)

        .then(function (photo) {
            if (photo) {
                res.send(photo);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
