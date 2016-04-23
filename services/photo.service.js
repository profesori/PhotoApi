var config = require('config.json');
var db = require('seraph')({
  server: 'http://localhost:7474',
  id: 'seraphId',
  user : 'neo4j',
  pass :'golden'
});
var model = require('seraph-model');
var usersDb = model(db, 'User');
var etapeDb = model(db,'Etape');
var photoDb = model(db,'Photo');
photoDb.useTimestamps('created','updated');
var _ = require('lodash');
var Q = require('q');
var uuid = require('hat');

var service = {};

service.getById = getById;
service.create = create;
service.relate = relate;
module.exports = service;

function create(photoParam) {
    var deferred = Q.defer();
    createPhoto();
    function createPhoto() {
        photoParam.id = uuid();
        var photo = photoParam;
        photoDb.save(
            photo,
            function (err, doc) {
                if (err) deferred.reject(err);
                deferred.resolve(photoParam.id);
            });
    }
    return deferred.promise;
}

function relate_photo_user(u,ph){
  db.relate(u.seraphId,'TOOK_PHOTO',ph.seraphId,'',function(err,relat){
    if (err){
      deferred.reject(err);
      console.log(err);
    }
      deferred.resolve();
  });
}

function getById(_id) {
    var deferred = Q.defer();
    photoDb.where({id:_id}, function (err, photo) {
        if (err) deferred.reject(err);

        if (etape.length) {
            deferred.resolve(photo[0]);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}
