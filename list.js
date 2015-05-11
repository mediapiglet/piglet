/**
 *
 * Created by marcus on 01/05/15.
 */


var fs = require('fs');


var config = {
    dataDir: '/data'
};


if (!config) {
    console.error('No config found');
    process.exit(1);
}

if (!config.dataDir) {
    console.error('No config for dataDir found');
    process.exit(1);
}
if (!fs.lstatSync(config.dataDir).isDirectory()) {
    console.error('dataDir NOT found');
    process.exit(1);
}


var basePath = config.dataDir;
var currentPath = '';

var activePath = basePath + '' + currentPath;


scanDir(activePath, function (err, pathInfo) {
    console.log(pathInfo);
});

var fileList = [];
var dirList = [];

var fileCount = 0;
var dirCount = 0;

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
function scanDir(pathName) {
    fs.readdir(pathName, function (err, fileArray) {
        var isDir = false;
        fileArray.forEach(function (file) {
            var fullPath = pathName + '/' + file;
            var thisFile = {};
            thisFile.name = file;
            thisFile.fullname = fullPath;
            isDir = fs.lstatSync(fullPath).isDirectory();
            if (isDir) {
                dirCount++;
                dirList.push(thisFile);
                scanDir(thisFile.fullname);
            } else {
                fileCount++;
                fileList.push(thisFile);
            }
            console.log('Files: ' + fileCount + ' Dir: ' + dirCount);
        });
        dirList.sort(sort_by('name', false, function (a) {
            return a.toUpperCase()
        }));
        fileList.sort(sort_by('name', false, function (a) {
            return a.toUpperCase()
        }));
    });


}

var sort_by = function (field, reverse, primer) {

    var key = primer ?
        function (x) {
            return primer(x[field])
        } :
        function (x) {
            return x[field]
        };

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
};