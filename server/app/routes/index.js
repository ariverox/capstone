'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/games', require('./games'));
router.use('/cards', require('./cards'));
router.use('/users', require('./users'));
router.use('/decks', require('./decks'));
router.use('/createCardGame', require('./createCardGame'));


// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
