var config = require('config.json');
var express = require('express');
var router = express.Router();
var challengeService = require('services/challenge.service');

// routes
router.post('/save', registerChallenge);
router.get('/list',getAll);
router.post('/update',update);
// router.get('/update_challenge/:_id', updateChallenge);
// router.get('/delete_challenge/:_id', deleteChallenge);
// router.get('/list_challenge_new', listNewChallenge);

router.post('/participate/:id_user/:id_challenge', participate);

module.exports = router;

function registerChallenge(req, res) {
    challengeService.create(req.body)
        .then(function (ch) {
            res.status(200).send(ch[0]);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req,res){
challengeService.update(req.body)
.then(function (ch) {
    res.status(200).send(ch);
})
.catch(function (err) {
    res.status(400).send(err);
});
}


function getAll(req,res){
  challengeService.list()
  .then(function(ch){
    res.status(200).send(ch);
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
