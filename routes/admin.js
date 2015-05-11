/**
 *
 * Created by marcus on 05/05/15.
 */

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Admin routing');
});

module.exports = router;
