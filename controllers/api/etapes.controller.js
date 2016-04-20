var config = require('config.json');
var express = require('express');
var router = express.Router();
var etapeService = require('services/etape.service');

// routes
router.post('/add', registerEtape);
router.get('/current_etape', getCurrentEtape);


module.exports = router;

function registerEtape(req, res) {
    etapeService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentEtape(req, res) {
      console.log(req.headers);
    etapeService.getById(req.headers.id)

        .then(function (etape) {
            if (etape) {
                res.send(etape);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
