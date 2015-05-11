var recursive = require('recursive-readdir');
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

var id3 = require('id3js');
process.on('uncaughtException', function (exception) {
    // handle or ignore error
});



saveId3 = function() {
    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }
        var filesCollection = db.collection('music_files');
        var filesCur = filesCollection.find({meta:0});

        var total = 0;
        console.log('Here');
        filesCur.forEach(function(file) {
            if(file) {
                id3({file: file.path, type: id3.OPEN_LOCAL}, function (err, tags) {
                    var metaCollection = db.collection('music_files_meta');
                    var metaDoc = {};
                    metaDoc.path = file.path;
                    metaDoc.data = tags;
                    metaCollection.insertOne(metaDoc,{},function(err,doneData) {
                        total++;
                        console.log(total);
                    });
                    // tags now contains your ID3 tags
                });
            }
        });
    });

};
savePaths = function () {

    MongoClient.connect("mongodb://localhost:27017/piglet", function (err, db) {
        if (err) {
            console.error(err);
        }

        var filesCollection = db.collection('music_files');

        recursive('/media/marcus/Elements/mdt/mp3', function (err, files) {
            // Files is an array of filename
            var totalFiles = files.length;
            var savedMusicFiles = 0;
            // console.log('Found '+ totalFiles+' files');
            files.forEach(function (file) {
                var thisExt = file.split('.').pop();

                switch (thisExt) {
                    case 'mp3':
                    case 'MP3':
                        savedMusicFiles++;
                        var thisFile = {};
                        var pathBuffer = new Buffer(file);
                        var pathBase64 = pathBuffer.toString('base64');
                        thisFile.path = file.replace(/\/media\/marcus\/Elements\/mdt\/mp3/,'');
                        thisFile.encPath = pathBase64;
                        console.log(thisFile);
                        thisFile.meta = 0;
                        filesCollection.insertOne(thisFile, {}, function (err, doneData) {

                        });
                        totalFiles--;
                        if (totalFiles === 0) {
                            console.log('Saved files');
                        }
                        break;
                }

            });
        });
    });
};
savePaths();
//saveId3();
