// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var gcloud = require('gcloud');
var config = require('../config');

var CLOUD_BUCKET = config.CLOUD_BUCKET;
var storage = gcloud.storage({
  projectId: config.GCLOUD_PROJECT
});
var bucket = storage.bucket(CLOUD_BUCKET);


// Returns the public, anonymously accessable URL to a given Cloud Storage
// object.
// The object's ACL has to be set to public read.
function getPublicUrl (filename) {
  console.log('https://storage.googleapis.com/' + CLOUD_BUCKET + '/' + filename);
  return 'https://storage.googleapis.com/' + CLOUD_BUCKET + '/' + filename;
}

// Express middleware that will automatically pass uploads to Cloud Storage.
// req.file is processed and will have two new properties:
// * ``cloudStorageObject`` the object name in cloud storage.
// * ``cloudStoragePublicUrl`` the public url to the object.
function sendUploadToGCS (req, res, next) {
  console.log(req.file);
  
  if (!req.file) {
    return next();
  }

  //var decodedImage = new Buffer(req.body, 'base64').toString('binary');
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

  stream.end(req.header.buffer);
}

// Multer handles parsing multipart/form-data requests.
// This instance is configured to store images in memory and re-name to avoid
// conflicting with existing objects. This makes it straightforward to upload
 //to Cloud Storage.
 var multer = require('multer')({
   inMemory: true,
    dest: 'uploads/' ,
   fileSize: 5 * 1024 * 1024, // no larger than 5mb
   rename: function (fieldname, filename) {
     // generate a unique filename
     return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
   }
 });

module.exports = {
  getPublicUrl: getPublicUrl,
  sendUploadToGCS: sendUploadToGCS,
  multer: multer
};
