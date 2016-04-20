var config = require('config.json');
var db = require('seraph')({
  server: 'http://localhost:7474',
  id: 'seraphId',
  user : 'neo4j',
  password :'golden'
});
var model = require('seraph-model');
var usersDb = model(db, 'User');
var challengeDb = model(db, 'Challenge');
var etapeDb = model(db,'Etape');
var _ = require('lodash');
var Q = require('q');
var uuid = require('hat');

var service = {};

service.getById = getById;
service.create = create;
module.exports = service;

function create(etapeParam) {
    var deferred = Q.defer();
    createEtape();
    function createEtape() {
        etapeParam.id = uuid();
          // set user object to userParam without the cleartext password
        var etape = etapeParam;
        etapeDb.save(
            etape,
            function (err, doc) {
                if (err) deferred.reject(err);
                deferred.resolve();
            });
    }
    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    etapeDb.where({id:_id}, function (err, etape) {
        if (err) deferred.reject(err);

        if (etape.length) {
            deferred.resolve(etape[0]);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}
