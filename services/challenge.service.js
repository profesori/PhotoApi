var config = require('config.json');
var db = require('seraph')({
  server: 'http://localhost:7474',
  id: 'seraphId'
});
var model = require('seraph-model');
var usersDb = model(db, 'User');
var challengeDb = model(db, 'Challenge');
var _ = require('lodash');
var Q = require('q');
var uuid = require('hat');
var userService = require('services/user.service');
var service = {};

service.getById = getById;
service.create = create;
// service.update = update;
// service.delete_challenge = delete_challenge;
// service.list_new = list_new;
// service.list_old = list_old;

service.userParticipate=userParticipate;
module.exports = service;

function create(challengeParam) {
    var deferred = Q.defer();
    createChallenge();
    function createChallenge() {
        challengeParam.id = uuid();
          // set user object to userParam without the cleartext password
        var challenge = challengeParam;
        challengeDb.save(
            challenge,
            function (err, doc) {
                if (err) deferred.reject(err);
                deferred.resolve();
            });
    }
    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    challengeDb.where({id:_id}, function (err, challenge) {
        if (err) deferred.reject(err);

        if (challenge.length) {
            deferred.resolve(challenge[0]);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function update(_id,challengeParam) {
    var deferred  = Q.deferred();
    var set = {
      title:challengeParam.title,
      subtitle : challengeParam.subtitle,
      date1 : challengeParam.date1,
      date2 : challengeParam.date2
    };
    getById(_id).then(function (challenge){
      if (challenge) {
          challengeDb.save(
            { id: _id },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err);

                deferred.resolve();
            });
      }

    }
    );
    return deferred.promise;
}

function list_new(_iduser) {
    var deferred = Q.defer();

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
