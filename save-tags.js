var recursive = require('recursive-readdir');
var MongoClient = require('mongodb');
var execSync = require('exec-sync');
var ObjectId = require('mongodb').ObjectID;

var id3 = require('id3js');
process.on('uncaughtException', function (exception) {
    // handle or ignore error
});


var file = '/media/marcus/Elements/mdt/mp3/Alien Project - Aztechno Dream (2002)/04.Alien Project - Silent Running.mp3';
getTag = function (file) {
    id3({file: file, type: id3.OPEN_LOCAL}, function (err, tags) {
        dump(tags);
    });
};
saveLength = function () {
    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }
        var filesCollection = db.collection('music_files');
        var filesCur = filesCollection.find();

        var total = 0;
        filesCur.forEach(function (file) {
            var fileMp3Out = execSync
        });
    });

};
saveId3 = function () {
    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }
        var filesCollection = db.collection('music_files');
        var filesCur = filesCollection.find();

        var total = 0;
        filesCur.forEach(function (file) {
            if (file) {

                id3({file: file.path, type: id3.OPEN_LOCAL}, function (err, tags) {
                    if (err) {
                        console.log(err);
                    }
                    var bobFile = '/media/marcus/Elements/mdt/mp3/Bob Marley - Complete Discography From 1967 To 2002 [33 Full Albums] (Mp3 256Kbps)/Bob Marley - 1977 - Live From London/01 - Trenchtown Rock.mp3';

                    var metaCollection = db.collection('music_files_meta');
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
            }
        });
    });

};

cleanTags = function (tags) {


};
//saveId3();

getTag(file);


dump = function (data) {
    console.log(typeof(data));
    console.log(data);
};
