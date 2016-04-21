var config = require('config.json');
var express = require('express');
var gcloud = require('gcloud');
var router = express.Router();
var photoService = require('services/photo.service');
var images = require('../../libs/images');

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
