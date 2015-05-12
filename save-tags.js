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
                    var metaCollection = db.collection('music_files_meta_laptop');
                    var metaDoc = {};
                    metaDoc.path = file.path;
                    metaDoc.relPath = file.relPath;
                    metaDoc.encPath = file.encPath;
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
saveId3();
