var config = require('config.json');
var db = require('seraph')({
  server: 'http://localhost:7474',
  id: 'seraphId',
  user : 'neo4j',
  pass :'golden'
});
var model = require('seraph-model');
var usersDb = model(db, 'User');
usersDb.useTimestamps('created','updated');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var uuid = require('hat');

var service = {};

service.authenticate = authenticate;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.getAll = getAll;

module.exports = service;

function authenticate(username, password) {
    var deferred = Q.defer();

    usersDb.where({ username: username }, function (err, user) {
        if (err) deferred.reject(err);
        console.log(user);
        if (user.length) {
             var user_str = JSON.stringify(user);
            var user_final = JSON.parse(user_str);
            console.log(user_final);
            var res = user_final[0].password ;
        }

        //var neopass = res.substring(1,res.length-1)
        if (user.length && bcrypt.compareSync(password, res)) {
            // authentication successful
              user_final[0].token = jwt.sign({ sub: user_final[0].id }, config.secret);
            deferred.resolve(user_final[0]);
        } else {
            // authentication failed
            deferred.reject('authentication failed');
        }
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    usersDb.where({id:_id}, function (err, user) {
        if (err) deferred.reject(err);

        if (user.length) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user[0], 'password'));
        } else {
            // user not found
            deferred.reject("user not found");
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();

    // validation
    usersDb.where(
        { username: userParam.username },
        function (err, user) {
            if (err) deferred.reject(err);

            if (user.length && user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" est déjà pris');
            } else {
                createUser();
            }
        });

    function createUser() {
        // set user object to userParam without the cleartext password
        //var user = _.omit(userParam, 'password');

        // add hashed password to user object
        userParam.password = bcrypt.hashSync(userParam.password, 10);
        userParam.id = uuid();
          // set user object to userParam without the cleartext password
        var user = userParam;
        usersDb.save(
            user,
            function (err, user) {
                if (err) deferred.reject(err);

                   var user_str = JSON.stringify(user);
                    var user_final = JSON.parse(user_str);
                    console.log(user_final);
                    user_final.token = jwt.sign({ sub: user.id }, config.secret);
                    deferred.resolve(user_final);
            });
    }

    return deferred.promise;
}
function getAll(){
var deferred = Q.defer();
usersDb.findAll(function(err, allUsers) {
      if (err) deferred.reject(err);

      if (allUsers.length){
        var user_str = JSON.stringify(allUsers);
         var user_final = JSON.parse(user_str);
         console.log(user_final);
        deferred.resolve(user_final)
      }
  });
return deferred.promise;

}
function update(_id, userParam) {
    var deferred = Q.defer();
    var predicate = {id:_id};
    // validation
    usersDb.where(predicate, function (err, user) {
        if (err) deferred.reject(err);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            usersDb.where(
                { username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err);

                    if (user.length) {
                        // username already exists
                        deferred.reject('Username "' + userParam.username + '" est déjà pris');
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            username: userParam.username,
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        usersDb.save(
            { id: _id },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    usersDb.where(
        { id: _id },
        function (err,node) {
            db.delete(node, function(err) {
            if (!err) console.log('node a été suprimé');
            });
        });

    return deferred.promise;
}
