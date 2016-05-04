var config = require('config.json');
var db = require('seraph')({
  server: 'http://localhost:7474',
  id: 'seraphId',
  user : 'neo4j',
  pass :'golden'
});
var model = require('seraph-model');
var usersDb = model(db, 'User');
var challengeDb = model(db, 'Challenge');
var photosDb = model(db,'Photo');
photosDb.useTimestamps('created','updated');
challengeDb.useTimestamps('created','updated');
var _ = require('lodash');
var Q = require('q');
var uuid = require('hat');
var userService = require('services/user.service');
var service = {};

service.create = create;
service.list = list_challenges;
service.userParticipate=userParticipate;
module.exports = service;

function create(challengeParam) {
    var deferred = Q.defer();
    createChallenge();
    function createChallenge() {
        challengeParam.id= uuid();
          challengeDb.compose(photosDb, 'tabphotos', 'HAS_PHOTO');
          var photos  = JSON.parse(challengeParam.tabphotos) ;
          challengeParam.tabphotos = photos;
          // set user object to userParam without the cleartext password
        var challenge = challengeParam;
        console.log(challenge);
        challengeDb.save(
            challenge,
            function (err, challenge) {
                if (err) deferred.reject(err);
                deferred.resolve(challenge);
            });
    }
    return deferred.promise;
}

function list_challenges() {
    var deferred = Q.defer();
    challengeDb.compose(photosDb, 'tabphotos', 'HAS_PHOTO');
    usersDb.compose(challengeDb,'tabusers','PARTICIPATE');
    var query = "MATCH (ch:Challenge) "
    var opt = {
      varName:'ch',
      orderBy:'ch.start_date DESC'
    }
    challengeDb.findAll(opt,function (err,challenges){
        if (err){
          deferred.reject(err);
        }
        if (challenges){
          challenges.tabphotos=JSON.parse(challenges.tabphotos)
          deferred.resolve(challenges);

        }
    });
    return deferred.promise;
}

function update(challengeParam){
  var deferred = Q.defer();
  challengeDb.save(
      challenge,
      {excludeCompositions:true},
      function (err, challenge) {
          if (err) deferred.reject(err);
          deferred.resolve(challenge);
      });
  return deferred.promise;
}

function userParticipate(_iduser,_idchallenge){
    var deferred = Q.defer();
    var _challenge;
    var _user;

    getById(_idchallenge)
    .then(function (challenge) {
        if (challenge) {
          _challenge=challenge;

            userService.getById(_iduser)
           .then(function (user) {
               if (user) {
                  _user=user
                  relate_user(_user,_challenge);
               }
           })
           .catch(function (err) {
                _user2=err;
           });
         }

    })
    .catch(function (err) {
        var _challenge=err;
    });

    function relate_user(u,ch){
      db.relate(u.seraphId,'PARTICIPATE',ch.seraphId,{status: 'En cours'},function(err,relat){
        if (err){
          deferred.reject(err);
          console.log(err);
        }
          deferred.resolve();
      });
    }
return deferred.promise;
}
