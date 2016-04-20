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
var winston = require('winston');
  winston.add(winston.transports.File, { filename: 'logger.log' });
  winston.remove(winston.transports.Console);


aws.config.update({
    signatureVersion: 'v4'
});


//router.use(multer({dest:'./uploads/'}).any());
var upload = multer({ dest: 'uploads/' });
// routes
router.post('/add', registerPhoto);
router.get('/current_photo', getCurrentPhoto);

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
                if (err) {
                    winston.error(err, err.stack); // an error occurred
                }
                else{
                     winston.log(data);
                     winston.log("Going to delete an existing file");
                        fs.unlink(files.destination+files.filename, function(err) {
                           if (err) {
                               winston.error(err);
                           }
                           winston.log("File deleted successfully!");
                        });
                }
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
			winston.error(err);
            res.status(400).send(err);
        });
}

function getCurrentPhoto(req, res) {
      console.log(req.headers);
    photoService.getById(req.headers.id)

        .then(function (photo) {
            if (photo) {
                res.send(photo);
            } else {
				winston.error(err);
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
			winston.error(err);
            res.status(400).send(err);
        });
}
