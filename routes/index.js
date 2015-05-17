var fs = require('fs');
var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

var config = require('../config/piglet.json');
console.log('Starting Piglet with base path: '+config.piglet.mediaDirectory);


/* GET home page. */
router.get('/', function (req, res, next) {

    console.log(req.session);
    res.render('index.html', {
        title: 'Piglet'
    });
});
router.get('/video', function (req, res, next) {

    res.render('video.html', {
        title: 'Piglet Video'
    });
});

router.post('/login', function (req, res, next) {

    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }
        var userCollection = db.collection('users');
        var loginUser = req.body.username;
        userCollection.findOne({username: loginUser}, {}, function (err, userData) {
            if (err) {
                console.log('Error');
                console.error(err);
            }
            if (userData) {
                console.log(userData);
                req.session.userData = userData;
            } else {
                var userData = {};
                userData.username = loginUser;
                userCollection.insertOne(userData, function (err, result) {
                    if (err) {
                        console.error(err);
                    }
                    console.log(result);
                });
            }
        })
    });


});

/* API */
router.get('/api/:version/playlists/list', function (req, res, next) {
    console.log('Called list playlists');
    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }
        var playlistCollection = db.collection('playlists');
        var response = {};
        response.playlists = [];
        var playRes = playlistCollection.find({});
        playRes.each(function (err, thisRow) {
            if (thisRow) {
                response.playlists.push(thisRow);
            } else {
                res.send(response.playlists);
            }
        });
    });
});

