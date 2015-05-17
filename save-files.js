var recursive = require('recursive-readdir');
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

var id3 = require('id3js');
process.on('uncaughtException', function (exception) {
    // handle or ignore error
});

var config = require('./config/piglet.json');
console.log(config.piglet.mediaDirectory);

saveId3 = function () {
    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }
        var filesCollection = db.collection('music_files');
        var filesCur = filesCollection.find();


        var total = 0;
        var metaCollection = db.collection('music_files_meta');
        metaCollection.remove({}, {}, function (err, removeResult) {
            if (err) {
                console.error(err);
            }
            filesCur.forEach(function (file) {
                if (file) {

                    id3({file: file.path, type: id3.OPEN_LOCAL}, function (err, tags) {
                        if (err) {
                            console.log(err);
                        }

                        var metaDoc = {};
                        metaDoc.path = file.path;
                        metaDoc.relPath = file.relPath;
                        metaDoc.encPath = file.encPath;
                        metaDoc.data = tags;

                        metaDoc.data.v2.image = null;
                        if (metaDoc.data.title) {
                            metaDoc.data.title = metaDoc.data.title.replace(/[^ -~]+/g, "");
                            metaDoc.data.title = metaDoc.data.title.replace(/\u0000/g, "");
                        }
                        if (metaDoc.data.album) {
                            metaDoc.data.album = metaDoc.data.album.replace(/[^ -~]+/g, "");
                            metaDoc.data.album = metaDoc.data.album.replace(/\u0000/g, "");
                        }
                        if (metaDoc.data.artist) {
                            metaDoc.data.artist = metaDoc.data.artist.replace(/\u0000/g, "");
                            metaDoc.data.artist = metaDoc.data.artist.replace(/[^ -~]+/g, "");
                        }
                        if (metaDoc.data.year) {
                            metaDoc.data.year = metaDoc.data.year.replace(/\u0000/g, "");
                        }
                        metaCollection.insertOne(metaDoc, function (err, doneData) {
                            if (err) {
                                console.log(err);
                            }
                            total++;
                        });
                    });
                } else {
                    console.log('Saved ID3 tags');
                }
            });
        });
    });

};


savePaths = function () {
    console.log('Called savePaths');

    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }

        var filesCollection = db.collection('music_files');

        // empty
        console.log('emptying');
        filesCollection.remove({}, {}, function (err, removeResult) {
            if (err) {
                console.error(err);
            }
            recursive(config.piglet.mediaDirectory, function (err, files) {
                // Files is an array of filename
                var totalFiles = files.length;
                var savedMusicFiles = 0;
                // console.log('Found '+ totalFiles+' files');
                files.forEach(function (file) {
                    if (!file) {
                        saveId3();

                    }
                    var thisExt = file.split('.').pop();

                    switch (thisExt) {
                        case 'mp3':
                        case 'MP3':
                            savedMusicFiles++;
                            var thisFile = {};
                            var pathBuffer = new Buffer(file);
                            var pathBase64 = pathBuffer.toString('base64');
                            thisFile.relPath = file.replace(/\/media\/marcus\/Elements\/mdt\/mp3/, '');
                            thisFile.path = file;
                            thisFile.encPath = pathBase64;
                            thisFile.meta = 0;
                            filesCollection.insertOne(thisFile, {}, function (err, doneData) {

                            });
                            totalFiles--;
                            if (totalFiles === 0) {
                            }
                            break;
                    }

                });
            });
        });
    });
};

savePaths();
