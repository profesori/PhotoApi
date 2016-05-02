var config = require('config.json');
var express = require('express');
var gcloud = require('gcloud');
var router = express.Router();
var photoService = require('services/photo.service');
var userService = require('services/user.service');
var images = require('../../libs/images');

// routes
router.post(
  '/add',
  images.multer.single('img'),
  images.sendUploadToGCS,
  function insert (req, res, next) {
    var data =req.body;
    var _photo;
    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    console.log(req.file)
    if (req.file && req.file.cloudStoragePublicUrl) {
      data.imageUrl = req.file.cloudStoragePublicUrl;
      console.log(data.imageUrl);
    }

     // Save the data to the database.
      photoService.create(data)
         .then(function (photo) {
             console.log(photo);
             _photo=photo;
             console.log(req.user.sub);
             userService.getById(req.user.sub)
             .then(function (_user){
               console.log(_user);
              photoService.relate(_user,photo)
              .then(function (pht) {
                  res.status(200).send(_photo);
              })
              .catch(function (err) {
                  res.status(400).send(err);
                });
             })
             .catch(function (err) {
                 res.status(400).send(err);
               });
           })
         .catch(function (err) {
             res.status(400).send(err);
         });
});

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
