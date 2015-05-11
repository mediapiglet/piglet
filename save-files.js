var recursive = require('recursive-readdir');
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

var id3 = require('id3js');
process.on('uncaughtException', function (exception) {
    // handle or ignore error
});



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
                        thisFile.relPath = file.replace(/\/media\/marcus\/Elements\/mdt\/mp3/,'');
                        thisFile.path = file;
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
