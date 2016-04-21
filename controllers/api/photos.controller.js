var config = require('config.json');
var express = require('express');
var gcloud = require('gcloud');
var router = express.Router();
var photoService = require('services/photo.service');

var multer = require('multer')({
  inMemory: true,
  fileSize: 5 * 1024 * 1024, // no larger than 5mb
  rename: function (fieldname, filename) {
    // generate a unique filename
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
  }
});
var CLOUD_BUCKET = config.CLOUD_BUCKET;
var storage = gcloud.storage({
  projectId: config.GCLOUD_PROJECT
});
var bucket = storage.bucket(CLOUD_BUCKET);

var winston = require('winston');
  winston.add(winston.transports.File, { filename: 'logger.log' });
  winston.remove(winston.transports.Console);

// routes
router.post(
  '/add',
  multer.single('image'),
  sendUploadToGCS,
  function insert (req, res, next) {
    var data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      data.imageUrl = req.file.cloudStoragePublicUrl;
    }

    // Save the data to the database.
     photoService.create(data)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
			winston.error(err);
            res.status(400).send(err);
        });
  }
);

router.get('/current_photo', getCurrentPhoto);

module.exports = router;

function sendUploadToGCS (req, res, next) {
  if (!req.file) {
    return next();
  }
  var gcsname = Date.now() + req.file.originalname;
  var file = bucket.file(gcsname);
  var stream = file.createWriteStream();

  stream.on('error', function (err) {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', function () {
    req.file.cloudStorageObject = gcsname;
    req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    next();
  });

  stream.end(req.file.buffer);
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
