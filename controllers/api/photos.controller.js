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
    }

     // Save the data to the database.
      photoService.create(data)
         .then(function (photo) {
             _photo=photo;
             userService.getById(req.user.sub)
             .then(function (_user){
              photoService.relate_user_photo(_user.seraphId,photo.seraphId)
              .then(function (pht) {
                  res.status(200).send(_photo);
                  console.console.log(_photo);
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
router.post('/relateChallengePhoto/:idChallenge/:idPhoto',relateChallengePhoto)
router.post('/getAllPhotos',getAllPhotos)
module.exports = router;

function relateChallengePhoto(req,res){
  photoService.add_photo_challenge(req.headers.idChallenge,req.headers.idPhoto)
  .then(function(){
    res.sendStatus(200);
    console.console.log(_photo);
  })
  .catch(function (err) {
      res.status(400).send(err);
  });
}

function getAllPhotos(req,res){
  photoService.getAllPhotos()
  .then(function(result){
    res.status(200).send(result);
  })
  .catch(function (err) {
      res.status(400).send(err);
  });
}
