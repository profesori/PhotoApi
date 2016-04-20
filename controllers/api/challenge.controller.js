var config = require('config.json');
var express = require('express');
var router = express.Router();
var challengeService = require('services/challenge.service');

// routes
router.post('/add', registerChallenge);
router.get('/current_challenge', getCurrentChallenge);
// router.get('/update_challenge/:_id', updateChallenge);
// router.get('/delete_challenge/:_id', deleteChallenge);
// router.get('/list_challenge_new', listNewChallenge);

router.post('/participate/:id_user/:id_challenge', participate);



module.exports = router;

function registerChallenge(req, res) {
    challengeService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentChallenge(req, res) {
      console.log(req.headers);
    challengeService.getById(req.headers.id)

        .then(function (challenge) {
            if (challenge) {
                res.send(challenge);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function participate(req,res){
  console.log(req.params);
  var iduser = req.params.id_user;
  var idchallenge= req.params.id_challenge;
    challengeService.userParticipate(iduser,idchallenge)
    .then(function(){
      res.sendStatus(200);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });

}
