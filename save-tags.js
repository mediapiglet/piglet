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

cleanTags = function (tags) {


};
//saveId3();

getTag(file);


dump = function (data) {
    console.log(typeof(data));
    console.log(data);
};
