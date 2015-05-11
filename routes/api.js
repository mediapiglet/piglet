var express = require('express');
var router = express.Router();
/**
 *
 *
 * Created by marcus on 09/05/15.
 */


/* GET home page. */
router.get('/:version', function (req, res, next) {

    console.log(req);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({a: 1}));

});


function listDir(pathName) {
    fs.readdir(pathName, function (err, fileArray) {
        var isDir = false;
        fileArray.forEach(function (file) {
            var fullPath = pathName + '/' + file;
            var thisFile = {};
            thisFile.name = file;
            thisFile.fullname = fullPath;
            isDir = fs.lstatSync(fullPath).isDirectory();
            if (isDir) {
            }
        });
    });
}
