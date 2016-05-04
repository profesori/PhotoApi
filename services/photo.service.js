var config = require('config.json');
var db = require('seraph')({
  server: 'http://localhost:7474',
  id: 'seraphId',
  user : 'neo4j',
  pass :'golden'
});
var model = require('seraph-model');
var usersDb = model(db, 'User');
var photoDb = model(db,'Photo');
photoDb.useTimestamps('created','updated');
var _ = require('lodash');
var Q = require('q');
var uuid = require('hat');

var service = {};

service.create = create;
service.relate_user_photo = relate_user_photo;
service.add_photo_challenge = add_photo_challenge;
service.getAllPhotos=getAllPhotos;
service.getAllPhotosChallenge=getAllPhotosChallenge;
module.exports = service;

function create(photoParam) {
    var deferred = Q.defer();
    createPhoto();
    function createPhoto() {
        photoParam.id = uuid();
        photoParam.bsend = 1;
        var photo = photoParam;
        photoDb.save(
            photo,
            function (err, pht) {
                if (err) deferred.reject(err);
                console.log(pht);
                deferred.resolve(pht);
            });
    }
    return deferred.promise;
}

function add_photo_challenge(p,ch){
  var deferred = Q.defer();
  db.relate(ch,'HAS_PHOTO',p,'',function(err,relat){
    if (err){
      deferred.reject(err);
    }
      deferred.resolve();
  });
  return deferred.promise;
}

function relate_user_photo(u,ph){
  var deferred = Q.defer();
  db.relate(u.seraphId,'TOOK_PHOTO',ph.seraphId,'',function(err,relat){
    if (err){
      deferred.reject(err);

    }
      deferred.resolve();
  });
  return deferred.promise;
}

function getAllPhotosChallenge(idChallenge){
  var deferred = Q.defer();
  var query = "MATCH (ch:Challenge {id:{id}})-[r:HAS_PHOTO]->(p)"
            + " RETURN p"


  db.query(query,{id:idChallenge},function(err,result){
     if (err) deferred.reject(err);

       deferred.resolve(result);
  });

  return deferred.promise;
}

function getAllPhotos(){
  var deferred = Q.defer();
  var query = "MATCH (p:Photo)"
            + " OPTIONAL MATCH (x:Challenge)-[r:HAS_PHOTO]->(p)"
            + " WHERE NOT ()-[:HAS_PHOTO_PROFILE]->(p)"
            + " return p,r,x"
  db.query(query,"",function(err,result){
     if (err) deferred.reject(err);

       deferred.resolve(result);
  });

  return deferred.promise;
}