router.get('/api/:version/music/filedata/:encPath', function (req, res, next) {
    var encPath = req.params.encPath;
    console.log('Called get filedata');
    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }
        var playlistCollection = db.collection('music_files_meta');
        playlistCollection.findOne({
            encPath: encPath
        }, function (err, fileData) {
            if (fileData) {
                fileData.filename = fileData.path.split('\\').pop().split('/').pop();
                res.send(fileData);
            } else {
                var noData = {};
                noData.status = 1;
                res.send(noData);
            }

        });
    });

});
router.get('/api/:version/music/search/:query/:artist?', function (req, res, next) {
    var query = req.params.query;
    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
            return false;
        }
        var metaCollection = db.collection('music_files_meta');
        var returnArray = [];
        metaCollection.aggregate([
            {
                $match: {
                    $or: [
                        {'path': {$regex: query, $options: 'i'}},
                        {'data.artist': {$regex: query, $options: 'i'}},
                        {'data.title': {$regex: query, $options: 'i'}},
                        {'data.album': {$regex: query, $options: 'i'}}
                    ]
                }
            }
        ], function (err, resArray) {
            if (err) {
                console.log(err);
            }

            if (!resArray) {
                var result = {};
                result.result = 1;
                returnArray.push(result.result);
                res.send(returnArray);
            } else {
                var albums = {}, artists = {};
                var albumArray = [];
                var numberAlbums = 0, numberArtists = 0;
                resArray.forEach(function (metaRow) {
                    var thisMeta = {};
                    thisMeta._id = metaRow.path;
                    thisMeta.encPath = metaRow.encPath;
                    thisMeta.filename = metaRow.path.split('\\').pop().split('/').pop();
                    thisMeta.title = metaRow.data.title;
                    thisMeta.album = metaRow.data.album;
                    thisMeta.artist = metaRow.data.artist;
                    if (thisMeta.title === '' || (!thisMeta.title)) {
                        thisMeta.title = thisMeta.filename;
                    }
                    if (thisMeta.album === '' || (!thisMeta.album)) {
                        thisMeta.album = 'Unknown';
                    }
                    if (thisMeta.artist === '' || (!thisMeta.artist)) {
                        thisMeta.artist = '-';
                    }
                    var album = thisMeta.album;
                    var artist = thisMeta.artist;
                    if (!albums[album]) {
                        albums[album] = 0;
                        numberAlbums++;
                    }
                    if (!artists[artist]) {
                        artists[artist] = 0;
                        numberArtists++;
                    }
                    albums[album]++;
                    artists[artist]++;
                    returnArray.push(thisMeta);

                });
                for (var album in albums) {
                    var thisAlbum = {};
                    thisAlbum.name = album;
                    thisAlbum.number = albums[album];
                    albumArray.push(thisAlbum);
                }

                var output = {};
                output.numberAlbums = numberAlbums;
                output.numberArtists = numberArtists;
                output.allResults = returnArray;
                // output.albumResults = albumArray;
                output.albums = albumArray;
                res.send(output);
            }

        });
        /*
         metaCollection.find({
         $or: [
         {path: {$regex: query, $options : 'i' }},
         {'data.artist': {$regex: query, $options : 'i' }}
         ]
         }).sort({'data.album':1}).toArray(function (err, resArray) {
         resArray.forEach(function (metaRow) {
         var thisMeta = {};
         thisMeta.path = metaRow.path;
         thisMeta.title = metaRow.data.title;
         thisMeta.album = metaRow.data.album;
         thisMeta.artist = metaRow.data.artist;
         returnArray.push(thisMeta);
         });
         res.send(returnArray);
         });
         */
    });
});
router.get('/api/:version/playlists/load/:playlistId', function (req, res, next) {
    var playlistId = req.params.playlistId;
    console.log('Called playlist load ' + playlistId);
    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
            return false;
        }
        var playlistCollection = db.collection('playlists');
        var listCur = playlistCollection.find({_id: ObjectId(playlistId)});
        listCur.forEach(function (listRow) {
            if (listRow) {
                var result = listRow;
            }
            console.log('Sending result');
            res.send(result);
        });
    });
});
router.post('/api/:version/playlists/save', function (req, res, next) {
    console.log('Called playlist save');
    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }
        var playlistCollection = db.collection('playlists');
        var playlist = {};
        playlist.files = [];
        playlist.name = req.body.playlistName;
        for (var i = 0; i < req.body.files.length; i++) {
            var thisFile = {};
            thisFile.file = req.body.files[i];
            thisFile.filename = req.body.filenames[i];
            playlist.files.push(thisFile);
        }
        console.log('Saving playlist');
        console.log(playlist);
        playlistCollection.update({name: req.body.playlistName},playlist,{upsert:true}, function (err, result) {
            if (err) {
                console.error(err);
            }
            res.send(JSON.stringify(result));
        });
    });
});
router.get('/api/:version/users/:username?', function (req, res, next) {
    if (req.params.username) {

        MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
            if (err) {
                console.error(err);
            }
            var userCollection = db.collection('users');
            var loginUser = req.body.username;
            userCollection.findOne({username: loginUser}, function (err, userData) {
                if (err) {
                    console.log('Error');
                    console.error(err);
                }
                if (userData) {
                    console.log(userData);
                    req.session.userData = userData;
                }
            })
        });


    }

});
router.get('/api/:version/media/list/:filePath/:previousPath?', function (req, res, next) {
    var apiVersion = req.params.version;
    var response = {
        debug: {
            apiVersion: apiVersion,
            requestParams: req.params
        }
    };
    if(req.params.filePath==='base') {
        var pathBuffer = new Buffer(config.piglet.mediaDirectory);
        var pathBase64 = pathBuffer.toString('base64');
        req.params.filePath = pathBase64;

    }
    response.dirRecords = [];
    response.fileRecords = [];
    if (req.params.filePath) {
        response.filePath = new Buffer(req.params.filePath, 'base64').toString(); // Ta-da
    }
    if (req.params.previousPath) {
        var backDir = {};
        //if (response.filePath !== '/media/marcus/Elements/mdt/mp3') {
        if (response.filePath !== config.piglet.mediaDirectory) {


            response.parent = getParent(response.filePath);
            response.previousPath = new Buffer(response.parent).toString('base64'); // Ta-da

            backDir.folder = "<span data-role='selectDir' data-dir='" + response.previousPath + "' data-parent='" + req.params.previousPath + "' ><i class='icon ion-arrow-left-a'> </i> Back </span";
            response.dirRecords.push(backDir);
        }
    }


    scanDir(response.filePath, function (currentLists) {
        currentLists.dir.forEach(function (dirRow) {

            dirRow.name = dirRow.name.replace(/_/g, " ");
            dirRow.name = dirRow.name.replace(/\./g, " ");
            var thisDir = {};
            var pathBuffer = new Buffer(dirRow.fullname);
            var pathBase64 = pathBuffer.toString('base64');
            thisDir.folder = "<span data-role='selectDir' data-dir='" + pathBase64 + "' data-parent='" + req.params.filePath + "'><i class='icon ion-folder'> </i>" + dirRow.name + "</span";
            thisDir.options = "";
            response.dirRecords.push(thisDir);
        });
        currentLists.files.forEach(function (fileRow) {
            fileRow.name = fileRow.name.replace(/\.mp3/gi, "Zmp3");
            fileRow.name = fileRow.name.replace(/\.mp4/gi, "Zmp4");
            fileRow.name = fileRow.name.replace(/_/g, " ");
            fileRow.name = fileRow.name.replace(/\./g, " ");
            fileRow.name = fileRow.name.replace(/Zmp3/gi, ".mp3");
            fileRow.name = fileRow.name.replace(/Zmp4/gi, ".mp4");
            var thisFile = {};
            var pathBuffer = new Buffer(fileRow.fullname);
            var pathBase64 = pathBuffer.toString('base64');
            thisFile.file = "<span data-file-type='fileList' class='selectfile' data-role='selectFile' data-file='" + pathBase64 + "' data-parent='" + req.params.filePath + "'>" + fileRow.name + "</span";
            thisFile.playlist = "<span data-role='addToPlaylist' data-file='" + pathBase64 + "' data-filename='" + fileRow.name + "' data-parent='" + req.params.filePath + "'><i class='icon ion-plus'> </i></span";
            response.fileRecords.push(thisFile);
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(
            JSON.stringify(
                response
            )
        );
    });

});

module.exports = router;


function listDir(pathName, callback) {
    fs.readdir(pathName, function (err, fileArray) {
        var isDir = false;
        var dirList = [];
        fileArray.forEach(function (file) {
            var fullPath = pathName + '/' + file;
            var thisFile = {};
            thisFile.name = file;
            thisFile.fullname = fullPath;
            isDir = fs.lstatSync(fullPath).isDirectory();
            if (isDir) {
                dirList.push(thisFile);
            }
        });
        callback(dirList);
    });
}

function scanDir(pathName, callback) {
    console.log(pathName);
    fs.readdir(pathName, function (err, fileArray) {
        var isDir = false;
        var isSym = false;
        var dirCount = 0;
        var fileCount = 0;
        var dirList = [];
        var fileList = [];
        fileArray.forEach(function (file) {
            var fullPath = pathName + '/' + file;
            var thisFile = {};
            thisFile.name = file;
            thisFile.fullname = fullPath;
            isDir = fs.lstatSync(fullPath).isDirectory()
            isSym = fs.lstatSync(fullPath).isSymbolicLink();
            if (isDir || isSym) {
                dirCount++;
                dirList.push(thisFile);
            } else {
                fileCount++;
                fileList.push(thisFile);
            }
        });
        dirList.sort(sort_by('name', false, function (a) {
            return a.toUpperCase()
        }));
        fileList.sort(sort_by('name', false, function (a) {
            return a.toUpperCase()
        }));
        var currentLists = {};
        currentLists.dir = dirList;
        currentLists.files = fileList;

        callback(currentLists);
    });


}
function getParent(path) {
    var the_arr = path.split('/');
    the_arr.pop();
    return ( the_arr.join('/') );
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
